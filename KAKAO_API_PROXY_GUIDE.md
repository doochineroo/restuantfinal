# 🔍 Kakao API 프록시를 통한 lat, lng, roadAddress 가져오기 및 DB 저장

## 📋 전체 플로우 개요

```
1. Restaurant 엔티티에 lat, lng, roadAddress가 NULL
2. Kakao API 호출 (프록시 서버를 통해)
3. API 응답에서 위도(lat), 경도(lng), 도로명 주소(roadAddress) 추출
4. Restaurant 엔티티 업데이트
5. 데이터베이스에 저장 (JPA save)
```

---

## 🏗️ 주요 코드 구조

### 1. Restaurant 엔티티 (`Restaurant.java`)

```java
@Entity
@Table(name = "restaurants")
public class Restaurant {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "restaurant_name")
    private String restaurantName;
    
    @Column(name = "branch_name")
    private String branchName;
    
    @Column(name = "lat")
    private Double lat;  // 위도 (Kakao API에서 가져옴)
    
    @Column(name = "lng")
    private Double lng;  // 경도 (Kakao API에서 가져옴)
    
    @Column(name = "road_address", length = 500)
    private String roadAddress;  // 도로명 주소 (Kakao API에서 가져옴)
    
    // ... 기타 필드들
}
```

---

### 2. RestaurantService - API 호출 및 DB 저장 (`RestaurantService.java`)

#### 핵심 메서드: `updateLocationInfoAndSave()`

```java
/**
 * 위치 정보 업데이트 및 데이터베이스 저장
 */
private Restaurant updateLocationInfoAndSave(Restaurant restaurant) {
    try {
        // 이미 위치 정보가 있는지 확인
        if (restaurant.getLat() != null && restaurant.getLng() != null && 
            restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
            log.info("Restaurant {} already has location info, skipping API call", restaurant.getRestaurantName());
            return restaurant;
        }
        
        // 데이터베이스에서 이미 저장된 정보가 있는지 확인
        Optional<Restaurant> existingRestaurant = restaurantRepository.findById(restaurant.getId());
        if (existingRestaurant.isPresent() && 
            existingRestaurant.get().getLat() != null && 
            existingRestaurant.get().getLng() != null && 
            existingRestaurant.get().getRoadAddress() != null && 
            !existingRestaurant.get().getRoadAddress().trim().isEmpty()) {
            log.info("Found existing location info in database for {}", restaurant.getRestaurantName());
            return existingRestaurant.get();
        }
        
        // 🔹 API 호출하여 위치 정보 업데이트
        updateLocationInfo(restaurant);
        
        // 🔹 데이터베이스에 저장
        Restaurant savedRestaurant = restaurantRepository.save(restaurant);
        log.info("Saved restaurant with location info: {}", savedRestaurant.getRestaurantName());
        
        return savedRestaurant;
    } catch (Exception e) {
        log.error("Error updating location info for {}: {}", restaurant.getRestaurantName(), e.getMessage());
        return restaurant;
    }
}
```

#### 핵심 메서드: `updateLocationInfo()` - Kakao API 호출

