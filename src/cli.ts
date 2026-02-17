/**
 * CLI entrypoint for lockly
 * Parses command-line arguments and generates passwords
 */

import { Command } from 'commander';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { generatePassword } from './generator.js';

// Read version from package.json
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const packageJsonPath = join(__dirname, '../package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
  version: string;
};
const version = packageJson.version;

const program = new Command();

program
  .name('lockly')
  .description('Cryptographically secure random password generator')
  .version(version, '-V, --version', '버전 표시')
  .option(
    '-l, --length <number>',
    '패스워드 길이 (기본: 16, 범위: 1-1024)',
    '16'
  )
  .option('-c, --count <number>', '생성 개수 (기본: 1)', '1')
  .option('--no-uppercase', '대문자(A-Z) 제외')
  .option('--no-lowercase', '소문자(a-z) 제외')
  .option('--no-numbers', '숫자(0-9) 제외')
  .option('--no-symbols', '특수문자 제외')
  .helpOption('-h, --help', '도움말');

program.parse();

const options = program.opts<{
  length: string;
  count: string;
  uppercase: boolean;
  lowercase: boolean;
  numbers: boolean;
  symbols: boolean;
}>();

// Parse numeric options
const length = parseInt(options.length, 10);
const count = parseInt(options.count, 10);

// Validate numeric parsing
if (isNaN(length)) {
  console.error('유효한 숫자를 입력해주세요 (length)');
  process.exit(1);
}

if (isNaN(count)) {
  console.error('유효한 숫자를 입력해주세요 (count)');
  process.exit(1);
}

try {
  // Generate passwords
  const passwords = generatePassword({
    length,
    count,
    uppercase: options.uppercase,
    lowercase: options.lowercase,
    numbers: options.numbers,
    symbols: options.symbols,
  });

  // Output to stdout (one password per line)
  for (const password of passwords) {
    console.log(password);
  }

  // Success exit
  process.exit(0);
} catch (error) {
  // Output error to stderr
  if (error instanceof Error) {
    console.error(error.message);
  } else {
    console.error('알 수 없는 에러가 발생했습니다');
  }

  // Error exit
  process.exit(1);
}
