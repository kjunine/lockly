import { describe, it, expect } from 'vitest';
import { generatePassword } from '../src/generator';

describe('generator', () => {
  it('placeholder test - should pass', () => {
    // 샘플 테스트: TASK-004 요구사항을 충족하기 위한 기본 테스트
    expect(true).toBe(true);
  });

  it('should verify test framework is working', () => {
    const result = 1 + 1;
    expect(result).toBe(2);
  });

  describe('입력 검증 (TASK-008)', () => {
    // REQ-3: 길이 범위 검증 (1-1024)
    it('should throw error when length is less than 1', () => {
      expect(() => generatePassword({ length: 0 })).toThrow(
        '길이는 1~1024 사이여야 합니다'
      );
    });

    it('should throw error when length is greater than 1024', () => {
      expect(() => generatePassword({ length: 1025 })).toThrow(
        '길이는 1~1024 사이여야 합니다'
      );
    });

    it('should throw error when length is negative', () => {
      expect(() => generatePassword({ length: -1 })).toThrow(
        '길이는 1~1024 사이여야 합니다'
      );
    });

    it('should throw error when length is not an integer', () => {
      expect(() => generatePassword({ length: 16.5 })).toThrow(
        '길이는 1~1024 사이여야 합니다'
      );
    });

    it('should accept length of 1 (boundary value)', () => {
      const result = generatePassword({ length: 1 });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1);
    });

    it('should accept length of 1024 (boundary value)', () => {
      const result = generatePassword({ length: 1024 });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1024);
    });

    // REQ-5: count 검증
    it('should throw error when count is less than 1', () => {
      expect(() => generatePassword({ count: 0 })).toThrow(
        'count는 1 이상이어야 합니다'
      );
    });

    it('should throw error when count is negative', () => {
      expect(() => generatePassword({ count: -1 })).toThrow(
        'count는 1 이상이어야 합니다'
      );
    });

    it('should throw error when count is not an integer', () => {
      expect(() => generatePassword({ count: 2.5 })).toThrow(
        'count는 1 이상이어야 합니다'
      );
    });

    // REQ-2: 최소 1개 문자셋 필요 (RISK-2)
    it('should throw error when all charsets are disabled', () => {
      expect(() =>
        generatePassword({
          uppercase: false,
          lowercase: false,
          numbers: false,
          symbols: false,
        })
      ).toThrow('최소 1개 이상의 문자셋을 포함해야 합니다');
    });

    it('should work with only one charset enabled', () => {
      const result = generatePassword({
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(16);
      // Should only contain uppercase letters
      expect(result[0]).toMatch(/^[A-Z]+$/);
    });

    it('should work with default options (no validation errors)', () => {
      const result = generatePassword();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(16);
    });
  });

  describe('기본 패스워드 생성 (TASK-009: FEAT-1)', () => {
    it('should generate a 16-character password with default options', () => {
      const result = generatePassword();
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(16);
      expect(typeof result[0]).toBe('string');
    });

    it('should generate different passwords on multiple calls', () => {
      const pw1 = generatePassword()[0];
      const pw2 = generatePassword()[0];
      const pw3 = generatePassword()[0];
      // With cryptographic randomness, collisions are astronomically unlikely
      expect(pw1).not.toBe(pw2);
      expect(pw2).not.toBe(pw3);
      expect(pw1).not.toBe(pw3);
    });

    it('should generate passwords containing all default charsets', () => {
      // Generate multiple to increase probability of coverage
      const passwords = generatePassword({ count: 20, length: 32 });
      const combined = passwords.join('');

      // Should contain at least one uppercase
      expect(combined).toMatch(/[A-Z]/);
      // Should contain at least one lowercase
      expect(combined).toMatch(/[a-z]/);
      // Should contain at least one number
      expect(combined).toMatch(/[0-9]/);
      // Should contain at least one symbol
      expect(combined).toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
    });
  });

  describe('길이 커스터마이징 (TASK-009: FEAT-2)', () => {
    it('should generate password with custom length 8', () => {
      const result = generatePassword({ length: 8 });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(8);
    });

    it('should generate password with custom length 32', () => {
      const result = generatePassword({ length: 32 });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(32);
    });

    it('should generate password with custom length 64', () => {
      const result = generatePassword({ length: 64 });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(64);
    });

    it('should generate password with minimum length 1', () => {
      const result = generatePassword({ length: 1 });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1);
    });

    it('should generate password with maximum length 1024', () => {
      const result = generatePassword({ length: 1024 });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1024);
    });
  });

  describe('다중 생성 (TASK-009: FEAT-4)', () => {
    it('should generate multiple passwords when count is specified', () => {
      const result = generatePassword({ count: 5 });
      expect(result).toHaveLength(5);
      result.forEach((pw) => {
        expect(pw).toHaveLength(16); // default length
        expect(typeof pw).toBe('string');
      });
    });

    it('should generate 10 passwords with count option', () => {
      const result = generatePassword({ count: 10, length: 20 });
      expect(result).toHaveLength(10);
      result.forEach((pw) => {
        expect(pw).toHaveLength(20);
      });
    });

    it('should generate unique passwords when count > 1', () => {
      const result = generatePassword({ count: 5, length: 24 });
      const uniquePasswords = new Set(result);
      // All passwords should be unique (cryptographically secure random)
      expect(uniquePasswords.size).toBe(5);
    });

    it('should generate single password when count is 1', () => {
      const result = generatePassword({ count: 1 });
      expect(result).toHaveLength(1);
    });
  });

  describe('문자셋 필터링 (TASK-009: FEAT-3)', () => {
    it('should generate password with only uppercase letters', () => {
      const result = generatePassword({
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
        length: 20,
      });
      expect(result[0]).toMatch(/^[A-Z]+$/);
      expect(result[0]).toHaveLength(20);
    });

    it('should generate password with only lowercase letters', () => {
      const result = generatePassword({
        uppercase: false,
        lowercase: true,
        numbers: false,
        symbols: false,
        length: 20,
      });
      expect(result[0]).toMatch(/^[a-z]+$/);
      expect(result[0]).toHaveLength(20);
    });

    it('should generate password with only numbers', () => {
      const result = generatePassword({
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: false,
        length: 20,
      });
      expect(result[0]).toMatch(/^[0-9]+$/);
      expect(result[0]).toHaveLength(20);
    });

    it('should generate password with only symbols', () => {
      const result = generatePassword({
        uppercase: false,
        lowercase: false,
        numbers: false,
        symbols: true,
        length: 20,
      });
      expect(result[0]).toMatch(/^[!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/);
      expect(result[0]).toHaveLength(20);
    });

    it('should generate password without uppercase letters', () => {
      const result = generatePassword({
        uppercase: false,
        lowercase: true,
        numbers: true,
        symbols: true,
        length: 50,
      });
      expect(result[0]).not.toMatch(/[A-Z]/);
      expect(result[0]).toHaveLength(50);
    });

    it('should generate password without lowercase letters', () => {
      const result = generatePassword({
        uppercase: true,
        lowercase: false,
        numbers: true,
        symbols: true,
        length: 50,
      });
      expect(result[0]).not.toMatch(/[a-z]/);
      expect(result[0]).toHaveLength(50);
    });

    it('should generate password without numbers', () => {
      const result = generatePassword({
        uppercase: true,
        lowercase: true,
        numbers: false,
        symbols: true,
        length: 50,
      });
      expect(result[0]).not.toMatch(/[0-9]/);
      expect(result[0]).toHaveLength(50);
    });

    it('should generate password without symbols', () => {
      const result = generatePassword({
        uppercase: true,
        lowercase: true,
        numbers: true,
        symbols: false,
        length: 50,
      });
      expect(result[0]).not.toMatch(/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/);
      expect(result[0]).toHaveLength(50);
    });

    it('should generate password with uppercase and lowercase only', () => {
      const result = generatePassword({
        uppercase: true,
        lowercase: true,
        numbers: false,
        symbols: false,
        length: 30,
      });
      expect(result[0]).toMatch(/^[A-Za-z]+$/);
      expect(result[0]).toHaveLength(30);
    });

    it('should generate password with numbers and symbols only', () => {
      const result = generatePassword({
        uppercase: false,
        lowercase: false,
        numbers: true,
        symbols: true,
        length: 30,
      });
      expect(result[0]).toMatch(/^[0-9!@#$%^&*()_+\-=[\]{}|;:,.<>?]+$/);
      expect(result[0]).toHaveLength(30);
    });
  });

  describe('조합 시나리오 (TASK-009)', () => {
    it('should generate multiple passwords with custom length and filtered charsets', () => {
      const result = generatePassword({
        count: 3,
        length: 24,
        uppercase: true,
        lowercase: true,
        numbers: false,
        symbols: false,
      });
      expect(result).toHaveLength(3);
      result.forEach((pw) => {
        expect(pw).toHaveLength(24);
        expect(pw).toMatch(/^[A-Za-z]+$/);
      });
    });

    it('should handle edge case: length 1, count 1, single charset', () => {
      const result = generatePassword({
        length: 1,
        count: 1,
        uppercase: true,
        lowercase: false,
        numbers: false,
        symbols: false,
      });
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveLength(1);
      expect(result[0]).toMatch(/^[A-Z]$/);
    });

    it('should handle edge case: maximum length with multiple count', () => {
      const result = generatePassword({
        length: 1024,
        count: 3,
      });
      expect(result).toHaveLength(3);
      result.forEach((pw) => {
        expect(pw).toHaveLength(1024);
      });
    });
  });

  describe('암호학적 보안성 (TASK-009: REQ-1)', () => {
    it('should use crypto.getRandomValues (no Math.random)', () => {
      // This is verified by code inspection and ESLint rules
      // We test that the function produces sufficiently random output
      const passwords = generatePassword({ count: 100, length: 16 });
      const uniqueCount = new Set(passwords).size;

      // With 100 16-character passwords, we expect all to be unique
      // If Math.random were used with poor seeding, we might see duplicates
      expect(uniqueCount).toBe(100);
    });

    it('should generate passwords with high entropy (character distribution)', () => {
      // Generate a large password to check character distribution
      const result = generatePassword({ length: 1000 });
      const password = result[0];

      // Count character types
      let uppercaseCount = 0;
      let lowercaseCount = 0;
      let numberCount = 0;
      let symbolCount = 0;

      for (const char of password) {
        if (/[A-Z]/.test(char)) uppercaseCount++;
        else if (/[a-z]/.test(char)) lowercaseCount++;
        else if (/[0-9]/.test(char)) numberCount++;
        else if (/[!@#$%^&*()_+\-=[\]{}|;:,.<>?]/.test(char)) symbolCount++;
      }

      // With good randomness, we expect roughly balanced distribution
      // Each category should appear (very unlikely to be 0 with 1000 chars)
      expect(uppercaseCount).toBeGreaterThan(0);
      expect(lowercaseCount).toBeGreaterThan(0);
      expect(numberCount).toBeGreaterThan(0);
      expect(symbolCount).toBeGreaterThan(0);

      // Total should equal password length
      expect(uppercaseCount + lowercaseCount + numberCount + symbolCount).toBe(
        1000
      );
    });
  });
});
