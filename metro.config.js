const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");
const path = require('path');

const config = getDefaultConfig(__dirname);

config.resolver.extraNodeModules = {
  assert: require.resolve("empty-module"),
  http: require.resolve("empty-module"),
  https: require.resolve("empty-module"),
  os: require.resolve("empty-module"),
  url: require.resolve("empty-module"),
  zlib: require.resolve("empty-module"),
  path: require.resolve("empty-module"),
  crypto: require.resolve("crypto-browserify"),
  stream: require.resolve("stream-browserify"),
  buffer: require.resolve("buffer"),
  events: require.resolve("events/"),
  '@zk-kit/utils/conversions': path.resolve(__dirname, 'node_modules/@zk-kit/utils/dist/lib.esm/conversions.js'),
  '@zk-kit/utils/type-checks': path.resolve(__dirname, 'node_modules/@zk-kit/utils/dist/lib.esm/type-checks.js'),
  '@zk-kit/utils/error-handlers': path.resolve(__dirname, 'node_modules/@zk-kit/utils/dist/lib.esm/error-handlers.js'),
  '@zk-kit/utils/f1-field': path.resolve(__dirname, 'node_modules/@zk-kit/utils/dist/lib.esm/f1-field.js'),
  '@zk-kit/utils/scalar': path.resolve(__dirname, 'node_modules/@zk-kit/utils/dist/lib.esm/scalar.js'),
};

config.transformer.getTransformOptions = () => ({
  transform: {
    experimentalImportSupport: false,
    inlineRequires: true,
  },
});

module.exports = withNativeWind(config, { input: "./global.css" });