```java
/**
 * Kakao Local API를 사용하여 위도/경도/도로명 주소 업데이트
 */
private void updateLocationInfo(Restaurant restaurant) {
    try {
        // 1단계: 식당명 + 지역명으로 검색
        final String firstSearchQuery = restaurant.getRestaurantName() +
                (restaurant.getRegionName() != null && !restaurant.getRegionName().isEmpty()
                        ? " " + restaurant.getRegionName() : "");

        log.info("Searching Kakao API for: {}", firstSearchQuery);
        
        // API 호출 제한을 위한 지연 시간 (0.5초)
        Thread.sleep(500);

        // 🔹 Kakao API 호출 (프록시 서버 역할)
        KakaoApiResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("dapi.kakao.com")
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", firstSearchQuery)
                        .queryParam("size", "5")
                        .queryParam("category_group_code", "FD6") // 음식점 카테고리
                        .build())
                .header("Authorization", "KakaoAK " + kakaoApiKey)
                .retrieve()
                .bodyToMono(KakaoApiResponse.class)
                .block();

        log.info("Kakao API response for '{}': found {} results", firstSearchQuery, 
                response != null && response.getDocuments() != null ? response.getDocuments().size() : 0);

        // 🔹 API 응답에서 데이터 추출
        if (response != null && response.getDocuments() != null && !response.getDocuments().isEmpty()) {
            KakaoApiResponse.Document document = response.getDocuments().get(0);

            // 위도/경도 업데이트
            restaurant.setLat(Double.parseDouble(document.getY()));  // y = 위도(lat)
            restaurant.setLng(Double.parseDouble(document.getX()));  // x = 경도(lng)

            // 도로명 주소 업데이트
            String address = document.getRoadAddressName();
            if (address == null || address.trim().isEmpty()) {
                // 검색 결과에 도로명 주소가 없으면 Reverse Geocoding API 사용
                address = getDetailedAddressFromCoordinates(restaurant.getLat(), restaurant.getLng());
            } else {
                address = buildDetailedAddress(document.getRoadAddressName(), document.getAddressName());
            }
            restaurant.setRoadAddress(address);

            // 전화번호 업데이트 (선택사항)
            if (document.getPhone() != null && !document.getPhone().trim().isEmpty()) {
                restaurant.setPhoneNumber(document.getPhone());
            }

            log.info("✅ Updated location info: lat={}, lng={}, address={}", 
                    restaurant.getLat(), restaurant.getLng(), restaurant.getRoadAddress());
        } else {
            log.warn("❌ No location data found for: {}", firstSearchQuery);
            restaurant.setLat(null);
            restaurant.setLng(null);
            restaurant.setRoadAddress(null);
        }
        
    } catch (Exception e) {
        log.error("Error updating location info: {}", e.getMessage());
        restaurant.setLat(null);
        restaurant.setLng(null);
        restaurant.setRoadAddress(null);
    }
}
```

#### Reverse Geocoding API (좌표 → 주소)

```java
/**
 * 위도/경도로 상세한 도로명 주소 조회 (Kakao Reverse Geocoding API)
 */
private String getDetailedAddressFromCoordinates(Double lat, Double lng) {
    try {
        if (lat == null || lng == null) {
            return null;
        }

        log.info("Getting detailed address for coordinates: lat={}, lng={}", lat, lng);

        // 🔹 Reverse Geocoding API 호출
        KakaoReverseApiResponse response = webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("dapi.kakao.com")
                        .path("/v2/local/geo/coord2address.json")
                        .queryParam("x", lng.toString())
                        .queryParam("y", lat.toString())
                        .queryParam("input_coord", "WGS84")
                        .build())
                .header("Authorization", "KakaoAK " + kakaoApiKey)
                .retrieve()
                .bodyToMono(KakaoReverseApiResponse.class)
                .block();

        // 🔹 주소 추출
        if (response != null && response.getDocuments() != null && !response.getDocuments().isEmpty()) {
            KakaoReverseApiResponse.Document document = response.getDocuments().get(0);
            
            if (document.getRoadAddress() != null && document.getRoadAddress().getAddressName() != null) {
                return document.getRoadAddress().getAddressName();
            }
        }

        return null;
    } catch (Exception e) {
        log.error("Error getting detailed address: {}", e.getMessage());
        return null;
    }
}
```

---

### 3. RestaurantController - 프록시 엔드포인트 (`RestaurantController.java`)

#### 프록시 엔드포인트: `/api/restaurants/kakao/search`

```java
/**
 * 카카오 API 프록시 - 장소 검색
 * GET /api/restaurants/kakao/search?query=검색어
 * 
 * 사용 예시:
 * GET http://localhost:8080/api/restaurants/kakao/search?query=맥도날드%20강남
 */
@GetMapping("/kakao/search")
public Mono<ResponseEntity<String>> searchKakaoPlaces(@RequestParam(required = false) String query) {
    log.info("Kakao API proxy request for query: {}", query);
    
    if (query == null || query.trim().isEmpty()) {
        return Mono.just(ResponseEntity.badRequest()
            .body("{\"error\":\"Query parameter is required\"}"));
    }
    
    try {
        String kakaoApiKey = getNextApiKey(); // API 키 로테이션
        
        // 🔹 프록시 서버 역할: 클라이언트 요청을 Kakao API로 전달
        return webClient.get()
                .uri(uriBuilder -> uriBuilder
                        .scheme("https")
                        .host("dapi.kakao.com")
                        .path("/v2/local/search/keyword.json")
                        .queryParam("query", query)
                        .queryParam("category_group_code", "FD6") // 음식점
                        .queryParam("size", "15")
                        .build())
                .header("Authorization", kakaoApiKey)
                .retrieve()
                .bodyToMono(String.class)
                .map(ResponseEntity::ok)
                .doOnSuccess(response -> log.info("Kakao API response received for query: {}", query))
                .doOnError(error -> log.error("Kakao API error: {}", error.getMessage()))
                .onErrorReturn(ResponseEntity.internalServerError()
                    .body("{\"error\":\"Kakao API call failed\"}"));
                
    } catch (Exception e) {
        log.error("Error calling Kakao API: {}", e.getMessage());
        return Mono.just(ResponseEntity.internalServerError()
            .body("{\"error\":\"Error calling Kakao API: " + e.getMessage() + "\"}"));
    }
}
```

