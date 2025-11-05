# MySQL 비밀번호 설정 해결 가이드

## 문제
```
ERROR 1045 (28000): Access denied for user 'root'@'localhost' (using password: NO)
```

## 해결 방법

### 방법 1: sudo mysql로 직접 접속 (가장 쉬움)

```bash
sudo mysql
```

MySQL 프롬프트에서:
```sql
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'chopplan123';
FLUSH PRIVILEGES;
exit;
```

### 방법 2: 한 줄 명령어 (비밀번호 없이)

```bash
sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'chopplan123';" && sudo mysql -e "FLUSH PRIVILEGES;"
```

### 방법 3: debian-sys-maint 사용자 활용

```bash
# 먼저 debian-sys-maint 비밀번호 확인
sudo cat /etc/mysql/debian.cnf

# 그 비밀번호로 접속
mysql -u debian-sys-maint -p
# 비밀번호 입력 후:

ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'chopplan123';
FLUSH PRIVILEGES;
exit;
```

### 방법 4: MySQL 서비스 중지 후 안전 모드로 시작 (최후의 수단)

```bash
sudo systemctl stop mysql
sudo mysqld_safe --skip-grant-tables &
mysql -u root

# MySQL에서:
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'chopplan123';
FLUSH PRIVILEGES;
exit;

sudo systemctl restart mysql
```

## 권장: 방법 1 사용

가장 간단하고 안전합니다.

