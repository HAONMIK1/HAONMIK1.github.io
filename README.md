# 낙낙 프론트엔드

낙낙(Naknack) 소셜 맛집 추천 플랫폼의 프론트엔드 애플리케이션입니다.

## 🚀 빠른 시작

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 생성하고 백엔드 API 주소를 설정하세요:

```bash
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

### 3. 개발 서버 실행

```bash
npm run dev
```

프론트엔드는 `http://localhost:5173`에서 실행됩니다.

## 📁 프로젝트 구조

```
client/
├── src/
│   ├── api/              # API 클라이언트 (백엔드 연동)
│   ├── components/       # React 컴포넌트
│   │   ├── ui/          # shadcn/ui 컴포넌트
│   │   └── ...          # 기능별 컴포넌트
│   ├── pages/           # 페이지 컴포넌트
│   ├── hooks/           # Custom React Hooks
│   ├── lib/             # 유틸리티 및 설정
│   ├── App.tsx          # 메인 앱 컴포넌트
│   └── main.tsx         # 앱 진입점
├── public/              # 정적 파일
├── index.html
├── package.json
└── vite.config.ts
```

## 🔗 백엔드 연동

백엔드 API와 통신하기 위해 `src/api/` 디렉토리에 API 클라이언트 함수를 정의합니다.

### 현재 구현된 API

- **랭킹 API** (`src/api/ranking.ts`)
  - `getWeekly()` - 주간 랭킹
  - `getMonthly()` - 월간 랭킹
  - `getFriends()` - 친구 랭킹

### API 사용 예시

```typescript
import { rankingApi } from "@/api/ranking";
import { useQuery } from "@tanstack/react-query";

const { data, isLoading, error } = useQuery({
  queryKey: ["rankings", "weekly"],
  queryFn: () => rankingApi.getWeekly(0, 50),
});
```

## 🛠 기술 스택

- **React 18** - UI 라이브러리
- **TypeScript** - 타입 안정성
- **Vite** - 빌드 도구
- **React Query** - 서버 상태 관리
- **Wouter** - 라우팅
- **Tailwind CSS** - 스타일링
- **shadcn/ui** - UI 컴포넌트

## 📝 빌드

프로덕션 빌드:

```bash
npm run build
```

빌드 결과물은 `dist/` 디렉토리에 생성됩니다.

## 🔧 개발

### 백엔드 서버 실행

프론트엔드를 실행하기 전에 백엔드 서버가 실행되어 있어야 합니다:

```bash
# 백엔드 디렉토리에서
./gradlew bootRun
```

### CORS 설정

백엔드의 `application.yml`에 이미 CORS 설정이 완료되어 있습니다.

## 📚 참고

- [백엔드 API 문서](../docs/API_SPEC.md)
- [프로젝트 README](../README.md)

