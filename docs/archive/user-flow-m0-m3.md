# User Flow: randpw - 사용자 흐름

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

## 1. 메인 플로우: 패스워드 생성 (FEAT-1 ~ FEAT-5)

사용자가 CLI 명령을 실행하면 옵션을 파싱하고, 검증을 거쳐 패스워드를 생성하여 출력하는 전체 흐름이다.

```mermaid
flowchart TD
    A["사용자: CLI 명령 실행<br/>예: randpw -l 24 -c 3 --no-symbols"]
    B["cli.ts: commander로 인자 파싱<br/>(FEAT-5)"]
    C{"-V / --version?"}
    D["버전 출력 → 종료코드 0"]
    E{"-h / --help?"}
    F["도움말 출력 → 종료코드 0"]
    G["옵션 객체 구성<br/>GenerateOptions"]
    H{"길이 범위 검증<br/>(REQ-3: 1~1024)"}
    I["stderr: '길이는 1~1024 사이여야 합니다'<br/>→ 종료코드 1"]
    J{"문자셋 검증<br/>(REQ-2: 최소 1개)"}
    K["stderr: '최소 1개 이상의 문자셋을<br/>포함해야 합니다'<br/>→ 종료코드 1"]
    L["generator.ts:<br/>crypto.getRandomValues() 호출<br/>(REQ-1)"]
    M["문자셋에서 랜덤 인덱스로<br/>문자 선택 반복"]
    N["패스워드 배열 생성 완료"]
    O["stdout: 줄바꿈 구분 출력<br/>(REQ-4)"]
    P["종료코드 0"]

    A --> B
    B --> C
    C -->|예| D
    C -->|아니오| E
    E -->|예| F
    E -->|아니오| G
    G --> H
    H -->|실패| I
    H -->|통과| J
    J -->|실패| K
    J -->|통과| L
    L --> M
    M --> N
    N --> O
    O --> P
```

## 2. 기본 사용 플로우 (FEAT-1)

옵션 없이 기본값으로 패스워드를 생성하는 가장 일반적인 흐름이다.

```mermaid
flowchart LR
    A["$ npx randpw"] --> B["파싱: 기본값 적용<br/>length=16, count=1<br/>모든 문자셋 ON"]
    B --> C["crypto.getRandomValues()<br/>16바이트 생성"]
    C --> D["stdout: xK9#mP2$vL7&nQ4!"]
    D --> E["종료코드 0"]
```

## 3. 길이 커스터마이징 플로우 (FEAT-2)

```mermaid
flowchart LR
    A["$ randpw -l 32"] --> B{"32는 1~1024 범위?"}
    B -->|예| C["32자 패스워드 생성"]
    C --> D["stdout 출력"]

    A2["$ randpw -l 0"] --> B2{"0은 1~1024 범위?"}
    B2 -->|아니오| E2["stderr: 에러 메시지<br/>종료코드 1"]

    A3["$ randpw -l 2000"] --> B3{"2000은 1~1024 범위?"}
    B3 -->|아니오| E3["stderr: 에러 메시지<br/>종료코드 1"]
```

## 4. 문자셋 필터링 플로우 (FEAT-3)

```mermaid
flowchart TD
    A["$ randpw --no-symbols --no-numbers"]
    B["문자셋 계산:<br/>uppercase=ON, lowercase=ON<br/>numbers=OFF, symbols=OFF"]
    C{"활성 문자셋 >= 1?<br/>(REQ-2)"}
    D["[A-Z] + [a-z] 풀에서 생성"]
    E["stdout: kXmPvLnQwBtRyHjD"]

    A --> B --> C
    C -->|예| D --> E

    F["$ randpw --no-uppercase<br/>--no-lowercase --no-numbers<br/>--no-symbols"]
    G["문자셋 계산:<br/>모든 셋 OFF"]
    H{"활성 문자셋 >= 1?"}
    I["stderr: '최소 1개 이상의<br/>문자셋을 포함해야 합니다'<br/>종료코드 1"]

    F --> G --> H
    H -->|아니오| I
```

