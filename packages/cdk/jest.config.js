module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.cdk.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  }
};
