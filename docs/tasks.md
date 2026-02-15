# TASKS: randpw - 구현 태스크

## Meta
- Last archived TASK: (없음)
- Last archived FEAT: (없음)
- Last D-XX: D-10
- Archive: (없음)

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

## Milestone 0: 프로젝트 개발 환경 설정

목적: 코드 작성 전에 레포 구조, 의존성, 품질 도구를 완비하여 이후 모든 태스크가 일관된 환경에서 시작되도록 한다.

---

### [TASK-001] 레포 초기화 및 디렉토리 구조 생성

**Status**: `completed`

**Context**:
- PRD: 프로젝트 구조 참조
- TRD: 섹션 1.1 모듈 구조, 섹션 8.1 레포 구조
- Decision: D-01 (프로젝트명 randpw), D-10 (MIT 라이선스)

**Files/Modules to touch**:
- `package.json` (신규)
- `tsconfig.json` (신규)
- `.gitignore` (신규)
- `LICENSE` (신규)
- `src/` 디렉토리 (신규)
- `tests/` 디렉토리 (신규)

**API/DB changes**: 없음

**Acceptance Criteria**:
- [x] `git init`으로 레포가 초기화되어 있다
- [x] `package.json`이 생성되어 있고, name=`randpw`, version=`0.1.0`, license=`MIT`가 설정되어 있다
- [x] `package.json`의 `bin` 필드에 `randpw` 엔트리가 설정되어 있다
- [x] `package.json`의 `engines` 필드에 `node >= 18` 이 명시되어 있다
- [x] `tsconfig.json`이 strict mode로 설정되어 있다
- [x] `src/` 디렉토리와 빈 엔트리 파일(`cli.ts`, `generator.ts`, `index.ts`)이 존재한다
- [x] `tests/` 디렉토리가 존재한다
- [x] `.gitignore`에 `node_modules/`, `dist/` 등이 포함되어 있다
- [x] `LICENSE` 파일이 MIT 라이선스 본문으로 생성되어 있다

**Self-review checklist**:
- [x] `package.json`의 `type` 필드가 올바르게 설정되어 있는가 (ESM 지원)
- [x] `tsconfig.json`의 target/module이 Node.js 18+에 적합한가
- [x] `.gitignore`에 OS 생성 파일(.DS_Store 등)이 포함되어 있는가

---

### [TASK-002] 의존성 설치 및 빌드 도구 구성

**Status**: `completed`

**Context**:
- TRD: 섹션 6 Stack Options
- Decision: D-02 (Node.js + TypeScript), D-03 (commander), D-04 (tsup), D-05 (vitest)

**Files/Modules to touch**:
- `package.json` (의존성 추가)
- `tsup.config.ts` (신규)
- `vitest.config.ts` (신규)
- `package-lock.json` (자동 생성)

**API/DB changes**: 없음

**Acceptance Criteria**:
- [x] 런타임 의존성 설치: `commander`
- [x] 개발 의존성 설치: `typescript`, `tsup`, `vitest`, `eslint`, `prettier`, `@types/node`
- [x] `tsup.config.ts`가 CJS/ESM 듀얼 출력으로 구성되어 있다 (NFR-7)
- [x] `vitest.config.ts`가 생성되어 있다
- [x] `npm install` 실행 시 에러 없이 완료된다
- [x] `package-lock.json`이 생성되어 있다

**Self-review checklist**:
- [x] 모든 의존성 버전이 `package-lock.json`에 고정되어 있는가
- [x] `tsup.config.ts`에서 `entry`, `format`, `dts` 등이 올바르게 설정되어 있는가
- [x] 불필요한 의존성이 포함되지 않았는가

---

### [TASK-003] 코드 품질 도구 구성 (ESLint + Prettier)

**Status**: `completed`

**Context**:
- TRD: 섹션 8.3 Coding Convention
- TRD: 섹션 7 Threat Modeling (Math.random 금지 lint 규칙)
- Decision: D-02 (TypeScript strict), RISK-1 (Math.random 금지)

**Files/Modules to touch**:
- `.eslintrc.json` (신규)
- `.prettierrc` (신규)
- `package.json` (scripts 추가)

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] `.eslintrc.json`이 TypeScript 추천 규칙으로 설정되어 있다
- [ ] ESLint에 `Math.random` 사용을 금지하는 규칙이 포함되어 있다 (RISK-1 완화)
- [ ] `.prettierrc`가 생성되어 있다
- [ ] `package.json`의 `scripts`에 `lint`, `format`, `format:check` 명령이 등록되어 있다
- [ ] `npm run lint` 실행 시 위반 0건이다
- [ ] `npm run format:check` 실행 시 변경 없음이다

