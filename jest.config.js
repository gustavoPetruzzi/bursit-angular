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
  collectCoverageFrom: [
    'projects/bursit-angular/src/lib/**/*.ts',
    '!projects/bursit-angular/src/lib/**/*.spec.ts',
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
