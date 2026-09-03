package com.guseoh.csforge;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/** CSForge backend 애플리케이션 진입점이다. */
@SpringBootApplication(excludeName = {
        "org.springframework.boot.elasticsearch.autoconfigure.ElasticsearchClientAutoConfiguration",
        "org.springframework.boot.elasticsearch.autoconfigure.ElasticsearchRestClientAutoConfiguration"
})
public class CsforgeApplication {

    public static void main(String[] args) {
        SpringApplication.run(CsforgeApplication.class, args);
    }
}