**Self-review checklist**:
- [ ] ESLint와 Prettier 규칙 간 충돌이 없는가
- [ ] `Math.random` 금지 규칙이 `src/` 디렉토리에 적용되는가
- [ ] lint/format 도구 버전이 `package-lock.json`에 고정되어 있는가
- [ ] TRD Coding Convention 문서와 규칙이 일치하는가

---

### [TASK-004] 테스트 프레임워크 구성 및 샘플 테스트

**Status**: `completed`

**Context**:
- TRD: 섹션 6.4 테스트 (vitest 선택)
- NFR-5: 테스트 커버리지 90% 이상
- Decision: D-05 (vitest)

**Files/Modules to touch**:
- `vitest.config.ts` (업데이트)
- `tests/generator.test.ts` (신규 - 샘플 테스트)
- `package.json` (test scripts 추가)

**API/DB changes**: 없음

**Acceptance Criteria**:
- [x] `vitest.config.ts`에 coverage 설정이 포함되어 있다
- [x] `tests/generator.test.ts`에 최소 1개의 샘플 테스트가 작성되어 있다
- [x] `package.json`의 `scripts`에 `test`, `test:coverage` 명령이 등록되어 있다
- [x] `npm test` 실행 시 샘플 테스트가 통과한다

**Self-review checklist**:
- [x] vitest 버전이 `package-lock.json`에 고정되어 있는가
- [x] coverage 리포터가 적절하게 설정되어 있는가 (예: text, lcov)
- [x] CI에서도 동일한 `npm test` 명령이 동작하도록 구성되어 있는가

---

### [TASK-005] 통합 스크립트 등록 및 환경 검증

**Status**: `completed`

**Context**:
- Milestone 0 완료 조건
- TRD: 섹션 8 레포/모듈 구조

**Files/Modules to touch**:
- `package.json` (scripts 최종 정리)

**API/DB changes**: 없음

**Acceptance Criteria**:
- [x] `package.json`에 `build`, `lint`, `format`, `format:check`, `test`, `test:coverage` 스크립트가 모두 등록되어 있다
- [x] `npm run build` 실행 시 `dist/` 디렉토리에 CJS/ESM 출력물이 생성된다
- [x] `npm run lint` 실행 시 위반 0건이다
- [x] `npm run format:check` 실행 시 변경 없음이다
- [x] `npm test` 실행 시 모든 테스트가 통과한다
- [x] 정의된 디렉토리 구조(`src/`, `tests/`, `dist/`)가 모두 존재한다

**Self-review checklist**:
- [x] lint/format/test 각 도구 버전이 락파일에 고정되어 있는가
- [x] 불필요한 기본 규칙이 포함되지 않았는가 (TRD Coding Convention과 일치하는가)
- [x] CI에서도 동일 명령이 동작하도록 스크립트가 구성되어 있는가

---

## Milestone 1: 핵심 생성 로직 구현 (EPIC-1: FEAT-1, FEAT-2)

목적: 패스워드 생성의 핵심 로직을 구현하고 단위 테스트로 검증한다.

---

### [TASK-006] 문자셋 상수 및 타입 정의

**Status**: `in-progress`

**Context**:
- PRD: FEAT-1 (기본 패스워드 생성), FEAT-3 (문자셋 필터링)
- TRD: 섹션 5.2 Library API (GenerateOptions 인터페이스)
- Database Design: 섹션 2.2 문자셋 풀

**Files/Modules to touch**:
- `src/generator.ts`

**API/DB changes**: 없음

**Acceptance Criteria**:
- [x] `GenerateOptions` 인터페이스가 정의되어 있다 (length, count, uppercase, lowercase, numbers, symbols)
- [x] 4개 문자셋 상수가 정의되어 있다 (UPPERCASE, LOWERCASE, NUMBERS, SYMBOLS)
- [x] 모든 타입에 JSDoc 주석이 작성되어 있다
- [x] `src/index.ts`에서 `GenerateOptions` 타입이 re-export된다

**Self-review checklist**:
- [x] 특수문자 셋에 셸 해석 시 문제가 될 수 있는 문자가 올바르게 포함되어 있는가
- [x] named export를 사용하고 있는가 (TRD Coding Convention)

---

### [TASK-007] 패스워드 생성 핵심 함수 구현

**Status**: `pending`

