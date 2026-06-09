package com.diapptrack.backend.service;

import com.diapptrack.backend.dto.response.HomeSummaryResponse;

public interface HomeService {
    HomeSummaryResponse getSummary(String email);
}
