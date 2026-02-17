# PRD: lockly - CLI 패스워드 생성기 (축소본)

> 이 문서는 compacts에 의해 축소되었습니다. 원본: [docs/archive/prd-m0-m3.md](archive/prd-m0-m3.md)

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

## Non-goals

- GUI/웹 인터페이스 구축
- 패스워드 저장/관리 기능 (패스워드 매니저 영역)
- 클라우드 동기화 또는 원격 저장
- 클립보드 자동 복사 (v2에서 고려, D-08)
- 패스워드 강도 표시 (v2에서 고려, D-06)
- Homebrew/바이너리 배포 (v2에서 고려, D-09)

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

## Risks & Assumptions 요약

- **RISK-1**: Math.random() 사용 시 예측 가능한 패스워드 생성 → node:crypto 강제, ESLint 규칙으로 완화
- **RISK-2**: 모든 문자셋 제외 시 생성 불가 → 입력 검증으로 차단, 명확한 에러 메시지 제공
- **가정**: Node.js 18+ 환경 설치, CLI 사용에 익숙한 사용자, npm 레지스트리를 통한 배포가 접근성 최고
