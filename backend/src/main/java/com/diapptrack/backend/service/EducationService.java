package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.request.EducationContentRequest;
import com.diapptrack.backend.dto.response.EducationContentResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.entity.EducationContent;
import org.springframework.data.domain.Pageable;
import org.springframework.web.multipart.MultipartFile;

public interface EducationService {
    PageResponse<EducationContentResponse> getAll(String email, EducationContent.Topic topic,
                                                   EducationContent.ContentType type, Pageable pageable);
    EducationContentResponse getById(String email, Long id);
    void markAsRead(String email, Long id);
    long getUnreadCount(String email);

    // Admin
    EducationContentResponse create(EducationContentRequest request);
    EducationContentResponse update(Long id, EducationContentRequest request);
    EducationContentResponse uploadImage(Long id, MultipartFile file);
    void delete(Long id);
}
