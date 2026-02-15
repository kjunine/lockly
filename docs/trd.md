# TRD: randpw - 기술 요구사항 정의서

## MVP 캡슐

1. **목표(Outcome)**: 안전한 랜덤 패스워드를 CLI에서 즉시 생성
2. **페르소나/타깃 사용자**: 개발자, 시스템 관리자, CLI 파워 유저
3. **핵심 가치 제안**: `npx randpw` 한 줄로 암호학적으로 안전한 패스워드 즉시 생성
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

## 1. Architecture Overview

### 1.1 모듈 구조

```
randpw/
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

## 2. NFR (비기능 요구사항)

| ID | 카테고리 | 요구사항 | 측정 기준 | 근거 |
|----|----------|----------|-----------|------|
| NFR-1 | 보안 | `crypto.getRandomValues()` 기반 CSPRNG 사용 | 코드 리뷰, ESLint 규칙 | RISK-1 |
| NFR-2 | 성능 | 패스워드 생성 응답 시간 50ms 이내 | 벤치마크 테스트 (길이 16, 개수 1) | D-06 |
| NFR-3 | 호환성 | Node.js 18+ LTS 지원 | CI에서 Node 18/20/22 테스트 | D-02 |
| NFR-4 | 크로스플랫폼 | Linux/macOS/Windows 동작 | 각 OS에서 수동 테스트 또는 CI matrix | D-08 |
| NFR-5 | 코드 품질 | 테스트 커버리지 90% 이상 | vitest coverage 리포트 | D-05 |
| NFR-6 | 접근성 | 명확한 에러 메시지, 종료코드 표준 준수 | 수동 검증 | - |
| NFR-7 | 빌드 | CJS/ESM 듀얼 출력 | tsup 빌드 결과물 검증 | D-04 |

## 3. Data Lifecycle

이 프로젝트는 **완전한 stateless** 아키텍처를 채택한다 (D-07).

| 단계 | 설명 |
|------|------|
| 수집 | 사용자 입력은 CLI 인자로만 수집 (메모리 내) |
| 처리 | `crypto.getRandomValues()`로 랜덤 바이트 생성 → 문자셋 매핑 |
| 출력 | stdout으로 패스워드 출력 |
| 보관 | **없음** - 패스워드는 프로세스 메모리에서 즉시 해제 |
| 삭제 | 프로세스 종료 시 자동 해제 (GC) |
| 익명화 | 해당 없음 (PII 수집하지 않음) |

> **보안 참고**: 생성된 패스워드는 프로세스 메모리에만 존재하며, stdout 출력 후 별도 저장하지 않는다. 파이프(`|`)를 통한 전달은 사용자의 책임이다.

## 4. AuthN/AuthZ 모델

해당 없음. 이 프로젝트는 인증/인가가 필요 없는 로컬 CLI 도구이다.

- 파일 시스템 접근: 없음
- 네트워크 접근: 없음
- 권한 모델: OS 레벨 사용자 권한으로만 동작

## 5. Integrations & API Contracts

### 5.1 CLI Interface (Public API)

```
randpw [options]

Options:
  -l, --length <number>   패스워드 길이 (기본: 16, 범위: 1-1024)
  -c, --count <number>    생성 개수 (기본: 1)
  --no-uppercase          대문자(A-Z) 제외
  --no-lowercase          소문자(a-z) 제외
  --no-numbers            숫자(0-9) 제외
  --no-symbols            특수문자 제외
  -V, --version           버전 표시
  -h, --help              도움말
```

**종료 코드**:
| 코드 | 의미 |
|------|------|
| 0 | 성공 |
| 1 | 에러 (잘못된 옵션, 검증 실패 등) |

### 5.2 Library API (Programmatic)

```typescript
// src/index.ts에서 export
interface GenerateOptions {
  length?: number;       // 기본: 16
  count?: number;        // 기본: 1
  uppercase?: boolean;   // 기본: true
  lowercase?: boolean;   // 기본: true
  numbers?: boolean;     // 기본: true
  symbols?: boolean;     // 기본: true
}

