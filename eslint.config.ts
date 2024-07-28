import stylisticTs from '@stylistic/eslint-plugin-ts';

export default [
  {
    plugins: {
      '@stylistic/ts': stylisticTs,
    },
    rules: {
      '@typescript-eslint/indent': ['error', 2],
      '@stylistic/ts/indent': ['error', 2],
    },
  },
];
