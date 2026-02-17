import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintConfigPrettier from 'eslint-config-prettier';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintConfigPrettier,
  {
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      'no-restricted-globals': [
        'error',
        {
          name: 'Math',
          message:
            'Math.random()은 보안상 안전하지 않습니다. node:crypto 모듈의 getRandomValues()를 사용하세요. (RISK-1)',
        },
      ],
      'no-restricted-properties': [
        'error',
        {
          object: 'Math',
          property: 'random',
          message:
            'Math.random()은 암호학적으로 안전하지 않습니다. node:crypto 모듈의 getRandomValues()를 사용하세요. (RISK-1)',
        },
      ],
    },
  },
  {
    ignores: ['dist/**', 'node_modules/**', '*.config.js', '*.config.ts'],
  },
);
