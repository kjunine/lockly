# TRD: lockly - 기술 요구사항 정의서 (축소본)

> 이 문서는 compacts에 의해 축소되었습니다. 원본: [docs/archive/trd-m0-m3.md](archive/trd-m0-m3.md)

## MVP 캡슐

1. **목표(Outcome)**: 안전한 랜덤 패스워드를 CLI에서 즉시 생성
2. **페르소나/타깃 사용자**: 개발자, 시스템 관리자, CLI 파워 유저
3. **핵심 가치 제안**: `npx lockly` 한 줄로 암호학적으로 안전한 패스워드 즉시 생성
4. **EPIC-1**: 패스워드 생성 기능
5. **FEAT-1**: 옵션별 패스워드 생성 (길이, 문자종류, 개수 지정)
6. **노스스타 지표**: npm 주간 다운로드 수
7. **입력 지표**: (1) GitHub 스타 수, (2) CLI 실행 성공률 (에러율 < 0.1%)
8. **Non-goals**: (1) GUI/웹 인터페이스, (2) 패스워드 저장/관리, (3) 클라우드 동기화
9. **NFR Top 2**: (1) crypto.getRandomValues 기반 보안 랜덤 (NFR-1), (2) 응답 시간 < 50ms (NFR-2)
10. **데이터 민감도**: PII 없음, 상태 저장 없음, 생성된 패스워드는 stdout으로만 출력 후 보관하지 않음
11. **Top 리스크**: Math.random() 사용 시 예측 가능한 패스워드 생성 → 완화: node:crypto 모듈 강제 사용, lint 규칙으로 Math.random 금지
12. **다음 7일 액션**: MVP 구현 → 테스트 → npm publish

---

## Architecture Overview

### 1.1 모듈 구조

```
lockly/
├── src/
│   ├── cli.ts          # CLI 엔트리포인트 (commander 기반 파싱)
│   ├── generator.ts    # 패스워드 생성 핵심 로직 (crypto 기반)
│   └── index.ts        # 라이브러리 public API export
├── tests/
│   ├── generator.test.ts  # generator 단위 테스트
│   └── cli.test.ts        # CLI 통합 테스트
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .gitignore
├── LICENSE (MIT)
└── README.md
```

> **근거**: D-01 (단순 프로젝트), D-02 (Node.js + TypeScript)

### 1.2 모듈 경계 및 데이터 흐름

```
[사용자 입력 (CLI)]
        │
        ▼
   ┌─────────┐     옵션 파싱      ┌──────────────┐
   │  cli.ts  │ ──────────────►  │ commander    │
   └─────────┘                    └──────────────┘
        │
        │  파싱된 옵션 객체 (GenerateOptions)
        ▼
   ┌──────────────┐
   │ generator.ts │ ◄─── node:crypto.getRandomValues()
   └──────────────┘
        │
        │  생성된 패스워드 문자열 배열
        ▼
   [stdout 출력]
```

- **cli.ts**: 사용자 입력을 파싱하고 검증한 후 generator 모듈을 호출한다. 에러 시 stderr로 메시지를 출력하고 종료코드 1을 반환한다.
- **generator.ts**: 순수 함수로 구현된 패스워드 생성 로직. CLI 의존성 없이 독립적으로 사용 가능하다.
- **index.ts**: generator의 public API를 re-export하여 라이브러리로도 사용 가능하게 한다.

### 1.3 의존성 관계

| 모듈 | 의존하는 대상 | 역할 |
|------|-------------|------|
| `cli.ts` | `commander`, `generator.ts` | CLI 파싱 + 생성 호출 |
| `generator.ts` | `node:crypto` (내장) | 암호학적 랜덤 생성 |
| `index.ts` | `generator.ts` | 라이브러리 export |

> **근거**: D-03 (commander 선택), D-07 (stateless - DB 없음)

## NFR (비기능 요구사항)

| ID | 카테고리 | 요구사항 | 측정 기준 | 근거 |
|----|----------|----------|-----------|------|
| NFR-1 | 보안 | `crypto.getRandomValues()` 기반 CSPRNG 사용 | 코드 리뷰, ESLint 규칙 | RISK-1 |
| NFR-2 | 성능 | 패스워드 생성 응답 시간 50ms 이내 | 벤치마크 테스트 (길이 16, 개수 1) | D-06 |
| NFR-3 | 호환성 | Node.js 18+ LTS 지원 | CI에서 Node 18/20/22 테스트 | D-02 |
| NFR-4 | 크로스플랫폼 | Linux/macOS/Windows 동작 | 각 OS에서 수동 테스트 또는 CI matrix | D-08 |
| NFR-5 | 코드 품질 | 테스트 커버리지 90% 이상 | vitest coverage 리포트 | D-05 |
| NFR-6 | 접근성 | 명확한 에러 메시지, 종료코드 표준 준수 | 수동 검증 | - |
| NFR-7 | 빌드 | CJS/ESM 듀얼 출력 | tsup 빌드 결과물 검증 | D-04 |

## Coding Convention

| 항목 | 규칙 |
|------|------|
| 언어 | TypeScript (strict mode) |
| 포맷터 | Prettier (기본 설정) |
| 린터 | ESLint (추천 규칙 + Math.random 금지 커스텀 규칙) |
| 네이밍 | camelCase (변수/함수), PascalCase (타입/인터페이스) |
| export | named export 선호 (default export 지양) |
| 에러 처리 | 예외 throw 대신 명시적 에러 반환 선호 |
| 주석 | JSDoc 형식, public API에 필수 |

## Decision Log

| ID | 결정 | 근거 |
|----|------|------|
| D-01 | 프로젝트명 lockly, 단순하고 실용적 | 외부 API 불필요 |
| D-02 | Node.js + TypeScript (strict) | 빠른 개발, CLI 생태계, 타입 안전 |
| D-03 | commander (CLI 파서) | 가장 표준적, 문서 풍부 |
| D-04 | tsup (빌드 도구) | 제로설정, CJS/ESM 동시 출력 |
| D-05 | vitest (테스트) | 빠름, TypeScript 네이티브 |
| D-06 | 패스워드 강도 표시 → v2 보류 | MVP 스콥 제한 |
| D-07 | stateless 아키텍처 | DB 불필요, 단순성 |
| D-08 | 클립보드 자동 복사 → v2 보류 | MVP 스콥 제한 |
| D-09 | npm publish 배포 | 접근성 최고, npx 즉시 실행 |
| D-10 | MIT 라이선스 | 오픈소스 표준 |
