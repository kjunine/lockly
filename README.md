# randpw

암호학적으로 안전한 CLI 패스워드 생성기.

`node:crypto.getRandomValues()` 기반으로 예측 불가능한 랜덤 패스워드를 즉시 생성합니다.

## 설치

```bash
# npx로 즉시 사용 (설치 불필요)
npx randpw

# 또는 글로벌 설치
npm install -g randpw
```

## 사용법

```bash
# 기본: 16자 패스워드 생성
randpw

# 길이 지정
randpw -l 32

# 여러 개 생성
randpw -c 5

# 특수문자 제외
randpw --no-symbols

# 숫자만으로 생성
randpw --no-uppercase --no-lowercase --no-symbols

# 클립보드로 복사 (macOS)
randpw | pbcopy

# 클립보드로 복사 (Linux)
randpw | xclip -selection clipboard

# 파일로 저장
randpw -c 10 -l 32 > passwords.txt
```

## 옵션

| 옵션 | 설명 | 기본값 |
|------|------|--------|
| `-l, --length <number>` | 패스워드 길이 (1~1024) | 16 |
| `-c, --count <number>` | 생성 개수 | 1 |
| `--no-uppercase` | 대문자(A-Z) 제외 | 포함 |
| `--no-lowercase` | 소문자(a-z) 제외 | 포함 |
| `--no-numbers` | 숫자(0-9) 제외 | 포함 |
| `--no-symbols` | 특수문자 제외 | 포함 |
| `-V, --version` | 버전 표시 | - |
| `-h, --help` | 도움말 | - |

## 기술 스택

- TypeScript + Node.js 18+
- commander (CLI 파싱)
- node:crypto (암호학적 랜덤 생성)

## 라이선스

MIT
