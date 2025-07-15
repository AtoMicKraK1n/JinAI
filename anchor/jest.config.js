const { createDefaultPreset } = require("ts-jest");

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
module.exports = {
  testTimeout: 60000, // 60 seconds timeout for blockchain tests
  preset: "ts-jest",
  testEnvironment: "node",
};
