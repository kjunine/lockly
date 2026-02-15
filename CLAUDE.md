# randpw - CLI 패스워드 생성기

## 프로젝트 개요

암호학적으로 안전한 CLI 패스워드 생성기. `npx randpw` 한 줄로 즉시 사용 가능.

## 기술 스택

- **언어**: TypeScript (strict mode)
- **런타임**: Node.js 18+
- **CLI 파서**: commander
- **빌드**: tsup (CJS/ESM 듀얼 출력)
- **테스트**: vitest (커버리지 90%+)
- **린터**: ESLint + Prettier

## 프로젝트 구조

```
src/
├── cli.ts          # CLI 엔트리포인트 (commander)
├── generator.ts    # 패스워드 생성 핵심 로직 (crypto)
└── index.ts        # 라이브러리 public API export
tests/
├── generator.test.ts
└── cli.test.ts
```

## 빌드 및 실행

```bash
npm install          # 의존성 설치
npm run build        # 빌드 (dist/ 출력)
npm run lint         # ESLint 검사
npm run format:check # Prettier 검사
npm test             # 테스트 실행
npm run test:coverage # 커버리지 리포트
```

## 코딩 컨벤션

- named export 사용 (default export 지양)
- camelCase (변수/함수), PascalCase (타입/인터페이스)
- `Math.random()` 사용 금지 — 반드시 `node:crypto.getRandomValues()` 사용
- JSDoc 주석: public API에 필수
- 에러 처리: 예외 throw 대신 명시적 에러 반환 선호
- stdout에 ANSI 색상 코드 미사용

## 핵심 규칙

- 패스워드 생성은 반드시 `node:crypto` 모듈만 사용 (RISK-1)
- 길이 범위: 1~1024 (REQ-3)
- 최소 1개 문자셋 필수 (REQ-2)
- 상태 저장 없음 (stateless)
