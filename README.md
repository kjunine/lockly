# randpw

암호학적으로 안전한 CLI 패스워드 생성기.

`node:crypto.getRandomValues()` 기반으로 예측 불가능한 랜덤 패스워드를 즉시 생성합니다.

## 특징

- 🔒 **암호학적으로 안전**: `node:crypto` 모듈 기반 CSPRNG 사용
- ⚡ **빠른 실행**: 50ms 이내 응답 시간
- 🎯 **유연한 커스터마이징**: 길이, 문자셋, 개수 지정 가능
- 🔧 **파이프 친화적**: stdout 출력으로 다른 도구와 연동 가능
- 📦 **설치 불필요**: `npx`로 즉시 사용

## 설치

```bash
# npx로 즉시 사용 (설치 불필요, 권장)
npx randpw

# 또는 글로벌 설치
npm install -g randpw
```

## 사용법

### 기본 사용

```bash
# 기본: 16자 패스워드 생성
randpw

# 길이 지정 (32자)
randpw -l 32
randpw --length 32

# 여러 개 생성 (5개)
randpw -c 5
randpw --count 5
```

### 문자셋 필터링

```bash
# 특수문자 제외
randpw --no-symbols

# 숫자만으로 생성 (PIN 번호)
randpw --no-uppercase --no-lowercase --no-symbols -l 6

# 대문자와 숫자만 사용
randpw --no-lowercase --no-symbols
```

### 파이프 활용

```bash
# 클립보드로 복사 (macOS)
randpw | pbcopy

# 클립보드로 복사 (Linux)
randpw | xclip -selection clipboard

# 클립보드로 복사 (Windows PowerShell)
randpw | Set-Clipboard

# 파일로 저장
randpw -c 10 -l 32 > passwords.txt

# 환경변수로 설정
export DB_PASSWORD=$(randpw -l 24 --no-symbols)
```

## 옵션

| 옵션 | 설명 | 기본값 | 범위 |
|------|------|--------|------|
| `-l, --length <number>` | 패스워드 길이 | 16 | 1~1024 |
| `-c, --count <number>` | 생성 개수 | 1 | 1 이상 |
| `--no-uppercase` | 대문자(A-Z) 제외 | 포함 | - |
| `--no-lowercase` | 소문자(a-z) 제외 | 포함 | - |
| `--no-numbers` | 숫자(0-9) 제외 | 포함 | - |
| `--no-symbols` | 특수문자 제외 | 포함 | - |
| `-V, --version` | 버전 표시 | - | - |
| `-h, --help` | 도움말 | - | - |

## 보안

- **CSPRNG 사용**: `Math.random()` 대신 `node:crypto.getRandomValues()` 사용
- **로컬 실행**: 네트워크 전송 없이 로컬에서 즉시 생성
- **무상태(Stateless)**: 생성된 패스워드를 저장하지 않음
- **모듈로 바이어스 처리**: 균등 분포를 위한 리젝션 샘플링 적용

### 보안 가이드

- 생성된 패스워드는 즉시 안전한 저장소(패스워드 매니저 등)에 저장하세요
- 터미널 히스토리에 패스워드가 남지 않도록 파이프 사용을 권장합니다
- 중요한 용도(루트 계정, 금융 서비스 등)에는 `-l 32` 이상의 길이를 권장합니다

## 라이브러리로 사용

TypeScript/JavaScript 프로젝트에서 라이브러리로도 사용할 수 있습니다.

```typescript
import { generatePassword } from 'randpw';

// 기본 사용
const passwords = generatePassword();
console.log(passwords[0]); // 16자 패스워드

// 옵션 지정
const customPasswords = generatePassword({
  length: 32,
  count: 5,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false
});
```

## 요구사항

- Node.js 18 이상

## 기술 스택

- TypeScript + Node.js 18+
- commander (CLI 파싱)
- node:crypto (암호학적 랜덤 생성)
- tsup (빌드 도구)
- vitest (테스트)

## 라이선스

MIT