**Context**:
- PRD: FEAT-1 (기본 생성), REQ-1 (crypto 기반), REQ-4 (stdout 출력)
- TRD: 섹션 1.2 데이터 흐름, 섹션 5.2 Library API
- User Flow: 섹션 1 메인 플로우
- Database Design: 섹션 2.3 랜덤 바이트 버퍼
- RISK-1: Math.random 사용 금지

**Files/Modules to touch**:
- `src/generator.ts`

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] `generatePassword(options?: GenerateOptions): string[]` 함수가 구현되어 있다
- [ ] `node:crypto.getRandomValues()`를 사용하여 랜덤 값을 생성한다 (REQ-1)
- [ ] 기본값: length=16, count=1, 모든 문자셋 활성화
- [ ] `Math.random()`이 코드 어디에도 사용되지 않는다 (RISK-1)
- [ ] 생성된 패스워드 길이가 요청된 length와 정확히 일치한다
- [ ] count만큼의 패스워드가 배열로 반환된다
- [ ] `src/index.ts`에서 `generatePassword` 함수가 re-export된다

**Self-review checklist**:
- [ ] 모듈로 바이어스(modulo bias) 문제가 처리되어 있는가 (문자셋 길이가 256의 약수가 아닌 경우)
- [ ] 함수가 순수 함수(pure function)인가 (외부 상태 의존 없음)
- [ ] JSDoc 주석이 작성되어 있는가

---

### [TASK-008] 입력 검증 로직 구현

**Status**: `pending`

**Context**:
- PRD: REQ-2 (최소 1개 문자셋), REQ-3 (길이 범위 1~1024), REQ-5 (count 검증)
- TRD: 섹션 5.2 에러 케이스
- User Flow: 섹션 7 에러 처리 플로우
- RISK-2: 모든 문자셋 제외 시 생성 불가

**Files/Modules to touch**:
- `src/generator.ts`

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] 길이가 1 미만이면 에러를 반환한다 (REQ-3)
- [ ] 길이가 1024 초과이면 에러를 반환한다 (REQ-3)
- [ ] 모든 문자셋이 비활성화되면 에러를 반환한다 (REQ-2, RISK-2)
- [ ] 에러 메시지가 명확하고 사용자 친화적이다
- [ ] count가 1 미만이면 에러를 반환한다 (REQ-5)

**Self-review checklist**:
- [ ] 경계값(1, 1024)에서 정상 동작하는가
- [ ] 에러 메시지가 TRD 섹션 5.2의 정의와 일치하는가
- [ ] 숫자가 아닌 값이 전달될 경우 처리되는가

---

### [TASK-009] generator 단위 테스트 작성

**Status**: `pending`

**Context**:
- PRD: FEAT-1, FEAT-2, REQ-1 ~ REQ-4
- NFR-5: 커버리지 90%+
- Decision: D-05 (vitest)

**Files/Modules to touch**:
- `tests/generator.test.ts`

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] 기본 옵션으로 16자 패스워드가 생성되는지 테스트한다 (FEAT-1)
- [ ] 지정된 길이로 패스워드가 생성되는지 테스트한다 (FEAT-2)
- [ ] count 옵션으로 다수의 패스워드가 생성되는지 테스트한다 (FEAT-4)
- [ ] 각 문자셋 필터링이 올바르게 동작하는지 테스트한다 (FEAT-3)
- [ ] 모든 문자셋 비활성화 시 에러가 발생하는지 테스트한다 (REQ-2, RISK-2)
- [ ] 길이 경계값(1, 1024, 0, 1025)에 대한 테스트가 있다 (REQ-3)
- [ ] 생성된 패스워드가 요청된 문자셋만 포함하는지 검증한다
- [ ] `npm test` 실행 시 모든 테스트가 통과한다

**Self-review checklist**:
- [ ] 엣지 케이스(길이 1, 최대 길이, 단일 문자셋만 활성화 등)가 커버되는가
- [ ] 테스트가 결정적(deterministic)인가 (랜덤이지만 속성 기반 검증)
- [ ] `generator.ts`의 커버리지가 90% 이상인가

---

## Milestone 2: CLI 통합 및 옵션 구현 (EPIC-1: FEAT-3, FEAT-4, FEAT-5)

목적: commander 기반 CLI를 구현하고 모든 옵션을 통합한다.

---

### [TASK-010] CLI 엔트리포인트 구현 (commander 통합)

**Status**: `pending`

**Context**:
- PRD: FEAT-5 (도움말/버전), 전체 CLI 옵션 목록
- TRD: 섹션 5.1 CLI Interface, 섹션 1.2 데이터 흐름
- User Flow: 섹션 1 메인 플로우, 섹션 6 도움말/버전 플로우
- Decision: D-03 (commander)