## 5. 다중 생성 플로우 (FEAT-4)

```mermaid
flowchart LR
    A["$ randpw -c 5 -l 20"] --> B["5회 반복 생성<br/>각 20자"]
    B --> C["stdout:<br/>aB3$xK9mP2vL7nQ4wR1t<br/>yH5&jD8fG0sZ6cX3bN7q<br/>mW2!pE9kT4uI6oA1lF8v<br/>rJ5#hC7gY0dS3xB9nM2w<br/>qL4&zU8eP1tK6vR3oA7f"]
    C --> D["종료코드 0"]
```

## 6. 도움말/버전 플로우 (FEAT-5)

```mermaid
flowchart LR
    A["$ randpw --help"] --> B["commander 자동 생성<br/>도움말 출력"]
    B --> C["종료코드 0"]

    D["$ randpw --version"] --> E["package.json 버전 출력"]
    E --> F["종료코드 0"]
```

## 7. 에러 처리 플로우 (RISK-2)

```mermaid
flowchart TD
    A["사용자 입력"]
    B{"인자 파싱 성공?"}
    C["commander 기본 에러 처리<br/>stderr 출력, 종료코드 1"]
    D{"숫자 유효성?<br/>(length, count)"}
    E["stderr: '유효한 숫자를<br/>입력해주세요'<br/>종료코드 1"]
    F{"길이 범위?<br/>(REQ-3)"}
    G["stderr: 범위 에러<br/>종료코드 1"]
    H{"문자셋 유효?<br/>(REQ-2)"}
    I["stderr: 문자셋 에러<br/>종료코드 1"]
    J["정상 생성 진행"]

    A --> B
    B -->|실패| C
    B -->|성공| D
    D -->|실패| E
    D -->|성공| F
    F -->|실패| G
    F -->|성공| H
    H -->|실패| I
    H -->|성공| J
```

## 8. 파이프 활용 플로우 (UC-4)

stdout만 사용하므로 Unix 파이프와 자연스럽게 연동된다.

```mermaid
flowchart LR
    A["$ randpw | pbcopy"] --> B["패스워드 생성<br/>→ stdout"]
    B --> C["pbcopy가 stdin으로<br/>수신 → 클립보드 저장"]

    D["$ randpw -c 10 > passwords.txt"] --> E["패스워드 10개 생성<br/>→ stdout"]
    E --> F["셸 리다이렉션으로<br/>파일 저장"]

    G["$ randpw -l 32 --no-symbols<br/>| xargs -I {} echo 'PW={}'"] --> H["패스워드 생성<br/>→ stdout"]
    H --> I["xargs로 후속 명령에<br/>패스워드 전달"]
```

## 9. 흐름 요약

| 흐름 | 관련 FEAT/REQ | 입력 예시 | 출력 |
|------|-------------|-----------|------|
| 기본 생성 | FEAT-1, REQ-1, REQ-4 | `randpw` | 16자 패스워드 1개 |
| 길이 지정 | FEAT-2, REQ-3 | `randpw -l 32` | 32자 패스워드 |
| 문자셋 필터 | FEAT-3, REQ-2 | `randpw --no-symbols` | 특수문자 제외 패스워드 |
| 다중 생성 | FEAT-4, REQ-4 | `randpw -c 5` | 패스워드 5개 (줄바꿈 구분) |
| 도움말/버전 | FEAT-5 | `randpw --help` | 사용법 출력 |
| 에러 | REQ-2, REQ-3, RISK-2 | `randpw --no-uppercase --no-lowercase --no-numbers --no-symbols` | 에러 메시지 + 종료코드 1 |
| 파이프 연동 | REQ-4 | `randpw \| pbcopy` | 클립보드 저장 |

> **참고**: 추가 레퍼런스 문서가 제공되지 않았으므로, 일반 모범사례 기반으로 작성하였습니다.
