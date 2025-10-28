package com.example.choprest.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import lombok.extern.slf4j.Slf4j;

@Slf4j
@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "*")
public class ImageUploadController {

    private static final String UPLOAD_DIR = "uploads/";
    private static final String RESTAURANT_IMAGES_DIR = "restaurants/";
    private static final String MENU_IMAGES_DIR = "menus/";
    
    @PostMapping("/image")
    public ResponseEntity<Map<String, Object>> uploadImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 파일 유효성 검사
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "파일이 선택되지 않았습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 파일 타입 검사
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "이미지 파일만 업로드 가능합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 파일 크기 검사 (5MB 제한)
            if (file.getSize() > 5 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "파일 크기는 5MB를 초과할 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 타입별 디렉토리 결정
            String uploadPath;
            String fileUrl;
            
            if ("menu".equals(type)) {
                uploadPath = UPLOAD_DIR + MENU_IMAGES_DIR;
                fileUrl = "/uploads/" + MENU_IMAGES_DIR;
            } else {
                uploadPath = UPLOAD_DIR + RESTAURANT_IMAGES_DIR;
                fileUrl = "/uploads/" + RESTAURANT_IMAGES_DIR;
            }
            
            // 업로드 디렉토리 생성
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 고유한 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            Path filePath = Paths.get(uploadPath + filename);
            Files.copy(file.getInputStream(), filePath);

            // 응답 데이터
            response.put("success", true);
            response.put("message", "이미지가 성공적으로 업로드되었습니다.");
            response.put("fileUrl", fileUrl + filename);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            log.error("파일 업로드 오류: {}", e.getMessage());
            response.put("success", false);
            response.put("message", "파일 업로드 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/restaurant-image")
    public ResponseEntity<Map<String, Object>> uploadRestaurantImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("type") String type) { // main, menu1, menu2, menu3
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 파일 유효성 검사
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "파일이 선택되지 않았습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 파일 타입 검사
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "이미지 파일만 업로드 가능합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 파일 크기 검사 (5MB 제한)
            if (file.getSize() > 5 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "파일 크기는 5MB를 초과할 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 업로드 디렉토리 생성
            String uploadPath = UPLOAD_DIR + RESTAURANT_IMAGES_DIR;
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 고유한 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = type + "_" + UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            Path filePath = Paths.get(uploadPath + filename);
            Files.copy(file.getInputStream(), filePath);

            // 응답 데이터
            String fileUrl = "/uploads/" + RESTAURANT_IMAGES_DIR + filename;
            response.put("success", true);
            response.put("message", "이미지가 성공적으로 업로드되었습니다.");
            response.put("fileUrl", fileUrl);
            response.put("filename", filename);
            response.put("type", type);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "파일 업로드 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @PostMapping("/menu-image")
    public ResponseEntity<Map<String, Object>> uploadMenuImage(
            @RequestParam("file") MultipartFile file,
            @RequestParam("menuId") Long menuId) {
        
        Map<String, Object> response = new HashMap<>();
        
        try {
            // 파일 유효성 검사
            if (file.isEmpty()) {
                response.put("success", false);
                response.put("message", "파일이 선택되지 않았습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 파일 타입 검사
            String contentType = file.getContentType();
            if (contentType == null || !contentType.startsWith("image/")) {
                response.put("success", false);
                response.put("message", "이미지 파일만 업로드 가능합니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 파일 크기 검사 (5MB 제한)
            if (file.getSize() > 5 * 1024 * 1024) {
                response.put("success", false);
                response.put("message", "파일 크기는 5MB를 초과할 수 없습니다.");
                return ResponseEntity.badRequest().body(response);
            }

            // 업로드 디렉토리 생성
            String uploadPath = UPLOAD_DIR + MENU_IMAGES_DIR;
            File uploadDir = new File(uploadPath);
            if (!uploadDir.exists()) {
                uploadDir.mkdirs();
            }

            // 고유한 파일명 생성
            String originalFilename = file.getOriginalFilename();
            String extension = "";
            if (originalFilename != null && originalFilename.contains(".")) {
                extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            }
            String filename = "menu_" + menuId + "_" + UUID.randomUUID().toString() + extension;
            
            // 파일 저장
            Path filePath = Paths.get(uploadPath + filename);
            Files.copy(file.getInputStream(), filePath);

            // 응답 데이터
            String fileUrl = "/uploads/" + MENU_IMAGES_DIR + filename;
            response.put("success", true);
            response.put("message", "메뉴 이미지가 성공적으로 업로드되었습니다.");
            response.put("fileUrl", fileUrl);
            response.put("filename", filename);
            response.put("menuId", menuId);

            return ResponseEntity.ok(response);

        } catch (IOException e) {
            response.put("success", false);
            response.put("message", "파일 업로드 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }

    @DeleteMapping("/image")
    public ResponseEntity<Map<String, Object>> deleteImage(@RequestParam("fileUrl") String fileUrl) {
        Map<String, Object> response = new HashMap<>();
        
        try {
            // URL에서 파일 경로 추출
            String filePath;
            
            // 절대 URL인 경우 처리 (http://localhost:8080/uploads/...)
            if (fileUrl.startsWith("http://") || fileUrl.startsWith("https://")) {
                // URL에서 파일명 추출
                String fileName = fileUrl.substring(fileUrl.lastIndexOf('/') + 1);
                // 이미지가 restaurants/ 또는 menus/ 폴더에 있을 수 있으므로 확인
                if (fileUrl.contains("/restaurants/")) {
                    filePath = UPLOAD_DIR + RESTAURANT_IMAGES_DIR + fileName;
                } else if (fileUrl.contains("/menus/")) {
                    filePath = UPLOAD_DIR + MENU_IMAGES_DIR + fileName;
                } else {
                    // 기본적으로 restaurants 폴더에서 찾기
                    filePath = UPLOAD_DIR + RESTAURANT_IMAGES_DIR + fileName;
                }
            } else {
                // 상대 경로인 경우 (/uploads/... -> uploads/...)
                filePath = fileUrl.replace("/uploads/", UPLOAD_DIR);
            }
            
            File file = new File(filePath);
            
            log.info("Deleting image file: {}", filePath);
            
            if (file.exists()) {
                if (file.delete()) {
                    response.put("success", true);
                    response.put("message", "이미지가 성공적으로 삭제되었습니다.");
                } else {
                    response.put("success", false);
                    response.put("message", "파일 삭제에 실패했습니다.");
                }
            } else {
                response.put("success", false);
                response.put("message", "파일을 찾을 수 없습니다: " + filePath);
            }

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "파일 삭제 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
        }
    }
}

