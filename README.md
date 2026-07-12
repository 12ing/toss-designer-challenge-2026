# Toss 2026 Challenge

Vite + React + TypeScript + Tailwind CSS 기반 프론트엔드 SPA입니다.
백엔드 없이 Mock API 레이어로 DecisionCard 인터랙션을 구현하고 Vercel에 배포합니다.

## Tech Stack

- **Framework:** Vite + React + TypeScript
- **Styling:** Tailwind CSS v4
- **Data:** 타입 정의된 Mock + `src/api` 추상화 (네트워크 지연 시뮬레이션 포함)
- **Deploy:** Vercel

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | 로컬 개발 서버 |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드 결과 미리보기 |
| `npm run lint` | Oxlint |
| `npx vercel` | Vercel 배포 (CLI 로그인 필요) |

## Project Structure

```
src/
  api/           # Mock API (실제 API로 교체 가능한 레이어)
  components/    # UI 컴포넌트
  data/          # Mock 데이터
  hooks/         # 클라이언트 상태 훅
  types/         # 공유 타입 (DecisionCard 등)
```

## Deploy (Vercel)

1. [Vercel](https://vercel.com)에 GitHub 저장소 연결, 또는
2. `npx vercel`로 CLI 배포

`vercel.json`에 Vite 빌드/출력 경로와 SPA rewrite가 설정되어 있습니다.