**Files/Modules to touch**:
- `src/cli.ts`

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] commander를 사용하여 CLI가 구현되어 있다
- [ ] `-l, --length <number>` 옵션이 동작한다 (FEAT-2)
- [ ] `-c, --count <number>` 옵션이 동작한다 (FEAT-4)
- [ ] `--no-uppercase`, `--no-lowercase`, `--no-numbers`, `--no-symbols` 옵션이 동작한다 (FEAT-3)
- [ ] `-V, --version` 옵션이 package.json 버전을 표시한다 (FEAT-5)
- [ ] `-h, --help` 옵션이 사용법을 표시한다 (FEAT-5)
- [ ] 생성 결과가 stdout으로 한 줄에 하나씩 출력된다 (REQ-4)
- [ ] 에러 시 stderr로 메시지를 출력하고 종료코드 1을 반환한다
- [ ] 성공 시 종료코드 0을 반환한다
- [ ] shebang(`#!/usr/bin/env node`)이 포함되어 있다

**Self-review checklist**:
- [ ] commander의 옵션 파싱 결과가 GenerateOptions로 올바르게 변환되는가
- [ ] 숫자 옵션(length, count)이 문자열이 아닌 숫자로 파싱되는가
- [ ] stdout에 ANSI 색상 코드가 포함되지 않는가 (NFR-6)

---

### [TASK-011] CLI 통합 테스트 작성

**Status**: `pending`

**Context**:
- PRD: 전체 FEAT (FEAT-1 ~ FEAT-5)
- TRD: 섹션 5.1 CLI Interface, 섹션 5.2 에러 케이스
- User Flow: 모든 섹션
- NFR-5: 커버리지 90%+

**Files/Modules to touch**:
- `tests/cli.test.ts`

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] 기본 실행(`randpw`)에서 16자 패스워드가 출력되는지 테스트한다
- [ ] `-l 32` 옵션으로 32자 패스워드가 출력되는지 테스트한다
- [ ] `-c 5` 옵션으로 5개 패스워드가 출력되는지 테스트한다
- [ ] `--no-symbols` 등 문자셋 필터링 옵션이 동작하는지 테스트한다
- [ ] `--version` 옵션이 버전을 출력하는지 테스트한다
- [ ] `--help` 옵션이 도움말을 출력하는지 테스트한다
- [ ] 잘못된 옵션 시 종료코드 1이 반환되는지 테스트한다
- [ ] 모든 문자셋 제외 시 에러 메시지가 출력되는지 테스트한다
- [ ] `npm test` 실행 시 모든 테스트가 통과한다

**Self-review checklist**:
- [ ] CLI 테스트가 실제 프로세스 실행(child_process) 방식으로 구현되어 있는가
- [ ] stdout과 stderr를 분리하여 검증하는가
- [ ] 종료코드를 검증하는가

---

## Milestone 3: 빌드, 문서화, 배포 준비

목적: npm publish 가능한 상태로 패키지를 완성한다.

---

### [TASK-012] 빌드 검증 및 패키지 구성 완료

**Status**: `pending`

**Context**:
- TRD: 섹션 6.3 빌드 도구 (tsup), NFR-7 (CJS/ESM 듀얼)
- Decision: D-04 (tsup), D-09 (npm publish)

**Files/Modules to touch**:
- `tsup.config.ts` (최종 확인)
- `package.json` (main, module, types, exports, files 필드)

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] `npm run build` 실행 시 에러 없이 `dist/` 에 출력물이 생성된다
- [ ] CJS(`dist/index.cjs`) 와 ESM(`dist/index.mjs` 또는 `dist/index.js`) 출력물이 모두 존재한다 (NFR-7)
- [ ] TypeScript 선언 파일(`dist/index.d.ts`)이 생성된다
- [ ] CLI 엔트리포인트(`dist/cli.js` 또는 `dist/cli.cjs`)가 생성된다
- [ ] `package.json`의 `main`, `module`, `types`, `exports`, `bin`, `files` 필드가 올바르게 설정되어 있다
- [ ] `npx .` 또는 `node dist/cli.js`로 로컬 실행이 가능하다

**Self-review checklist**:
- [ ] `files` 필드에 `dist/`만 포함되어 불필요한 파일이 배포되지 않는가
- [ ] `bin` 필드의 경로가 빌드 출력물과 일치하는가
- [ ] CJS/ESM 양쪽에서 라이브러리 import가 정상 동작하는가

---

### [TASK-013] README.md 작성

