# lockly

Cryptographically secure password generator CLI.

Generates unpredictable random passwords instantly using `node:crypto.getRandomValues()`.

## Features

- **Cryptographically secure** — CSPRNG via `node:crypto`
- **Fast** — under 50ms response time
- **Customizable** — length, character sets, count
- **Pipe-friendly** — clean stdout output, no ANSI colors
- **Zero install** — run instantly with `npx`

## Install

```bash
# Run instantly with npx (recommended)
npx lockly

# Or install globally
npm install -g lockly
```

## Usage

### Basic

```bash
# Default: generate a 16-character password
lockly

# Set length (32 characters)
lockly -l 32
lockly --length 32

# Generate multiple passwords (5)
lockly -c 5
lockly --count 5
```

### Character set filtering

```bash
# Exclude symbols
lockly --no-symbols

# Digits only (PIN)
lockly --no-uppercase --no-lowercase --no-symbols -l 6

# Uppercase and digits only
lockly --no-lowercase --no-symbols
```

### Piping

```bash
# Copy to clipboard (macOS)
lockly | pbcopy

# Copy to clipboard (Linux)
lockly | xclip -selection clipboard

# Copy to clipboard (Windows PowerShell)
lockly | Set-Clipboard

# Save to file
lockly -c 10 -l 32 > passwords.txt

# Set as environment variable
export DB_PASSWORD=$(lockly -l 24 --no-symbols)
```

## Options

| Option | Description | Default | Range |
|--------|-------------|---------|-------|
| `-l, --length <number>` | Password length | 16 | 1–1024 |
| `-c, --count <number>` | Number of passwords | 1 | 1+ |
| `--no-uppercase` | Exclude uppercase (A-Z) | included | - |
| `--no-lowercase` | Exclude lowercase (a-z) | included | - |
| `--no-numbers` | Exclude digits (0-9) | included | - |
| `--no-symbols` | Exclude symbols | included | - |
| `-V, --version` | Show version | - | - |
| `-h, --help` | Show help | - | - |

## Security

- **CSPRNG**: Uses `node:crypto.getRandomValues()` instead of `Math.random()`
- **Local execution**: No network requests — passwords are generated locally
- **Stateless**: Generated passwords are never stored
- **No modulo bias**: Rejection sampling ensures uniform distribution

### Security tips

- Store generated passwords immediately in a secure location (e.g. password manager)
- Use piping to avoid passwords appearing in terminal history
- Use `-l 32` or longer for high-security purposes (root accounts, financial services, etc.)

## Programmatic API

Use lockly as a library in your TypeScript/JavaScript project.

```typescript
import { generatePassword } from 'lockly';

// Default usage
const passwords = generatePassword();
console.log(passwords[0]); // 16-character password

// With options
const customPasswords = generatePassword({
  length: 32,
  count: 5,
  uppercase: true,
  lowercase: true,
  numbers: true,
  symbols: false
});
```

## Requirements

- Node.js 20+

## License

MIT
