const { pathsToModuleNameMapper } = require('ts-jest');

/** @type {import('jest').Config} */
module.exports = {
  preset: 'jest-preset-angular',
  setupFilesAfterEnv: ['<rootDir>/projects/bursit-angular/src/setup-jest.ts'],
  testEnvironment: 'jsdom',
  moduleNameMapper: pathsToModuleNameMapper(
    {
      'bursit-angular': ['./dist/bursit-angular'],
    },
    { prefix: '<rootDir>/' }
  ),
  coverageDirectory: '<rootDir>/coverage',
  // @angular-builders/jest injects its own testMatch - scoped to the project root and
  // limited to [tj]s?(x) - so Jest's default patterns never apply under `npm run test`
  // and `scripts/check-contrast.spec.mjs` would never be collected. The first entry
  // restates the builder's pattern exactly (the library set is unchanged); the second one
  // adds the contrast harness's behavioural contract test (rebrand-palette task 1.7).
  testMatch: ['**/projects/bursit-angular/**/*(*.)@(spec|test).[tj]s?(x)', '**/scripts/**/*.spec.mjs'],
  collectCoverageFrom: [
    'projects/bursit-angular/src/lib/**/*.ts',
    '!projects/bursit-angular/src/lib/**/*.spec.ts',
    '!projects/bursit-angular/src/lib/**/*.stories.ts',
    '!projects/bursit-angular/src/lib/**/index.ts',
    '!projects/bursit-angular/src/lib/**/public-api.ts',
  ],
  transformIgnorePatterns: ['node_modules/(?!.*\\.mjs$)'],
  transform: {
    '^.+\\.(ts|js|mjs|html|svg)$': [
      'jest-preset-angular',
      {
        tsconfig: '<rootDir>/projects/bursit-angular/tsconfig.spec.json',
        stringifyContentPathRegex: '\\.(html|svg)$',
      },
    ],
  },
  modulePathIgnorePatterns: ['<rootDir>/dist/'],
};
