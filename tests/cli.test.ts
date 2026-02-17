/**
 * CLI integration tests
 * Tests the actual CLI binary by spawning child processes
 */

import { describe, it, expect, beforeAll } from 'vitest';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_PATH = join(__dirname, '../dist/cli.js');

/**
 * Helper function to execute the CLI with given arguments
 */
async function runCLI(args: string[] = []): Promise<{
  stdout: string;
  stderr: string;
  exitCode: number;
}> {
  try {
    const { stdout, stderr } = await execFileAsync('node', [CLI_PATH, ...args]);
    return { stdout, stderr, exitCode: 0 };
  } catch (error: unknown) {
    // execFile throws on non-zero exit codes
    const err = error as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: err.stdout || '',
      stderr: err.stderr || '',
      exitCode: err.code || 1,
    };
  }
}

describe('CLI Integration Tests (TASK-011)', () => {
  beforeAll(async () => {
    // Ensure build is up to date
    // Note: In CI, build should be run before tests
    // This test assumes dist/cli.js exists
  });

  describe('기본 실행 (FEAT-1)', () => {
    it('should generate a 16-character password with default options', async () => {
      const { stdout, stderr, exitCode } = await runCLI();

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const lines = stdout.trim().split('\n');
      expect(lines).toHaveLength(1);

      const password = lines[0];
      expect(password).toHaveLength(16);
      expect(typeof password).toBe('string');
    });

    it('should generate different passwords on each run', async () => {
      const result1 = await runCLI();
      const result2 = await runCLI();
      const result3 = await runCLI();

      const pw1 = result1.stdout.trim();
      const pw2 = result2.stdout.trim();
      const pw3 = result3.stdout.trim();

      // All should be unique
      expect(pw1).not.toBe(pw2);
      expect(pw2).not.toBe(pw3);
      expect(pw1).not.toBe(pw3);
    });
  });

  describe('길이 옵션 (FEAT-2)', () => {
    it('should generate 32-character password with -l 32', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-l', '32']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(32);
    });

    it('should generate 8-character password with --length 8', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['--length', '8']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(8);
    });

    it('should generate 1-character password with -l 1', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-l', '1']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(1);
    });

    it('should generate 1024-character password with -l 1024', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-l', '1024']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(1024);
    });

    it('should return error for length 0', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-l', '0']);

      expect(exitCode).toBe(1);
      expect(stderr).toContain('길이는 1~1024 사이여야 합니다');
      expect(stdout).toBe('');
    });

    it('should return error for length 1025', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-l', '1025']);

      expect(exitCode).toBe(1);
      expect(stderr).toContain('길이는 1~1024 사이여야 합니다');
      expect(stdout).toBe('');
    });

    it('should return error for invalid length (non-numeric)', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-l', 'abc']);

      expect(exitCode).toBe(1);
      expect(stderr).toContain('유효한 숫자를 입력해주세요');
      expect(stdout).toBe('');
    });
  });

  describe('개수 옵션 (FEAT-4)', () => {
    it('should generate 5 passwords with -c 5', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-c', '5']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const lines = stdout.trim().split('\n');
      expect(lines).toHaveLength(5);

      lines.forEach((password) => {
        expect(password).toHaveLength(16); // default length
      });
    });

    it('should generate 10 passwords with --count 10', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['--count', '10']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const lines = stdout.trim().split('\n');
      expect(lines).toHaveLength(10);
    });

    it('should generate 3 passwords with custom length', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '-c',
        '3',
        '-l',
        '24',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const lines = stdout.trim().split('\n');
      expect(lines).toHaveLength(3);

      lines.forEach((password) => {
        expect(password).toHaveLength(24);
      });
    });

    it('should return error for count 0', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-c', '0']);

      expect(exitCode).toBe(1);
      expect(stderr).toContain('count는 1 이상이어야 합니다');
      expect(stdout).toBe('');
    });

    it('should return error for invalid count (non-numeric)', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-c', 'xyz']);

      expect(exitCode).toBe(1);
      expect(stderr).toContain('유효한 숫자를 입력해주세요');
      expect(stdout).toBe('');
    });
  });

  describe('문자셋 필터링 (FEAT-3)', () => {
    it('should generate password without symbols using --no-symbols', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '--no-symbols',
        '-l',
        '50',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(50);
      // Should not contain symbols
      expect(password).not.toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
      // Should contain other charsets
      expect(password).toMatch(/[A-Za-z0-9]+/);
    });

    it('should generate password without uppercase using --no-uppercase', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '--no-uppercase',
        '-l',
        '50',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(50);
      // Should not contain uppercase
      expect(password).not.toMatch(/[A-Z]/);
    });

    it('should generate password without lowercase using --no-lowercase', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '--no-lowercase',
        '-l',
        '50',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(50);
      // Should not contain lowercase
      expect(password).not.toMatch(/[a-z]/);
    });

    it('should generate password without numbers using --no-numbers', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '--no-numbers',
        '-l',
        '50',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(50);
      // Should not contain numbers
      expect(password).not.toMatch(/[0-9]/);
    });

    it('should generate password with only uppercase (all others disabled)', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '--no-lowercase',
        '--no-numbers',
        '--no-symbols',
        '-l',
        '30',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(30);
      // Should only contain uppercase
      expect(password).toMatch(/^[A-Z]+$/);
    });

    it('should return error when all charsets are disabled', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '--no-uppercase',
        '--no-lowercase',
        '--no-numbers',
        '--no-symbols',
      ]);

      expect(exitCode).toBe(1);
      expect(stderr).toContain('최소 1개 이상의 문자셋을 포함해야 합니다');
      expect(stdout).toBe('');
    });

    it('should handle multiple charset filters combined', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '--no-uppercase',
        '--no-symbols',
        '-l',
        '40',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const password = stdout.trim();
      expect(password).toHaveLength(40);
      // Should only contain lowercase and numbers
      expect(password).toMatch(/^[a-z0-9]+$/);
    });
  });

  describe('도움말 및 버전 (FEAT-5)', () => {
    it('should display version with --version', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['--version']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');
      expect(stdout).toMatch(/0\.1\.0/);
    });

    it('should display version with -V', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-V']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');
      expect(stdout).toMatch(/0\.1\.0/);
    });

    it('should display help with --help', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['--help']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('lockly');
      expect(stdout).toContain('Options:');
      expect(stdout).toContain('-l, --length');
      expect(stdout).toContain('-c, --count');
      expect(stdout).toContain('--no-uppercase');
      expect(stdout).toContain('--no-lowercase');
      expect(stdout).toContain('--no-numbers');
      expect(stdout).toContain('--no-symbols');
      expect(stdout).toContain('-V, --version');
      expect(stdout).toContain('-h, --help');
    });

    it('should display help with -h', async () => {
      const { stdout, stderr, exitCode } = await runCLI(['-h']);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');
      expect(stdout).toContain('Usage:');
      expect(stdout).toContain('lockly');
    });
  });

  describe('에러 처리', () => {
    it('should return exit code 1 on validation error', async () => {
      const { exitCode } = await runCLI(['-l', '0']);
      expect(exitCode).toBe(1);
    });

    it('should output error message to stderr (not stdout)', async () => {
      const { stdout, stderr } = await runCLI(['-l', '0']);

      expect(stdout).toBe('');
      expect(stderr).not.toBe('');
      expect(stderr).toContain('길이는 1~1024 사이여야 합니다');
    });

    it('should return exit code 0 on success', async () => {
      const { exitCode } = await runCLI();
      expect(exitCode).toBe(0);
    });
  });

  describe('조합 시나리오', () => {
    it('should handle complex combination of options', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '-l',
        '20',
        '-c',
        '3',
        '--no-symbols',
        '--no-numbers',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const lines = stdout.trim().split('\n');
      expect(lines).toHaveLength(3);

      lines.forEach((password) => {
        expect(password).toHaveLength(20);
        expect(password).toMatch(/^[A-Za-z]+$/);
      });
    });

    it('should work with all options specified', async () => {
      const { stdout, stderr, exitCode } = await runCLI([
        '-l',
        '16',
        '-c',
        '2',
        '--no-uppercase',
      ]);

      expect(exitCode).toBe(0);
      expect(stderr).toBe('');

      const lines = stdout.trim().split('\n');
      expect(lines).toHaveLength(2);

      lines.forEach((password) => {
        expect(password).toHaveLength(16);
        expect(password).not.toMatch(/[A-Z]/);
      });
    });
  });

  describe('출력 형식 검증 (REQ-4)', () => {
    it('should output one password per line', async () => {
      const { stdout, exitCode } = await runCLI(['-c', '5']);

      expect(exitCode).toBe(0);

      const lines = stdout.trim().split('\n');
      expect(lines).toHaveLength(5);

      // Each line should be a valid password (no extra whitespace)
      lines.forEach((line) => {
        expect(line).toBe(line.trim());
        expect(line.length).toBeGreaterThan(0);
      });
    });

    it('should not include ANSI color codes in output (NFR-6)', async () => {
      const { stdout } = await runCLI();

      // Check for common ANSI escape sequences
      // eslint-disable-next-line no-control-regex
      expect(stdout).not.toMatch(/\x1b\[/);
      // eslint-disable-next-line no-control-regex
      expect(stdout).not.toMatch(/\u001b\[/);
    });

    it('should output clean text suitable for piping', async () => {
      const { stdout, exitCode } = await runCLI();

      expect(exitCode).toBe(0);

      const password = stdout.trim();
      // Should be just the password, no decorations
      expect(password.split('\n')).toHaveLength(1);
      expect(password).toMatch(/^[A-Za-z0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/);
    });
  });
});
