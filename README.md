# Mongle Backend 🐾

> 반려동물 관리 및 커뮤니티 플랫폼 - 백엔드 API 서버

Mongle 백엔드는 반려동물 관리, 커뮤니티, AI 건강 상담 등을 제공하는 RESTful API 서버입니다. Express.js 기반으로 구축되었으며, **AWS EC2에 호스팅된 MySQL 클라우드 데이터베이스**를 사용하여 팀원 간 협업을 지원합니다.

[![Express](https://img.shields.io/badge/Express-5.2.1-000000?logo=express)](https://expressjs.com/)
[![MySQL](https://img.shields.io/badge/MySQL-2.0-4479A1?logo=mysql)](https://www.mysql.com/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js)](https://nodejs.org/)
[![AWS](https://img.shields.io/badge/AWS-EC2%20%2B%20S3-FF9900?logo=amazon-aws)](https://aws.amazon.com/)

---

## 📋 목차

- [주요 기능](#-주요-기능)
- [기술 스택](#-기술-스택)
- [프로젝트 구조](#-프로젝트-구조)
- [시작하기](#-시작하기)
- [환경 변수 설정](#-환경-변수-설정)
- [데이터베이스 구조](#-데이터베이스-구조)
- [API 엔드포인트](#-api-엔드포인트)
- [아키텍처](#-아키텍처)
- [미들웨어](#-미들웨어)
- [개발 현황](#-개발-현황)
- [API 테스트](#-api-테스트)

---

## ✨ 주요 기능

### 🔐 인증 시스템
- JWT 기반 로그인/로그아웃
- Access Token + Refresh Token
- Bearer 토큰 인증

### 🐾 반려동물 프로필 관리 ✅ 완성
- CRUD 기능 (등록/조회/수정/삭제)
- AWS S3 이미지 업로드
- 소유권 검증 (사용자는 자신의 반려동물만 관리)

### 🏥 위치 기반 서비스 ✅ 완성
- **동물병원 검색** - Haversine 공식 기반 거리 계산
- **보호소 검색** - GPS 좌표 또는 키워드 검색
- 페이지네이션 지원 (무한 스크롤)

### 💬 커뮤니티
- 게시글 CRUD
- 댓글 시스템
- 좋아요 & 북마크 기능
- 카테고리별 필터링

### 📅 캘린더 & 일정 관리
- 예방접종, 병원, 미용, 투약 일정 관리
- 월별 일정 조회
- D-Day 계산

### 🤖 AI 건강 상담 ✅ 완성
- **OpenAI GPT-4o-mini** 통합
- 증상 분석 및 권장 조치 제공
- JSON Schema 구조화된 응답

### 📰 뉴스 피드 ✅ 완성
- **Puppeteer 기반 뉴스 크롤링**
- 다음(Daum) 동물 뉴스 수집
- 일반 뉴스 + 입양 뉴스 분류
- 메모리 캐싱 (1시간 TTL)
- node-cron 자동 갱신 (매시간 정각)

---

## 🛠 기술 스택

### Core
- **Node.js** 18+ - JavaScript 런타임
- **Express** 5.2.1 - 웹 프레임워크
- **MySQL** 2.0 - 관계형 데이터베이스 (AWS EC2 호스팅)
- **ES Modules** - 최신 JavaScript 모듈 시스템

### 데이터베이스
- **mysql2** 3.16.0 - Promise 기반 MySQL 드라이버
- **AWS EC2** - MySQL 클라우드 호스팅 (팀원 공유)
- **Connection Pooling** - 최대 10개 동시 연결

### 인증 & 보안
- **jsonwebtoken** 9.0.3 - JWT 토큰 생성/검증
- **bcrypt** 6.0.0 - 비밀번호 해싱

### 파일 업로드
- **AWS S3** - 이미지 저장소
- **@aws-sdk/client-s3** 3.957.0 - AWS S3 SDK
- **multer** 2.0.2 - 파일 업로드 미들웨어

### AI & 크롤링
- **openai** 6.14.0 - OpenAI GPT API
- **puppeteer** 24.33.1 - 헤드리스 브라우저 크롤링
- **cheerio** 1.1.2 - HTML 파싱

### 유틸리티
- **cors** 2.8.5 - CORS 미들웨어
- **dotenv** 17.2.3 - 환경 변수 관리
- **node-cron** 4.2.1 - 작업 스케줄러
- **axios** 1.13.2 - HTTP 클라이언트
- **nodemon** 3.1.11 - 개발 자동 재시작

---

## 📁 프로젝트 구조

```
server/
├── src/
│   ├── app.js                          # Express 앱 설정 (PORT 3001, CORS)
│   │
│   ├── config/                         # 외부 서비스 설정
│   │   ├── db.config.js                # MySQL 연결 풀 (AWS EC2)
│   │   └── s3.config.js                # AWS S3 클라이언트
│   │
│   ├── routes/                         # API 라우트 정의
│   │   ├── index.js                    # 라우트 통합 관리
│   │   ├── auth.route.js               # 인증 라우트
│   │   ├── user.route.js               # 사용자 라우트
│   │   ├── pet.route.js                # 반려동물 라우트 ✅
│   │   ├── article.route.js            # 게시글 라우트
│   │   ├── calendar.route.js           # 캘린더 라우트
│   │   ├── hospital.route.js           # 병원 라우트 ✅
│   │   ├── shelter.route.js            # 보호소 라우트 ✅
│   │   ├── news.route.js               # 뉴스 라우트 ✅
│   │   └── health.route.js             # AI 상담 라우트 ✅
│   │
│   ├── controllers/                    # 요청 처리 핸들러
│   │   ├── auth.controller.js          # 인증 컨트롤러
│   │   ├── user.controller.js          # 사용자 컨트롤러
│   │   ├── pet.controller.js           # 반려동물 컨트롤러 ✅
│   │   ├── article.controller.js       # 게시글 컨트롤러
│   │   ├── calendar.controller.js      # 캘린더 컨트롤러
│   │   ├── hospital.controller.js      # 병원 컨트롤러 ✅
│   │   ├── shelter.controller.js       # 보호소 컨트롤러 ✅
│   │   ├── news.controller.js          # 뉴스 컨트롤러 ✅
│   │   └── health.controller.js        # AI 상담 컨트롤러 ✅
│   │
│   ├── services/                       # 비즈니스 로직
│   │   ├── auth.service.js             # JWT 생성/검증
│   │   ├── user.service.js             # 회원가입/검증
│   │   ├── pet.service.js              # 반려동물 로직 ✅
│   │   ├── article.service.js          # 게시글 로직
│   │   ├── calendar.service.js         # 캘린더 로직
│   │   ├── hospital.service.js         # 병원 검색 로직 ✅
│   │   ├── shelter.service.js          # 보호소 검색 로직 ✅
│   │   ├── news.service.js             # 크롤링 로직 ✅
│   │   ├── health.service.js           # GPT API 통합 ✅
│   │   └── s3.service.js               # S3 업로드/삭제 ✅
│   │
│   ├── models/                         # 데이터베이스 쿼리
│   │   ├── user.model.js               # users 테이블
│   │   ├── pet.model.js                # pet_profiles 테이블 ✅
│   │   ├── article.model.js            # articles 테이블
│   │   ├── calendar.model.js           # calendar_events 테이블
│   │   ├── hospital.model.js           # hospitals 테이블 ✅
│   │   └── shelter.model.js            # shelters 테이블 ✅
│   │
│   ├── middlewares/                    # 미들웨어
│   │   ├── auth.middleware.js          # JWT 검증 ✅
│   │   └── upload.middleware.js        # Multer 설정 ✅
│   │
│   └── jobs/                           # 백그라운드 작업
│       └── news.job.js                 # 뉴스 크롤링 크론잡 ✅
│
├── .env                                # 환경 변수 (git 제외)
├── .gitignore                          # Git 무시 설정
├── package.json                        # 의존성 관리
└── README.md                           # 프로젝트 문서
```

---

## 🚀 시작하기

### 사전 요구사항

- **Node.js** >= 18.0.0
- **npm** >= 9.0.0
- **MySQL** 접근 권한 (AWS EC2 DB)

### 설치 및 실행

```bash
# 저장소 클론
git clone <repository-url>
cd server

# 의존성 설치
npm install

# 환경 변수 설정 (.env 파일 생성)
# 아래 "환경 변수 설정" 섹션 참조

# 개발 서버 실행 (nodemon - 자동 재시작)
npm run dev

# 프로덕션 실행
npm start

# 서버 실행 확인
# http://localhost:3001/api/ 접속
```

---

## 🔐 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 변수를 설정하세요:

```bash
# 데이터베이스 (AWS EC2 MySQL)
DB_HOST=3.106.133.88
DB_PORT=3306
DB_NAME=animaldictionary
DB_USER=animal1
DB_PASSWORD=your_db_password

# JWT 인증
JWT_SECRET=mySuper$ecretKey123!@
JWT_ACCESS_SECRET=mySuper$ecretKey123!@
JWT_REFRESH_SECRET=mySuper$ecretKey123!@Refresh

# OpenAI API
OPENAI_API_KEY=sk-proj-your_openai_api_key

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key_id
AWS_SECRET_ACCESS_KEY=your_aws_secret_access_key
AWS_REGION=ap-northeast-2
AWS_S3_BUCKET=mongle-pet-images
```

### 🌩️ AWS EC2 MySQL 클라우드 데이터베이스

**특징**:
- ☁️ **클라우드 호스팅**: AWS EC2 인스턴스에 MySQL 설치
- 👥 **팀원 공유**: 여러 개발자가 동일한 데이터베이스 접근
- 🔒 **보안**: IP 화이트리스트 기반 접근 제어
- 🔄 **Connection Pool**: 최대 10개 동시 연결 지원

**연결 정보**:
```javascript
// src/config/db.config.js
const pool = mysql.createPool({
  host: "3.106.133.88",          // AWS EC2 퍼블릭 IP
  port: 3306,
  database: "animaldictionary",
  user: "animal1",
  password: process.env.DB_PASSWORD,
  connectionLimit: 10,           // 연결 풀 크기
  timezone: "+09:00"             // 한국 시간대
});
```

**장점**:
- ✅ 로컬 DB 설치 불필요
- ✅ 데이터 실시간 동기화
- ✅ 팀원 간 데이터 공유 용이
- ✅ 프로덕션 환경과 유사한 개발 환경

---

## 💾 데이터베이스 구조

### 주요 테이블

#### users (사용자)
```sql
id            BIGINT (PK, AUTO_INCREMENT)
userid        VARCHAR(50) UNIQUE NOT NULL
email         VARCHAR(100) UNIQUE NOT NULL
password      VARCHAR(255) NOT NULL       -- bcrypt 해싱
created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### pet_profiles (반려동물)
```sql
id            BIGINT (PK, AUTO_INCREMENT)
user_id       BIGINT (FK to users.id, CASCADE)
name          VARCHAR(50) NOT NULL
species       VARCHAR(50) NOT NULL        -- dog, cat, rabbit, etc
gender        VARCHAR(10) NOT NULL        -- male, female, neutered
birth_day     DATE NOT NULL
feature       TEXT
img_url       VARCHAR(2083)               -- S3 URL
created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at    TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

#### hospitals (동물병원)
```sql
id            BIGINT (PK, AUTO_INCREMENT)
hospital_name VARCHAR(100) NOT NULL
phone_number  VARCHAR(20)
road_address  VARCHAR(255)
postal_code   VARCHAR(10)
latitude      DECIMAL(10, 8)
longitude     DECIMAL(11, 8)
```

#### shelters (보호소)
```sql
id            BIGINT (PK, AUTO_INCREMENT)
shelter_name  VARCHAR(100) NOT NULL
phone_number  VARCHAR(20)
road_address  VARCHAR(255)
latitude      DECIMAL(10, 8)
longitude     DECIMAL(11, 8)
```

#### articles (커뮤니티 게시글)
```sql
id            BIGINT (PK, AUTO_INCREMENT)
user_id       BIGINT (FK to users.id)
title         VARCHAR(200) NOT NULL
content       TEXT NOT NULL
category      VARCHAR(50)                 -- dog, cat, rabbit, etc
img_url       VARCHAR(2083)               -- S3 URL
created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
updated_at    TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
```

#### calendar_events (캘린더 일정)
```sql
id              BIGINT (PK, AUTO_INCREMENT)
user_id         BIGINT (FK to users.id)
pet_profile_id  BIGINT (FK to pet_profiles.id, CASCADE)
title           VARCHAR(100) NOT NULL
category        VARCHAR(50) NOT NULL      -- vaccination, hospital, grooming, medication
event_date      DATE NOT NULL
event_time      TIME
is_complete     BOOLEAN DEFAULT FALSE
created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP
```

#### 통계 테이블
- **article_likes** - 게시글 좋아요 (article_id, user_id)
- **article_bookmarks** - 게시글 북마크 (article_id, user_id)

---

## 🌐 API 엔드포인트

### Base URL
```
http://localhost:3001/api
```

### 인증 (Authentication)
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| POST | `/auth/login` | 로그인 (JWT 발급) | - |
| POST | `/auth/logout` | 로그아웃 | - |
| POST | `/auth/refresh` | 토큰 갱신 | - |

### 사용자 (Users)
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| POST | `/users` | 회원가입 | - |
| GET | `/users/me` | 내 정보 조회 | 🔒 |
| POST | `/users/find-email` | 아이디 찾기 | - |
| PATCH | `/users/me/password` | 비밀번호 재설정 | 🔒 |

### 반려동물 (Pets) ✅ 완성
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| POST | `/pets` | 프로필 등록 (이미지 업로드) | 🔒 |
| GET | `/pets` | 내 반려동물 목록 | 🔒 |
| GET | `/pets/:petId` | 반려동물 상세 조회 | 🔒 |
| PUT | `/pets/:petId` | 프로필 수정 | 🔒 |
| DELETE | `/pets/:petId` | 프로필 삭제 | 🔒 |

**요청 예시**:
```bash
# 프로필 등록 (FormData)
POST /api/pets
Content-Type: multipart/form-data
Authorization: Bearer {token}

name: "멍멍이"
species: "dog"
birthday: "2020-05-15"
gender: "male"
feature: "활발하고 귀여워요"
imageFile: [File]
```

### 병원 검색 (Hospitals) ✅ 완성
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| GET | `/hospitals` | 병원 목록 조회 | - |
| GET | `/hospitals/:hospitalId` | 병원 상세 조회 | - |

**쿼리 파라미터**:
- 위치 기반: `?lat=37.5&lng=127.0&radius=2000` (미터 단위)
- 도시 기반: `?city=서울&district=강남`
- 페이지네이션: `?limit=20&offset=0`

**응답 예시**:
```json
{
  "message": "병원 목록 조회 성공",
  "count": 5,
  "data": [
    {
      "id": 1,
      "hospital_name": "강남동물병원",
      "phone_number": "02-1234-5678",
      "road_address": "서울특별시 강남구 테헤란로 123",
      "distance": 1523.45
    }
  ]
}
```

### 보호소 검색 (Shelters) ✅ 완성
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| GET | `/shelters` | 보호소 목록 조회 | - |
| GET | `/shelters/:shelterId` | 보호소 상세 조회 | - |

**쿼리 파라미터**:
- 위치 기반: `?lat=37.5&lng=127.0&radius=2000`
- 키워드 검색: `?keyword=강남` (보호소명 또는 주소)
- 페이지네이션: `?limit=20&offset=0`

### 커뮤니티 (Articles)
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| POST | `/articles` | 게시글 작성 | 🔒 |
| GET | `/articles` | 게시글 목록 | - |
| GET | `/articles/me/my-articles` | 내 게시글 | 🔒 |
| GET | `/articles/me/bookmarked` | 북마크한 게시글 | 🔒 |
| GET | `/articles/:articleId` | 게시글 상세 | - |
| PATCH | `/articles/:articleId` | 게시글 수정 | 🔒 |
| DELETE | `/articles/:articleId` | 게시글 삭제 | 🔒 |
| POST | `/articles/:articleId/likes` | 좋아요 토글 | 🔒 |
| POST | `/articles/:articleId/bookmarks` | 북마크 토글 | 🔒 |
| POST | `/articles/:articleId/reports` | 게시글 신고 | 🔒 |

### 캘린더 (Calendar Events)
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| POST | `/calendar-events` | 일정 등록 | 🔒 |
| GET | `/calendar-events` | 월별 일정 조회 (`?year=2025&month=12`) | 🔒 |
| GET | `/calendar-events/:eventId` | 일정 상세 | 🔒 |
| PATCH | `/calendar-events/:eventId` | 일정 수정 | 🔒 |
| DELETE | `/calendar-events/:eventId` | 일정 삭제 | 🔒 |

### AI 건강 상담 (Health) ✅ 완성
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| POST | `/health/consult` | AI 건강 상담 | 🔒 |

**요청 예시**:
```json
{
  "animalType": "dog",
  "breed": "골든 리트리버",
  "age": 5,
  "gender": "male",
  "weight": 30,
  "consultContent": "계속 기침을 해요",
  "existingDiseases": "없음",
  "medications": "없음"
}
```

**응답 예시**:
```json
{
  "message": "상담이 완료되었습니다.",
  "data": {
    "consultData": {...},
    "aiResponse": {
      "subtitle1": "증상 분석",
      "text1": "...",
      "subtitle2": "가능한 원인",
      "text2": "...",
      "subtitle3": "권장 조치",
      "text3": "...",
      "subtitle4": "주의사항",
      "text4": "..."
    }
  }
}
```

### 뉴스 피드 (News) ✅ 완성
| 메서드 | 엔드포인트 | 설명 | 인증 |
|--------|-----------|------|------|
| GET | `/news` | 뉴스 목록 조회 (캐시) | - |
| POST | `/news/refresh` | 캐시 강제 갱신 | - |
| GET | `/news/status` | 캐시 상태 조회 | - |

**특징**:
- Puppeteer로 다음(Daum) 뉴스 크롤링
- 일반 뉴스 + 입양 뉴스 분류
- 1시간 캐싱 + 자동 갱신

**응답 예시**:
```json
{
  "message": "뉴스 조회 성공",
  "cached": true,
  "lastUpdated": "2025-12-23T08:16:57.043Z",
  "count": {
    "news": 21,
    "familyInfo": 2
  },
  "news": [...],
  "familyInfo": [...]
}
```

---

## 🏗 아키텍처

### 3계층 아키텍처 패턴

```
HTTP Request
    ↓
[Route] - 라우트 정의 및 미들웨어 적용
    ↓
[Controller] - 요청 처리 및 응답 반환
    ↓
[Service] - 비즈니스 로직 구현
    ↓
[Model] - 데이터베이스 쿼리 실행
    ↓
[Database] - MySQL (AWS EC2)
    ↓
HTTP Response
```

**요청 흐름 예시**:
```
GET /api/pets
  → routes/pet.route.js
  → middlewares/auth.middleware.js (JWT 검증)
  → controllers/pet.controller.js (getPets)
  → services/pet.service.js (비즈니스 로직)
  → models/pet.model.js (SELECT 쿼리)
  → MySQL Database
  ← JSON Response
```

### 계층별 역할

#### Routes
- HTTP 메서드 및 경로 정의
- 미들웨어 적용 (인증, 파일 업로드)
- 컨트롤러 함수 연결

#### Controllers
- 요청 파라미터 검증
- 서비스 레이어 호출
- HTTP 응답 반환 (상태 코드, JSON)

#### Services
- 비즈니스 로직 구현
- 데이터 가공 및 검증
- 외부 API 호출 (OpenAI, S3)
- 트랜잭션 처리

#### Models
- SQL 쿼리 작성
- 데이터베이스 CRUD 작업
- 연결 풀 사용

---

## 🔒 미들웨어

### 인증 미들웨어 ([src/middlewares/auth.middleware.js](src/middlewares/auth.middleware.js))

**authMiddleware** (필수 인증)
```javascript
// Authorization: Bearer {token}
const token = req.headers.authorization?.split(" ")[1];
const decoded = jwt.verify(token, JWT_ACCESS_SECRET);
req.user = { userId: decoded.id, email: decoded.email };
```

**optionalAuthMiddleware** (선택적 인증)
```javascript
// 토큰이 있으면 검증, 없으면 통과
if (token) {
  req.user = jwt.verify(token, JWT_ACCESS_SECRET);
}
```

**적용 경로**:
- `/pets/*`, `/calendar-events/*` - authMiddleware (필수)
- `/articles/` - optionalAuthMiddleware (선택)

### 파일 업로드 미들웨어 ([src/middlewares/upload.middleware.js](src/middlewares/upload.middleware.js))

```javascript
const upload = multer({
  storage: memoryStorage(),      // 메모리 스토리지 (S3 업로드 전)
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("JPG, PNG만 허용됩니다."));
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }  // 5MB
});

// 사용: upload.single("imageFile")
```

**트랜잭션 처리**:
1. S3 업로드 먼저 → DB insert
2. DB insert 실패 시 S3 cleanup (롤백)
3. 업데이트 시: 새 이미지 업로드 성공 후 기존 이미지 삭제

---

## 📊 개발 현황

### ✅ 완성된 기능 (프론트엔드 연동 가능)
- **반려동물 프로필 API** - CRUD + AWS S3 이미지 업로드
- **병원 위치 API** - Haversine 거리 계산, 위치/도시 기반 검색
- **보호소 위치 API** - Haversine 거리 계산, 위치/키워드 검색
- **AI 건강 상담** - GPT-4o-mini 통합
- **뉴스 피드** - Puppeteer 크롤링 + 캐싱 + 크론잡
- **인증 미들웨어** - JWT 검증, Bearer 토큰 파싱
- **파일 업로드 미들웨어** - Multer 설정, S3 연동
- **S3 서비스** - 업로드/삭제/URL 생성

### ⚠️ 구조 정의 완료 (로직 구현 필요)
- **인증 시스템** - 로그인/로그아웃/토큰 갱신 (구조만 완성)
- **사용자 관리** - 회원가입/프로필/비밀번호 재설정 (구조만 완성)
- **커뮤니티 게시글** - CRUD/댓글/좋아요/북마크 (라우트/컨트롤러만 정의)
- **캘린더 이벤트** - CRUD (라우트/컨트롤러만 정의)

---

## 🧪 API 테스트

### Postman을 사용한 API 테스트

**Base URL**: `http://localhost:3001/api`

#### 1. 반려동물 등록 테스트
```bash
POST /api/pets
Content-Type: multipart/form-data
Authorization: Bearer {your_jwt_token}

# Body (form-data)
name: "멍멍이"
species: "dog"
birthday: "2020-05-15"
gender: "male"
feature: "활발함"
imageFile: [Select File]
```

#### 2. 병원 검색 테스트 (위치 기반)
```bash
GET /api/hospitals?lat=37.5665&lng=126.978&radius=5000
```

#### 3. AI 건강 상담 테스트
```bash
POST /api/health/consult
Content-Type: application/json
Authorization: Bearer {your_jwt_token}

{
  "animalType": "dog",
  "breed": "골든 리트리버",
  "age": 5,
  "gender": "male",
  "consultContent": "계속 기침을 해요"
}
```

#### 4. 뉴스 조회 테스트
```bash
GET /api/news
```

### cURL 예시
```bash
# 병원 검색
curl "http://localhost:3001/api/hospitals?lat=37.5&lng=127.0&radius=2000"

# 뉴스 조회
curl "http://localhost:3001/api/news"
```

---

## 🔧 주요 기술 구현

### Haversine 공식 (거리 계산)

병원/보호소 검색에서 GPS 좌표 기반 거리 계산:

```sql
SELECT *,
  (6371000 * acos(
    cos(radians(?)) * cos(radians(latitude)) *
    cos(radians(longitude) - radians(?)) +
    sin(radians(?)) * sin(radians(latitude))
  )) AS distance
FROM hospitals
HAVING distance <= ?
ORDER BY distance ASC
```

**변수**:
- `6371000` - 지구 반지름 (미터)
- `?` - 사용자 위도, 경도
- `distance` - 계산된 거리 (미터)

### AWS S3 이미지 업로드

```javascript
// services/s3.service.js
const uploadToS3 = async (file, userId) => {
  const key = `pets/${userId}/${Date.now()}_${file.originalname}`;

  await s3Client.send(new PutObjectCommand({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    ContentType: file.mimetype
  }));

  return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
};
```

### Puppeteer 뉴스 크롤링

```javascript
// services/news.service.js
const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.goto("https://news.daum.net/animal", { timeout: 30000 });

const newsData = await page.evaluate(() => {
  const items = document.querySelectorAll(".list_newsheadline2 > li");
  return Array.from(items).map(item => ({
    title: item.querySelector("a").textContent,
    url: item.querySelector("a").href
  }));
});

await browser.close();
```

---

## 📚 참고 자료

- [Express 공식 문서](https://expressjs.com/)
- [MySQL2 공식 문서](https://github.com/sidorares/node-mysql2)
- [AWS S3 SDK 문서](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/)
- [OpenAI API 문서](https://platform.openai.com/docs/api-reference)
- [Puppeteer 공식 문서](https://pptr.dev/)

---

## 📝 라이선스

이 프로젝트는 MIT 라이선스를 따릅니다.

---

## 👥 기여

프로젝트에 기여하고 싶으시다면 Pull Request를 보내주세요!

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📧 문의

프로젝트 관련 문의사항이 있으시면 이슈를 등록해주세요.
