package com.example.batchupdater;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;

@SpringBootApplication
@EnableAsync
public class BatchLocationUpdaterApplication {
    public static void main(String[] args) {
        SpringApplication.run(BatchLocationUpdaterApplication.class, args);
    }
}
