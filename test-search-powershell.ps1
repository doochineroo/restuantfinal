# PowerShell 스크립트 - 식당 검색 API 테스트

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   식당 검색 API 테스트" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# 한글 검색어를 URL 인코딩
$keyword = "맥도날드"
$encodedKeyword = [System.Web.HttpUtility]::UrlEncode($keyword)
$url = "http://localhost:8080/api/restaurants/search?keyword=$encodedKeyword"

Write-Host "[API 호출 중...]" -ForegroundColor Yellow
Write-Host "URL: $url" -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri $url -Method GET
    
    # JSON 포맷팅
    $json = $response.Content | ConvertFrom-Json
    $formattedJson = $json | ConvertTo-Json -Depth 10
    
    Write-Host "[결과]:" -ForegroundColor Green
    Write-Host $formattedJson -ForegroundColor White
    Write-Host ""
    
    # 통계
    $total = ($json | Measure-Object).Count
    $withCoords = ($json | Where-Object { $_.lat -ne $null -and $_.lng -ne $null } | Measure-Object).Count
    
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host "통계: 총 $total 개, 좌표 있는 것: $withCoords 개" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Cyan
    
} catch {
    Write-Host "[에러 발생]" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 브라우저에서 확인해보세요:" -ForegroundColor Yellow
    Write-Host "   http://localhost:8080/api/restaurants/search?keyword=맥도날드" -ForegroundColor Cyan
}

Write-Host ""
Write-Host "계속하려면 아무 키나 누르세요..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")





