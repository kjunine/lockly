# Archive Index

## Compacts Archive (2026-02-17)

| 문서 | 아카이브 위치 | 비고 |
|------|-------------|------|
| tasks.md | archive/tasks-m0-m3.md | 완전 아카이브 |
| user-flow.md | archive/user-flow-m0-m3.md | 완전 아카이브 |
| database-design.md | archive/database-design-m0-m3.md | 완전 아카이브 |
| prd.md (원본) | archive/prd-m0-m3.md | 축소 보존 (MVP 캡슐 + Non-goals + Decision Log) |
| trd.md (원본) | archive/trd-m0-m3.md | 축소 보존 (MVP 캡슐 + 아키텍처 + Decision Log + 컨벤션 + NFR) |

### 수동 복원 절차

구현완료 아카이브를 되돌리려면 아래 절차를 따르세요:

1. **원본 문서 복원:**
   ```bash
   # 완전 아카이브된 문서 복원
   cp docs/archive/tasks-m0-m3.md docs/tasks.md
   cp docs/archive/user-flow-m0-m3.md docs/user-flow.md
   cp docs/archive/database-design-m0-m3.md docs/database-design.md

   # 축소된 PRD/TRD를 원본으로 교체
   cp docs/archive/prd-m0-m3.md docs/prd.md
   cp docs/archive/trd-m0-m3.md docs/trd.md
   ```

2. **아카이브 파일 정리:**
   ```bash
   rm -f docs/archive/tasks-m0-m3.md
   rm -f docs/archive/user-flow-m0-m3.md
   rm -f docs/archive/database-design-m0-m3.md
   rm -f docs/archive/prd-m0-m3.md
   rm -f docs/archive/trd-m0-m3.md
   ```

3. **검증:** `docs/` 에 5문서 모두 존재하는지 확인