**Status**: `pending`

**Context**:
- PRD: 전체 (프로젝트 소개, 사용법)
- TRD: 섹션 5.1 CLI Interface (옵션 목록)
- Decision: D-09 (npm publish, npx 실행), D-10 (MIT 라이선스)

**Files/Modules to touch**:
- `README.md` (신규)

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] 프로젝트 설명 (한 줄 소개)이 포함되어 있다
- [ ] 설치 방법 (`npm install -g randpw`, `npx randpw`)이 안내되어 있다
- [ ] 사용법과 모든 CLI 옵션이 문서화되어 있다
- [ ] 사용 예시가 3개 이상 포함되어 있다
- [ ] 라이선스 (MIT) 표시가 있다
- [ ] 파이프 활용 예시 (`randpw | pbcopy`)가 포함되어 있다

**Self-review checklist**:
- [ ] 옵션 목록이 TRD 섹션 5.1과 일치하는가
- [ ] 예시 명령어가 실제로 동작하는가
- [ ] README에 패스워드 예시가 포함되지 않았는가 (보안 고려)

---

### [TASK-014] npm publish 준비 및 최종 검증

**Status**: `pending`

**Context**:
- PRD: Release Scope (M3)
- TRD: 전체 NFR 검증
- Decision: D-09 (npm publish)

**Files/Modules to touch**:
- `package.json` (최종 검토)
- `.npmignore` (신규, 필요 시)

**API/DB changes**: 없음

**Acceptance Criteria**:
- [ ] `npm run lint` 통과 (위반 0건)
- [ ] `npm run format:check` 통과 (변경 없음)
- [ ] `npm test` 통과 (전체 테스트 통과)
- [ ] `npm run build` 성공
- [ ] `npm pack`으로 생성되는 tarball에 불필요한 파일이 포함되지 않는다
- [ ] `package.json`의 `name`, `version`, `description`, `keywords`, `repository` 필드가 설정되어 있다
- [ ] Node.js 18 환경에서 정상 동작 확인 (NFR-3)
- [ ] 응답 시간이 50ms 이내인지 간단한 벤치마크로 확인 (NFR-2)

**Self-review checklist**:
- [ ] `npm whoami`로 npm 로그인 상태가 확인되는가
- [ ] 패키지명 `randpw`가 npm 레지스트리에서 사용 가능한가
- [ ] `npm publish --dry-run`으로 사전 검증을 했는가
- [ ] 시맨틱 버저닝 (0.1.0) 이 적절한가

---

## 태스크 요약

| 마일스톤 | 태스크 | 제목 | 관련 FEAT/REQ | Status |
|----------|--------|------|-------------|--------|
| M0 | TASK-001 | 레포 초기화 및 디렉토리 구조 생성 | - | `completed` |
| M0 | TASK-002 | 의존성 설치 및 빌드 도구 구성 | NFR-7 | `pending` |
| M0 | TASK-003 | 코드 품질 도구 구성 (ESLint + Prettier) | RISK-1 | `pending` |
| M0 | TASK-004 | 테스트 프레임워크 구성 및 샘플 테스트 | NFR-5 | `completed` |
| M0 | TASK-005 | 통합 스크립트 등록 및 환경 검증 | - | `pending` |
| M1 | TASK-006 | 문자셋 상수 및 타입 정의 | FEAT-1, FEAT-3 | `pending` |
| M1 | TASK-007 | 패스워드 생성 핵심 함수 구현 | FEAT-1, REQ-1, RISK-1 | `pending` |
| M1 | TASK-008 | 입력 검증 로직 구현 | REQ-2, REQ-3, REQ-5, RISK-2 | `pending` |
| M1 | TASK-009 | generator 단위 테스트 작성 | FEAT-1~4, REQ-1~4 | `pending` |
| M2 | TASK-010 | CLI 엔트리포인트 구현 | FEAT-2~5 | `pending` |
| M2 | TASK-011 | CLI 통합 테스트 작성 | FEAT-1~5 | `pending` |
| M3 | TASK-012 | 빌드 검증 및 패키지 구성 완료 | NFR-7 | `pending` |
| M3 | TASK-013 | README.md 작성 | - | `pending` |
| M3 | TASK-014 | npm publish 준비 및 최종 검증 | NFR-2, NFR-3 | `pending` |

> **참고**: 추가 레퍼런스 문서가 제공되지 않았으므로, 일반 모범사례 기반으로 작성하였습니다.
> Design: docs/design.md (존재 시) - UI 관련 태스크가 없으므로 이 프로젝트에서는 해당 없음.
