package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.EducationContentRequest;
import com.diapptrack.backend.dto.response.EducationContentResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.entity.EducationContent;
import com.diapptrack.backend.entity.EducationView;
import com.diapptrack.backend.entity.User;
import com.diapptrack.backend.exception.BusinessException;
import com.diapptrack.backend.exception.ResourceNotFoundException;
import com.diapptrack.backend.repository.EducationContentRepository;
import com.diapptrack.backend.repository.EducationViewRepository;
import com.diapptrack.backend.service.EducationService;
import com.diapptrack.backend.service.NotificationService;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;

@Service
@RequiredArgsConstructor
public class EducationServiceImpl implements EducationService {

    private final EducationContentRepository contentRepo;
    private final EducationViewRepository viewRepo;
    private final UserService userService;
    private final NotificationService notificationService;

    @Value("${app.upload-dir}")
    private String uploadDir;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<EducationContentResponse> getAll(String email, EducationContent.Topic topic,
                                                          EducationContent.ContentType type, Pageable pageable) {
        User user = userService.getByEmail(email);
        Page<EducationContent> page;
        if (topic != null) {
            page = contentRepo.findByTopicOrderByPublishedAtDesc(topic, pageable);
        } else if (type != null) {
            page = contentRepo.findByTypeOrderByPublishedAtDesc(type, pageable);
        } else {
            page = contentRepo.findByOrderByPublishedAtDesc(pageable);
        }
        return PageResponse.from(page.map(c -> EducationContentResponse.from(c, viewRepo.existsByUserAndContent(user, c))));
    }

    @Override
    @Transactional
    public EducationContentResponse getById(String email, Long id) {
        User user = userService.getByEmail(email);
        EducationContent content = findContent(id);
        markAsRead(user, content);
        return EducationContentResponse.from(content, true);
    }

    @Override
    @Transactional
    public void markAsRead(String email, Long id) {
        User user = userService.getByEmail(email);
        markAsRead(user, findContent(id));
    }

    @Override
    @Transactional(readOnly = true)
    public long getUnreadCount(String email) {
        User user = userService.getByEmail(email);
        long total = contentRepo.count();
        long read = viewRepo.countByUser(user);
        return Math.max(0, total - read);
    }

    @Override
    @Transactional
    public EducationContentResponse create(EducationContentRequest request) {
        EducationContent content = EducationContent.builder()
                .title(request.getTitle())
                .body(request.getBody())
                .type(request.getType())
                .topic(request.getTopic())
                .readingTimeMinutes(request.getReadingTimeMinutes())
                .build();
        EducationContent saved = contentRepo.save(content);
        notificationService.notifyNewEducationContent(saved);
        return EducationContentResponse.from(saved, false);
    }

    @Override
    @Transactional
    public EducationContentResponse update(Long id, EducationContentRequest request) {
        EducationContent content = findContent(id);
        content.setTitle(request.getTitle());
        content.setBody(request.getBody());
        content.setType(request.getType());
        content.setTopic(request.getTopic());
        content.setReadingTimeMinutes(request.getReadingTimeMinutes());
        return EducationContentResponse.from(contentRepo.save(content), false);
    }

    @Override
    @Transactional
    public EducationContentResponse uploadImage(Long id, MultipartFile file) {
        EducationContent content = findContent(id);
        if (file == null || file.isEmpty()) {
            throw new BusinessException("El archivo de imagen está vacío");
        }
        String contentType = file.getContentType();
        if (contentType == null || !contentType.startsWith("image/")) {
            throw new BusinessException("El archivo debe ser una imagen");
        }
        try {
            Path dir = Paths.get(uploadDir, "education").toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String ext = extensionOf(file.getOriginalFilename());
            String filename = "edu_" + id + "_" + System.currentTimeMillis() + ext;
            Path target = dir.resolve(filename);
            Files.copy(file.getInputStream(), target, StandardCopyOption.REPLACE_EXISTING);

            content.setImageUrl("/uploads/education/" + filename);
            return EducationContentResponse.from(contentRepo.save(content), false);
        } catch (IOException e) {
            throw new BusinessException("No se pudo guardar la imagen: " + e.getMessage());
        }
    }

    @Override
    @Transactional
    public void delete(Long id) {
        contentRepo.delete(findContent(id));
    }

    private String extensionOf(String filename) {
        if (filename == null) return "";
        int dot = filename.lastIndexOf('.');
        return (dot >= 0) ? filename.substring(dot).toLowerCase() : "";
    }

    private void markAsRead(User user, EducationContent content) {
        if (!viewRepo.existsByUserAndContent(user, content)) {
            viewRepo.save(EducationView.builder().user(user).content(content).build());
        }
    }

    private EducationContent findContent(Long id) {
        return contentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contenido educativo no encontrado"));
    }
}
