# 낙낙 - 백엔드 협업 API 명세서

> 이 문서는 프론트엔드(`naknak-web`) 코드 기반으로 작성된 API 명세입니다.
> 백엔드 개발자는 이 문서를 기준으로 API를 구현하면 됩니다.

---

## 목차

1. [공통 규칙](#1-공통-규칙)
2. [인증 방식](#2-인증-방식)
3. [카카오 OAuth 플로우](#3-카카오-oauth-플로우)
4. [사용자 API](#4-사용자-api)
5. [맛집 API](#5-맛집-api)
6. [랭킹 API](#6-랭킹-api)
7. [카카오맵 프록시 API](#7-카카오맵-프록시-api)
8. [타입 정의](#8-타입-정의)
9. [구현 우선순위](#9-구현-우선순위)

---

## 1. 공통 규칙

### 기본 URL
```
개발: http://localhost:8080
운영: 환경변수 VITE_API_BASE_URL 로 설정
```

### CORS 설정
```
허용 출처(Origin):
  - http://localhost:5173  (개발 프론트엔드)
  - https://{운영 도메인}

허용 메서드: GET, POST, PUT, DELETE, OPTIONS
허용 헤더: Content-Type, Authorization
자격 증명(credentials): true
```

### 에러 응답 형식
```json
{
  "error": "사용자에게 보여줄 에러 메시지"
}
```
- 에러는 적절한 HTTP 상태코드(4xx, 5xx)로 반환
- 프론트는 `response.ok` 여부로 성공/실패 판단

### 페이지네이션
현재 프론트에서 페이지네이션 파라미터를 별도로 붙이지 않으므로, 초기에는 최대 50건 반환으로 구현 가능합니다.

---

## 2. 인증 방식

### JWT Bearer 토큰
- 프론트는 로그인 성공 시 받은 JWT를 `localStorage`에 `"token"` 키로 저장
- 인증이 필요한 모든 API 요청에 아래 헤더를 포함

```
Authorization: Bearer {JWT토큰}
```

- 토큰이 없거나 만료된 경우 `401 Unauthorized` 반환
- 프론트는 401 응답 시 로그인 페이지로 이동 처리

---

## 3. 카카오 OAuth 플로우

### 전체 흐름
```
1. 프론트 → 카카오 인가 URL로 이동
   (redirect_uri = {프론트도메인}/auth/kakao/callback)

2. 카카오 → 프론트 콜백 페이지로 리다이렉트
   /auth/kakao/callback?code=xxx&state=xxx

3. 프론트 → 백엔드에 code 전달

4. 백엔드 → 카카오 토큰 교환 → 사용자 조회/생성 → JWT 발급

5. 백엔드 → 프론트에 JWT + 신규 여부 반환

6. 신규 사용자면 → 프론트가 닉네임 설정 페이지로 이동
   기존 사용자면 → 메인 페이지로 이동
```

### 카카오 로그인 처리

```
POST /api/v1/users/login

요청 본문:
{
  "code": "카카오에서 받은 인가 코드",
  "redirectUri": "https://{프론트도메인}/auth/kakao/callback",
  "state": "초대코드 (있는 경우)"
}

응답:
{
  "token": "JWT 토큰 문자열",
  "isNewUser": true | false
}
```

- `state` 파라미터에 초대코드가 포함될 수 있음
- `isNewUser: true`이면 프론트가 `/set-nickname` 페이지로 이동

### 닉네임 설정 (신규 회원)

```
POST /api/v1/users/signup
헤더: Authorization: Bearer {token}

요청 본문:
{
  "nickname": "설정할 닉네임",
  "inviteCode": "초대코드 (선택 사항)"
}

응답:
{
  "token": "새 JWT 토큰 (또는 기존 토큰 그대로)"
}
```

- `inviteCode`가 있으면 초대한 사용자와 1촌 연결 + 양쪽 보너스 포인트 지급
- 닉네임 중복 시 `409 Conflict` 반환

---

## 4. 사용자 API

### 내 정보 조회

```
GET /api/v1/users/me
헤더: Authorization: Bearer {token}

응답:
{
  "id": "사용자 고유 ID",
  "username": "카카오 계정 ID 또는 고유 식별자",
  "nickname": "닉네임",
  "score": 12500,           // 총 보유 포인트
  "rank": 7,                // 현재 랭킹 순위
  "inviteCode": "ABC123",   // 내 초대코드
  "profileImageUrl": "https://..."  // 선택 사항
}
```

### 내 정보 수정

```
PUT /api/v1/users/me
헤더: Authorization: Bearer {token}

요청 본문:
{
  "nickname": "새 닉네임",         // 선택 사항
  "profileImageUrl": "https://..."  // 선택 사항
}

응답: 수정된 사용자 정보 (GET /me 응답과 동일)
```

### 내가 작성한 후기 목록

```
GET /api/v1/users/me/reviews
헤더: Authorization: Bearer {token}

응답:
{
  "reviews": [ Review 객체 배열 (타입 정의 섹션 참고) ]
}
```

### 내 포인트 내역

```
GET /api/v1/users/me/points
헤더: Authorization: Bearer {token}

응답:
{
  "history": [
    {
      "id": "txn001",
      "type": "earn",              // "earn" | "spend"
      "description": "맛집 등록",
      "amount": 500,
      "timestamp": "2시간 전",     // 표시용 문자열 또는 ISO 날짜
      "icon": "restaurant"         // "restaurant" | "review" | "receipt" | "referral"
    }
  ],
  "weeklyPoints": 3500,   // 이번 주 획득 포인트
  "monthlyPoints": 12000, // 이번 달 획득 포인트
  "rank": 7               // 현재 랭킹 순위
}
```

### 다른 사용자 프로필 조회

```
GET /api/v1/users/:userId
헤더: Authorization: Bearer {token} (선택)

응답: 사용자 정보 (공개 가능한 정보만)
```

### 팔로우 관련

```
// 내가 팔로우 중인 목록
GET /api/users/:userId/following
응답: User 객체 배열

// 나를 팔로우하는 목록
GET /api/users/:userId/followers
응답: User 객체 배열

// 팔로우하기
POST /api/users/:userId/follow
헤더: Authorization: Bearer {token}
응답: 200 OK

// 팔로우 취소
DELETE /api/users/:userId/follow
헤더: Authorization: Bearer {token}
응답: 200 OK

// 사용자 검색
GET /api/users/search?query={검색어}
응답: User 객체 배열
```

---

## 5. 맛집 API

### 피드 조회 (메인 화면)

```
GET /api/v1/restaurants/feed
헤더: Authorization: Bearer {token}

응답:
{
  "restaurants": [ Restaurant 객체 배열 (타입 정의 섹션 참고) ]
}
```

- 친구(팔로잉)가 등록/방문한 맛집 위주로 정렬
- 친구가 없는 신규 유저는 전체 인기 맛집 반환

### 맛집 검색

```
GET /api/v1/restaurants/search?q={검색어}&category={카테고리}
헤더: Authorization: Bearer {token} (선택)

파라미터:
  q        - 검색어 (맛집 이름, 주소 등)
  category - 카테고리 필터 (선택): 한식 | 일식 | 중식 | 양식 | 분식 | 치킨 | 카페 | 기타

응답:
{
  "restaurants": [ Restaurant 객체 배열 ]
}
```

### 맛집 상세 조회

```
GET /api/v1/restaurants/:id
헤더: Authorization: Bearer {token} (선택)

응답: Restaurant 객체 (reviews 배열 포함)
```

### 맛집 등록

```
POST /api/v1/restaurants
헤더: Authorization: Bearer {token}
Content-Type: multipart/form-data  (사진 없을 때는 application/json 가능)

요청 본문:
{
  "name": "강남 갈비집",
  "category": "한식",
  "address": "서울시 강남구 테헤란로 123",
  "rating": 4,              // 1 ~ 5
  "recommendMenu": "LA갈비, 냉면",
  "review": "후기 내용",
  "hashtag": "데이트맛집, 가성비최고",
  "photos": [File, File]    // 선택 사항, multipart 첨부
}

응답: 생성된 Restaurant 객체

포인트 지급 기준:
  - 기본 등록: +500P
  - 사진 포함 시: +1,000P (총 1,500P)
```

### 저장한 맛집 목록

```
GET /api/v1/restaurants/saved
헤더: Authorization: Bearer {token}

응답:
{
  "restaurants": [ Restaurant 객체 배열 ]
}
```

### 맛집 저장/저장 취소

```
POST   /api/v1/restaurants/:id/save    // 저장
DELETE /api/v1/restaurants/:id/save    // 저장 취소
헤더: Authorization: Bearer {token}
```

---

## 6. 랭킹 API

```
GET /api/v1/rankings?type=weekly
GET /api/v1/rankings?type=monthly
헤더: Authorization: Bearer {token}

파라미터:
  type - "weekly" | "monthly"

응답:
{
  "rankings": [
    {
      "rank": 1,
      "user": {
        "id": "user001",
        "name": "김민수",
        "profileImageUrl": "https://..."  // 선택 사항
      },
      "points": 12500
    }
  ],
  "myRank": {
    "rank": 7,
    "points": 8500
  }
}
```

- 상위 20~50명 반환
- `myRank`는 현재 로그인한 사용자의 순위 (비로그인 시 null)

---

## 7. 카카오맵 프록시 API

> 카카오 REST API 키를 프론트에 노출하지 않기 위해 서버가 프록시 역할을 합니다.

```
GET /api/kakao/search?query={검색어}

파라미터:
  query - 검색할 장소 이름

응답 (카카오 로컬 API 응답 그대로 전달):
{
  "documents": [
    {
      "id": "12345678",
      "place_name": "강남 갈비집",
      "category_name": "음식점 > 한식 > 갈비",
      "address_name": "서울 강남구 역삼동 123",
      "road_address_name": "서울 강남구 테헤란로 123",
      "place_url": "https://map.kakao.com/link/map/12345678"
    }
  ]
}
```

- 서버에서 카카오 REST API 키(`KakaoAK {key}`)를 헤더에 붙여 요청
- 카카오 로컬 검색 API: `https://dapi.kakao.com/v2/local/search/keyword.json`
- 음식점 카테고리로 필터링 권장: `category_group_code=FD6`

---

## 8. 타입 정의

### User (사용자)
```typescript
interface User {
  id: string
  username: string       // 카카오 고유 식별자
  nickname: string
  score?: number         // 총 포인트
  rank?: number
  inviteCode?: string
  profileImageUrl?: string
}
```

### Restaurant (맛집)
```typescript
interface Restaurant {
  id: string
  name: string
  category: string       // "한식" | "일식" | "중식" | "양식" | "분식" | "치킨" | "카페" | "기타"
  address: string
  imageUrl?: string
  ratingAverage: number  // 평균 별점 (1.0 ~ 5.0)
  reviews: Review[]
}
```

### Review (후기)
```typescript
interface Review {
  id: string
  userId: string
  nickname: string
  distance: number       // 친구 관계 거리 (1 = 1촌, 2 = 2촌)
  rating: number         // 1 ~ 5
  recommendMenu: string
  content: string
  imageUrl?: string
  createdAt: string      // ISO 8601 날짜 문자열
}
```

### PointTransaction (포인트 내역)
```typescript
interface PointTransaction {
  id: string
  type: "earn" | "spend"
  description: string
  amount: number
  timestamp: string      // "2시간 전" 같은 표시용 문자열 또는 ISO 날짜
  icon: "restaurant" | "review" | "receipt" | "referral"
}
```

---

## 9. 구현 우선순위

프론트엔드와 연동 테스트가 가능한 순서입니다.

### Phase 1 (필수 - 로그인 없이 앱 사용 불가)
1. `POST /api/v1/users/login` — 카카오 인가 코드 → JWT 발급
2. `POST /api/v1/users/signup` — 닉네임 설정
3. `GET /api/v1/users/me` — 로그인 후 사용자 정보

### Phase 2 (핵심 기능)
4. `GET /api/v1/restaurants/feed` — 메인 화면 피드
5. `GET /api/kakao/search` — 맛집 검색 (카카오 프록시)
6. `POST /api/v1/restaurants` — 맛집 등록

### Phase 3 (부가 기능)
7. `GET /api/v1/restaurants/:id` — 맛집 상세
8. `GET /api/v1/restaurants/search` — 맛집 검색
9. `GET /api/v1/rankings` — 랭킹 조회
10. `GET /api/v1/users/me/points` — 포인트 내역

### Phase 4 (소셜 기능)
11. 팔로우/팔로워 관련 API
12. `GET /api/v1/restaurants/saved` — 저장한 맛집
13. `GET /api/v1/users/me/reviews` — 내 후기 목록

---

## 참고 사항

- 프론트는 API 실패 시 목(mock) 데이터로 대체하므로, 개발 중 일부 API가 없어도 화면은 동작합니다.
- 모든 날짜/시간은 서버 기준 UTC로 반환하고, 프론트에서 로컬 시간으로 변환합니다.
- 이미지 URL은 CDN 또는 S3 퍼블릭 URL로 반환하면 됩니다.
- 포인트 지급 로직은 서버에서 처리하며, 프론트는 API 호출 후 결과만 표시합니다.

---

# 부록. 프론트 신규 화면 관련 백엔드 제안 (협의 필요)

> 아래는 프론트에서 먼저 화면을 만든 기능들의 백엔드 계약 제안입니다.
> 현재는 mock 폴백으로 동작하며, 백엔드 구현 시 이 계약에 맞추면 바로 연동됩니다.

## A. [1순위] 회원가입 시 초대자↔가입자 자동 팔로우

`docs/auth.md`의 회원가입 시퀀스는 `invite_code.used_by`만 기록하고 **초대자와
가입자 사이의 follow(1촌) 엣지를 생성하지 않습니다.** 이 단계가 없으면 가입 직후
3촌 BFS 피드가 비어 첫 경험이 공허해집니다.

```
회원가입 트랜잭션에 추가:
  INSERT INTO follows (follower_id = 신규유저, following_id = 초대자)
  // 정책에 따라 양방향(초대자→신규유저)도 함께 생성 가능
```
→ 가입 즉시 초대자 및 그 2·3촌의 맛집이 피드에 노출됨. **콜드스타트 해결의 핵심.**

선택: `GET /api/v1/users/me` 응답에 `inviterNickname` 포함 시 온보딩 화면에
"OOO님의 초대로 시작했어요"를 노출할 수 있음(없으면 일반 문구로 폴백).

## B. 네이버 기반 맛집 검색 프록시 (맛집 등록 간소화)

맛집 등록 화면에서 네이버로 검색 → 선택 시 **네이버 플레이스 상세 URL + 좌표**까지
저장한다. 그러면 지도 핀 표시 + 네이버 상세 딥링크가 가능.

```
GET /api/v1/naver/search?query={검색어}
헤더: Authorization: Bearer {accessToken}

서버 처리:
  1) 네이버 지역검색 API로 좌표/주소/카테고리 확보
  2) 네이버 플레이스 상세 URL(m.place.naver.com/restaurant/{id})은 검색결과 크롤링으로 확보
  3) 좌표는 WGS84로 정규화 (네이버 TM128 mapx/mapy 변환은 서버 책임)

응답(ApiResponse data):
[
  {
    "name": "가게명",
    "category": "한식",
    "roadAddress": "서울 강남구 ...",
    "address": "서울 강남구 ...",
    "latitude": 37.4998,
    "longitude": 127.0365,
    "naverPlaceId": "12345678",
    "naverPlaceUrl": "https://m.place.naver.com/restaurant/12345678/home"
  }
]
```
⚠️ 크롤링은 네이버 ToS/구조 변경에 취약 → 결과 캐싱·실패 시 graceful 처리 권고.

### 맛집(리뷰) 등록 payload 확장
`restaurants` 테이블에 컬럼 추가: `naver_place_url, naver_place_id, latitude, longitude`.
등록 API body에 아래 필드를 포함해 upsert:
```
{ ..., "naverPlaceUrl": "...", "naverPlaceId": "...", "latitude": 37.5, "longitude": 127.0 }
```
→ `GET /api/v1/restaurants/feed` 응답의 각 맛집에도 `latitude, longitude, naverPlaceUrl` 포함 필요(지도 핀·딥링크용).

## C. 식당 저장(북마크) — 기획서 향후확장
```
GET    /api/v1/restaurants/saved          // 저장 목록 (Restaurant 배열)
POST   /api/v1/restaurants/{id}/save      // 저장
DELETE /api/v1/restaurants/{id}/save      // 저장 취소
```
현재는 localStorage로 동작. 백엔드 구현 시 서버 동기화로 전환.

## D. 알림 센터 — 기획서 향후확장(푸시 알림)
```
GET  /api/v1/notifications?page=0         // 알림 목록
POST /api/v1/notifications/{id}/read      // 단건 읽음
POST /api/v1/notifications/read-all       // 전체 읽음

알림 타입: review(친구 새 맛집) | follow(새 팔로워) | point(적립) | ranking(순위변동)
응답 항목: { id, type, title, body, timestamp, read, link }
```

## E. 친구 검색/팔로우 (온보딩·친구관리에서 사용 — 백엔드 설계와 일치)
```
GET    /api/v1/users/search?keyword=
POST   /api/v1/follows { targetUserId }
DELETE /api/v1/follows/{followingId}
```
> 참고: 현재 일부 구화면은 `/api/users/...` 경로를 쓰고 있어, 백엔드 정식 경로
> `/api/v1/follows`, `/api/v1/users/search` 로 추후 정합성 작업 필요.
