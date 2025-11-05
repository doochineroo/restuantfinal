package com.example.choprest.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
import org.springframework.web.servlet.config.annotation.ViewControllerRegistry;

import java.io.File;

@Configuration
public class WebMvcConfig implements WebMvcConfigurer {
    
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedOrigins("*")
                .allowedHeaders("*")
                .allowCredentials(false)
                .maxAge(86400);
    }
    
    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        // VM 외부 디렉토리 경로 (우선순위 높음)
        String userHome = System.getProperty("user.home");
        String externalStaticPath = userHome + "/chopplan/static/";
        
        // Windows 경로 처리를 위해 \를 /로 변환
        String normalizedPath = externalStaticPath.replace("\\", "/");
        if (!normalizedPath.endsWith("/")) {
            normalizedPath += "/";
        }
        
        // 외부 디렉토리가 존재하면 사용, 없으면 classpath 사용
        File externalDir = new File(externalStaticPath);
        if (externalDir.exists() && externalDir.isDirectory()) {
            // 외부 디렉토리 사용 (VM 배포 시)
            // React 빌드 파일은 /static/js/, /static/css/ 경로로 요청됨
            // 실제 파일은 ~/chopplan/static/js/, ~/chopplan/static/css/에 있음
            registry.addResourceHandler("/static/**")
                    .addResourceLocations("file:" + normalizedPath)
                    .setCachePeriod(3600);
            registry.addResourceHandler("/css/**")
                    .addResourceLocations("file:" + normalizedPath + "css/")
                    .setCachePeriod(3600);
            registry.addResourceHandler("/js/**")
                    .addResourceLocations("file:" + normalizedPath + "js/")
                    .setCachePeriod(3600);
            registry.addResourceHandler("/images/**")
                    .addResourceLocations("file:" + normalizedPath + "images/")
                    .setCachePeriod(3600);
            
            // index.html과 루트 경로 처리
            registry.addResourceHandler("/index.html")
                    .addResourceLocations("file:" + normalizedPath)
                    .setCachePeriod(0);
            registry.addResourceHandler("/")
                    .addResourceLocations("file:" + normalizedPath + "index.html")
                    .setCachePeriod(0);
            
            // 기타 정적 파일들 (manifest.json, favicon.ico 등)
            registry.addResourceHandler("/*.html", "/*.json", "/*.ico", "/*.png", "/*.jpg", "/*.svg")
                    .addResourceLocations("file:" + normalizedPath)
                    .setCachePeriod(3600);
        } else {
            // classpath 사용 (로컬 개발 시)
            registry.addResourceHandler("/static/**")
                    .addResourceLocations("classpath:/static/");
            registry.addResourceHandler("/css/**")
                    .addResourceLocations("classpath:/static/css/");
            registry.addResourceHandler("/js/**")
                    .addResourceLocations("classpath:/static/js/");
            registry.addResourceHandler("/images/**")
                    .addResourceLocations("classpath:/static/images/");
        }
    }
    
    @Override
    public void addViewControllers(ViewControllerRegistry registry) {
        // SPA 라우팅을 위해 모든 경로를 index.html로 리다이렉트
        registry.addViewController("/").setViewName("forward:/index.html");
    }
}
