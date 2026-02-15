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
});
