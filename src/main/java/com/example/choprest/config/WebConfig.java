package com.example.choprest.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

import java.io.File;

/**
 * 웹 설정
 */
@Configuration
public class WebConfig implements WebMvcConfigurer {
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // uploads 폴더의 절대 경로 가져오기
        File uploadsDir = new File("uploads");
        String absolutePath = uploadsDir.getAbsolutePath();
        
        // Windows에서는 \를 /로 변환
        String normalizedPath = absolutePath.replace("\\", "/");
        if (!normalizedPath.endsWith("/")) {
            normalizedPath += "/";
        }
        
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:" + normalizedPath)
                .setCachePeriod(3600); // 1시간 캐시
    }
}



