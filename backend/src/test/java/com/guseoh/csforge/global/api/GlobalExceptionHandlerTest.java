package com.guseoh.csforge.global.api;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.guseoh.csforge.importcontent.application.CanonicalContentSourceException;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.List;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.multipart.support.MissingServletRequestPartException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/** GlobalExceptionHandler의 표준 Spring MVC 오류 매핑과 고정 Clock 타임스탬프를 검증한다. */
class GlobalExceptionHandlerTest {

    private static final Instant FIXED_NOW = Instant.parse("2026-11-26T12:00:00Z");
    private final GlobalExceptionHandler handler =
            new GlobalExceptionHandler(Clock.fixed(FIXED_NOW, ZoneOffset.UTC));

    @Test
    void mapsStandardSpringMvcClientErrorsInsteadOfReturning500() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/unknown");

        var notFound = handler.handleNoResourceFound(
                new NoResourceFoundException(HttpMethod.GET, "/api/unknown", "unknown"), request);
        assertEquals(404, notFound.getStatusCode().value());
        assertEquals("RESOURCE_NOT_FOUND", notFound.getBody().code());
        assertEquals(FIXED_NOW, notFound.getBody().timestamp());

        var methodNotAllowed = handler.handleMethodNotSupported(
                new HttpRequestMethodNotSupportedException("DELETE", List.of("GET", "POST")), request);
        assertEquals(405, methodNotAllowed.getStatusCode().value());
        assertEquals("METHOD_NOT_ALLOWED", methodNotAllowed.getBody().code());

        var unsupportedMedia = handler.handleMediaTypeNotSupported(
                new HttpMediaTypeNotSupportedException(MediaType.TEXT_PLAIN, List.of(MediaType.APPLICATION_JSON)),
                request);
        assertEquals(415, unsupportedMedia.getStatusCode().value());
        assertEquals("UNSUPPORTED_MEDIA_TYPE", unsupportedMedia.getBody().code());

        var missingPart = handler.handleBadRequest(new MissingServletRequestPartException("files"), request);
        assertEquals(400, missingPart.getStatusCode().value());
        assertEquals("INVALID_REQUEST", missingPart.getBody().code());
    }

    @Test
    void mapsCanonicalContentSourceFailureTo503AndUnexpectedTo500() {
        MockHttpServletRequest request = new MockHttpServletRequest("POST", "/api/bootstrap");

        var unavailable = handler.handleCanonicalContentSource(
                new CanonicalContentSourceException("manifest missing"), request);
        assertEquals(503, unavailable.getStatusCode().value());
        assertEquals("CANONICAL_CONTENT_UNAVAILABLE", unavailable.getBody().code());
        assertEquals(FIXED_NOW, unavailable.getBody().timestamp());

        var unexpected = handler.handleUnexpected(new IllegalStateException("boom"), request);
        assertEquals(500, unexpected.getStatusCode().value());
        assertEquals("API_ERROR", unexpected.getBody().code());
    }
}
