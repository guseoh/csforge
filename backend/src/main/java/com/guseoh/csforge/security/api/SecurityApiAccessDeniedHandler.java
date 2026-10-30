package com.guseoh.csforge.security.api;

import java.io.IOException;
import java.time.Instant;
import java.util.List;

import com.guseoh.csforge.global.api.ApiError;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.web.access.AccessDeniedHandler;

/** 인증되었지만 허용되지 않은 API 요청을 SPA가 해석할 수 있는 JSON으로 응답한다. */
public final class SecurityApiAccessDeniedHandler implements AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public SecurityApiAccessDeniedHandler(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    @Override
    public void handle(
            HttpServletRequest request,
            HttpServletResponse response,
            AccessDeniedException exception) throws IOException, ServletException {
        response.setStatus(HttpServletResponse.SC_FORBIDDEN);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        objectMapper.writeValue(response.getOutputStream(), new ApiError(
                Instant.now(),
                HttpServletResponse.SC_FORBIDDEN,
                "ACCESS_DENIED",
                "Access is denied",
                request.getRequestURI(),
                List.of()));
    }
}
