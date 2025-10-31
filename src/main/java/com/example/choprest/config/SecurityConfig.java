package com.example.choprest.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Spring Security 설정
 * API 서버이므로 CSRF를 비활성화하고 세션을 사용하지 않습니다.
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {
    
    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable()) // API 서버이므로 CSRF 비활성화
            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS) // 세션 사용 안 함
            )
            .authorizeHttpRequests(auth -> auth
                .anyRequest().permitAll() // 모든 요청 허용 (필요에 따라 수정)
            );
        
        return http.build();
    }
}

