package com.guseoh.csforge.security.api;

import com.guseoh.csforge.security.config.CloudSecurityProperties;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

/** cloud 백엔드의 로그인 진입을 프론트엔드 로그인 화면으로 연결한다. */
@Controller
@Profile("cloud")
public class CloudLoginController {

    private final String frontendOrigin;

    public CloudLoginController(CloudSecurityProperties properties) {
        this.frontendOrigin = removeTrailingSlash(properties.frontendOrigin());
    }

    @GetMapping("/login")
    public void login(HttpServletRequest request, HttpServletResponse response) throws IOException {
        String errorQuery = request.getParameterMap().containsKey("error") ? "?error" : "";
        response.sendRedirect(frontendOrigin + "/login" + errorQuery);
    }

    private String removeTrailingSlash(String origin) {
        return origin.endsWith("/") ? origin.substring(0, origin.length() - 1) : origin;
    }
}
