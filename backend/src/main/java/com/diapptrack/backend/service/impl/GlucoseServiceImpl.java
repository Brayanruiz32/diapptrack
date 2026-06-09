package com.diapptrack.backend.service.impl;

import com.diapptrack.backend.dto.request.GlucoseRequest;
import com.diapptrack.backend.dto.response.GlucoseResponse;
import com.diapptrack.backend.dto.response.PageResponse;
import com.diapptrack.backend.entity.GlucoseRecord;
import com.diapptrack.backend.entity.User;
import com.diapptrack.backend.exception.ResourceNotFoundException;
import com.diapptrack.backend.repository.GlucoseRecordRepository;
import com.diapptrack.backend.service.GlucoseService;
import com.diapptrack.backend.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class GlucoseServiceImpl implements GlucoseService {

    private final GlucoseRecordRepository glucoseRepo;
    private final UserService userService;

    @Value("${app.glucose.low-threshold}") private int lowThreshold;
    @Value("${app.glucose.high-threshold}") private int highThreshold;

    @Override
    @Transactional
    public GlucoseResponse create(String email, GlucoseRequest request) {
        User user = userService.getByEmail(email);
        GlucoseRecord record = GlucoseRecord.builder()
                .user(user)
                .measuredAt(request.getMeasuredAt())
                .valueMgdl(request.getValueMgdl())
                .notes(request.getNotes())
                .build();
        return toResponse(glucoseRepo.save(record));
    }

    @Override
    @Transactional
    public GlucoseResponse update(String email, Long id, GlucoseRequest request) {
        GlucoseRecord record = getOwned(email, id);
        record.setMeasuredAt(request.getMeasuredAt());
        record.setValueMgdl(request.getValueMgdl());
        record.setNotes(request.getNotes());
        return toResponse(glucoseRepo.save(record));
    }

    @Override
    @Transactional
    public void delete(String email, Long id) {
        glucoseRepo.delete(getOwned(email, id));
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<GlucoseResponse> getHistory(String email, LocalDateTime from, LocalDateTime to, Pageable pageable) {
        User user = userService.getByEmail(email);
        Page<GlucoseRecord> page = (from != null && to != null)
                ? glucoseRepo.findByUserAndMeasuredAtBetweenOrderByMeasuredAtDesc(user, from, to, pageable)
                : glucoseRepo.findByUserOrderByMeasuredAtDesc(user, pageable);
        return PageResponse.from(page.map(this::toResponse));
    }

    @Override
    @Transactional(readOnly = true)
    public GlucoseResponse getById(String email, Long id) {
        return toResponse(getOwned(email, id));
    }

    private GlucoseRecord getOwned(String email, Long id) {
        User user = userService.getByEmail(email);
        GlucoseRecord record = glucoseRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Registro de glucosa no encontrado"));
        if (!record.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Registro de glucosa no encontrado");
        }
        return record;
    }

    private GlucoseResponse toResponse(GlucoseRecord record) {
        return GlucoseResponse.from(record, lowThreshold, highThreshold);
    }
}