function generatePassword(options?: GenerateOptions): string[];
```

**에러 케이스**:
| 조건 | 에러 메시지 |
|------|------------|
| 모든 문자셋 제외 | "최소 1개 이상의 문자셋을 포함해야 합니다" |
| 길이 범위 초과 | "길이는 1~1024 사이여야 합니다" |
| count가 1 미만 | "count는 1 이상이어야 합니다" |
| 유효하지 않은 숫자 | "유효한 숫자를 입력해주세요" |

## 6. Stack Options & 비교

> **근거**: D-02 (Node.js + TypeScript), D-03 (commander), D-04 (tsup), D-05 (vitest)

### 6.1 언어/런타임 (D-02)

| 옵션 | 장점 | 단점 | 선택 |
|------|------|------|------|
| **Node.js + TypeScript** | 빠른 개발, CLI 생태계 풍부, 타입 안전 | 런타임 의존성 (Node.js 필요) | **선택** |
| Go | 단일 바이너리, 빠른 실행 | CLI 생태계 상대적 부족, 빌드 복잡 | 대안 |
| Rust | 최고 성능, 단일 바이너리 | 학습 곡선, 개발 속도 느림 | 대안 |
| Python | 간단한 문법 | 성능, 배포 복잡 | 대안 |

### 6.2 CLI 파서 (D-03)

| 옵션 | 장점 | 단점 | 선택 |
|------|------|------|------|
| **commander** | 가장 표준적, 문서 풍부, 자동 help | 약간의 boilerplate | **선택** |
| yargs | 풍부한 기능 | 번들 크기 큼 | 대안 |
| meow | 미니멀 | 기능 제한적 | 대안 |

### 6.3 빌드 도구 (D-04)

| 옵션 | 장점 | 단점 | 선택 |
|------|------|------|------|
| **tsup** | 제로설정, CJS/ESM 동시 출력 | esbuild 의존 | **선택** |
| tsc | 표준, 추가 의존성 없음 | 번들링 미지원 | 대안 |
| esbuild | 빠른 빌드 | 설정 필요 | 대안 |

### 6.4 테스트 (D-05)

| 옵션 | 장점 | 단점 | 선택 |
|------|------|------|------|
| **vitest** | 빠름, TypeScript 네이티브, Vite 호환 | 상대적 신규 | **선택** |
| jest | 성숙한 생태계 | TS 설정 복잡 | 대안 |
| node:test | 내장, 의존성 없음 | 기능 제한적 | 대안 |

### Lock-in / Cost / Ops 비교

| 항목 | 현재 선택 | Lock-in 수준 | 비용 | 운영 복잡도 |
|------|----------|-------------|------|------------|
| Node.js + TS | 낮음 (오픈소스 표준) | 무료 | 낮음 |
| commander | 낮음 (쉽게 교체 가능) | 무료 | 낮음 |
| tsup | 낮음 (tsc로 대체 가능) | 무료 | 낮음 |
| npm publish | 낮음 (표준 레지스트리) | 무료 | 낮음 |

## 7. Threat Modeling (STRIDE)

| 위협 | 카테고리 | 설명 | 위험도 | 완화 |
|------|----------|------|--------|------|
| 예측 가능한 랜덤 | Tampering | Math.random() 사용 시 패턴 예측 가능 | 치명적 | CSPRNG(`crypto.getRandomValues`) 강제, ESLint 규칙 (RISK-1) |
| 의존성 공급망 공격 | Tampering | commander 패키지 변조 | 중간 | package-lock.json 고정, npm audit 정기 실행 |
| stdout 도청 | Information Disclosure | 터미널 출력이 로그에 기록될 수 있음 | 낮음 | 사용자 안내 (README에 보안 가이드) |
| 인자 인젝션 | Spoofing | 셸 확장을 통한 악의적 인자 | 매우 낮음 | commander의 파싱이 자동 방어 |
| DoS (과도한 길이) | Denial of Service | length=999999로 메모리 과다 사용 | 낮음 | 길이 상한 1024 제한 (REQ-3) |

## 8. 레포/모듈 구조 및 브랜치 전략

### 8.1 레포 구조

```
randpw/
├── src/                    # 소스 코드
│   ├── cli.ts              # CLI 엔트리포인트
│   ├── generator.ts        # 핵심 로직
│   └── index.ts            # 라이브러리 export
├── tests/                  # 테스트
│   ├── generator.test.ts   # 단위 테스트
│   └── cli.test.ts         # 통합 테스트
├── dist/                   # 빌드 출력 (gitignore)
├── package.json
├── tsconfig.json
├── tsup.config.ts
├── vitest.config.ts
├── .eslintrc.json
├── .prettierrc
├── .gitignore
└── LICENSE
```

### 8.2 브랜치 전략

**main only** (D-01 단순 프로젝트)

- 모든 커밋은 main 브랜치에 직접 푸시
- 시맨틱 버저닝 사용 (0.x.x → 1.0.0)
- npm publish는 main에서 수동 실행 또는 CI 자동화

### 8.3 Coding Convention

| 항목 | 규칙 |
|------|------|
| 언어 | TypeScript (strict mode) |
| 포맷터 | Prettier (기본 설정) |
| 린터 | ESLint (추천 규칙 + Math.random 금지 커스텀 규칙) |
| 네이밍 | camelCase (변수/함수), PascalCase (타입/인터페이스) |
| export | named export 선호 (default export 지양) |
| 에러 처리 | 예외 throw 대신 명시적 에러 반환 선호 |
| 주석 | JSDoc 형식, public API에 필수 |

## 9. 접근성 요구사항

CLI 도구의 접근성은 다음을 포함한다:

| 항목 | 요구사항 |
|------|----------|
| 에러 메시지 | stderr로 출력, 명확한 한국어/영어 메시지 |
| 종료 코드 | 표준 Unix 관례 (0=성공, 1=에러) |
| 도움말 | `--help` 옵션으로 모든 사용법 표시 |
| 출력 형식 | 파이프 친화적 (줄바꿈 구분, 불필요한 장식 없음) |
| 색상 | stdout에 ANSI 색상 코드 미사용 (파이프 호환) |

> **참고**: 추가 레퍼런스 문서가 제공되지 않았으므로, 일반 모범사례 기반으로 작성하였습니다.