#### 단일 식당 좌표 업데이트: `/api/restaurants/update-coordinates`

```java
/**
 * 단일 식당의 좌표 업데이트 (여러 방식으로 시도)
 */
private void updateSingleRestaurantCoordinates(Restaurant restaurant) {
    try {
        // 이미 좌표가 있는 식당은 API 호출하지 않음
        if (restaurant.getLat() != null && restaurant.getLng() != null && 
            restaurant.getRoadAddress() != null && !restaurant.getRoadAddress().trim().isEmpty()) {
            return;
        }
        
        final String kakaoApiKey = getNextApiKey();
        
        // 검색 쿼리 생성
        String query1 = restaurant.getRestaurantName();
        if (restaurant.getBranchName() != null && !restaurant.getBranchName().trim().isEmpty()) {
            query1 += " " + restaurant.getBranchName();
        }
        
        String query2 = restaurant.getRestaurantName();
        
        // 순차적으로 시도
        String[] queries = {query1, query2};
        boolean found = false;
        
        for (String searchQuery : queries) {
            if (searchQuery == null || searchQuery.trim().isEmpty()) continue;
            
            try {
                // 🔹 Kakao API 호출
                String response = webClient.get()
                        .uri(uriBuilder -> uriBuilder
                                .scheme("https")
                                .host("dapi.kakao.com")
                                .path("/v2/local/search/keyword.json")
                                .queryParam("query", searchQuery)
                                .queryParam("category_group_code", "FD6")
                                .queryParam("size", "1")
                                .build())
                        .header("Authorization", kakaoApiKey)
                        .retrieve()
                        .bodyToMono(String.class)
                        .timeout(java.time.Duration.ofSeconds(10))
                        .block();
                
                // 🔹 JSON 파싱
                ObjectMapper mapper = new ObjectMapper();
                JsonNode jsonNode = mapper.readTree(response);
                
                if (jsonNode.has("documents") && jsonNode.get("documents").size() > 0) {
                    JsonNode firstResult = jsonNode.get("documents").get(0);
                    
                    // 🔹 데이터 추출
                    Double lat = firstResult.get("y").asDouble();
                    Double lng = firstResult.get("x").asDouble();
                    String roadAddress = firstResult.has("road_address_name") && 
                                       !firstResult.get("road_address_name").isNull() ? 
                                       firstResult.get("road_address_name").asText() : 
                                       firstResult.get("address_name").asText();
                    
                    // 🔹 DB 업데이트
                    restaurant.setLat(lat);
                    restaurant.setLng(lng);
                    if (restaurant.getRoadAddress() == null || restaurant.getRoadAddress().isEmpty()) {
                        restaurant.setRoadAddress(roadAddress);
                    }
                    
                    // 🔹 데이터베이스에 저장
                    restaurantService.updateRestaurant(restaurant);
                    
                    log.info("✅ Updated coordinates: lat={}, lng={}, address={}", 
                        lat, lng, roadAddress);
                    
                    found = true;
                    break;
                }
            } catch (Exception e) {
                log.warn("Error searching with query '{}': {}", searchQuery, e.getMessage());
            }
            
            Thread.sleep(500); // API 호출 제한 방지
        }
        
    } catch (Exception e) {
        log.error("Failed to update coordinates: {}", e.getMessage());
    }
}
```

---

## 📊 Kakao API 응답 구조

### KakaoApiResponse 클래스

```java
public static class KakaoApiResponse {
    private List<Document> documents;
    
    public static class Document {
        @JsonProperty("place_name")
        private String placeName;
        
        @JsonProperty("x")  // 경도 (lng)
        private String x;
        
        @JsonProperty("y")  // 위도 (lat)
        private String y;
        
        @JsonProperty("road_address_name")  // 도로명 주소
        private String roadAddressName;
        
        @JsonProperty("address_name")  // 지번 주소
        private String addressName;
        
        @JsonProperty("phone")
        private String phone;
        
        @JsonProperty("category_name")
        private String categoryName;
    }
}
```

---

## 🔄 전체 플로우 다이어그램

```
┌─────────────────┐
│  Restaurant     │  lat=null, lng=null, roadAddress=null
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  updateLocationInfoAndSave()       │
│  1. DB에서 기존 데이터 확인         │
│  2. updateLocationInfo() 호출       │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  updateLocationInfo()               │
│  1. 검색 쿼리 생성                  │
│     (식당명 + 지역명)               │
│  2. Kakao API 호출                  │
│     GET /v2/local/search/keyword.json│
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  Kakao API (프록시)                 │
│  Response:                           │
│  {                                   │
│    "documents": [{                   │
│      "x": "127.0276",  (경도/lng)  │
│      "y": "37.4979",   (위도/lat)   │
│      "road_address_name": "서울..." │
│    }]                                │
│  }                                   │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  데이터 추출 및 설정                │
│  restaurant.setLat(y)               │
│  restaurant.setLng(x)               │
│  restaurant.setRoadAddress(...)     │
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  데이터베이스 저장                  │
│  restaurantRepository.save(restaurant)│
└────────┬────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Restaurant     │  lat=37.4979, lng=127.0276, roadAddress="서울..."
└─────────────────┘
```

---

## 🧪 사용 방법

### 1. 백엔드에서 자동 업데이트

```java
// RestaurantService를 통해 자동으로 업데이트됨
List<Restaurant> restaurants = restaurantService.searchRestaurants("맥도날드");
// 검색 결과에 좌표가 없으면 자동으로 Kakao API 호출하여 업데이트
```

### 2. REST API 엔드포인트 사용

```bash
# 카카오 API 프록시 테스트
curl "http://localhost:8080/api/restaurants/kakao/search?query=맥도날드%20강남"

# 응답 예시:
# {
#   "documents": [{
#     "x": "127.0276",
#     "y": "37.4979",
#     "road_address_name": "서울특별시 강남구 테헤란로 152"
#   }]
# }
```

### 3. 배치 업데이트

```java
// 좌표가 없는 모든 식당 업데이트
List<Restaurant> restaurants = restaurantRepository.findByLatIsNullOrLngIsNull();
for (Restaurant restaurant : restaurants) {
    updateLocationInfoAndSave(restaurant);
}
```

---

## ⚙️ 설정 파일

### `application.properties`

```properties
# Kakao API 설정
kakao.api.key=YOUR_KAKAO_REST_API_KEY
kakao.api.url=https://dapi.kakao.com/v2/local/search/keyword.json
kakao.api.reverse.url=https://dapi.kakao.com/v2/local/geo/coord2address.json
```

---

## 🔐 API 키 로테이션

```java
// RestaurantController에서 여러 API 키 로테이션
private final String[] KAKAO_API_KEYS = {
    "KakaoAK YOUR_API_KEY_1",
    "KakaoAK YOUR_API_KEY_2",
    "KakaoAK YOUR_API_KEY_3"
};

private int currentApiKeyIndex = 0;

private String getNextApiKey() {
    String apiKey = KAKAO_API_KEYS[currentApiKeyIndex];
    currentApiKeyIndex = (currentApiKeyIndex + 1) % KAKAO_API_KEYS.length;
    return apiKey;
}
```

---

## 📝 요약

1. **프록시 서버 역할**: `RestaurantController`의 `/api/restaurants/kakao/search` 엔드포인트가 클라이언트 요청을 Kakao API로 전달

2. **API 호출**: `RestaurantService.updateLocationInfo()` 메서드가 WebClient를 사용하여 Kakao API 호출

3. **데이터 추출**: API 응답에서 `x`(경도), `y`(위도), `road_address_name`(도로명 주소) 추출

4. **DB 저장**: `restaurantRepository.save(restaurant)`로 데이터베이스에 저장

5. **자동 업데이트**: 좌표가 없는 식당을 검색하거나 조회할 때 자동으로 API 호출하여 업데이트

---

## 🔍 주요 파일 위치

- `Restaurant.java`: 엔티티 정의 (lat, lng, roadAddress 필드)
- `RestaurantService.java`: API 호출 및 DB 저장 로직
- `RestaurantController.java`: REST API 엔드포인트 (프록시 포함)
- `RestaurantRepository.java`: JPA 저장소 인터페이스





