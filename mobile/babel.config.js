module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '@': './',
            '@zk-kit/utils/conversions': './node_modules/@zk-kit/utils/dist/lib.esm/conversions.js',
            '@zk-kit/utils/type-checks': './node_modules/@zk-kit/utils/dist/lib.esm/type-checks.js',
            '@zk-kit/utils/error-handlers': './node_modules/@zk-kit/utils/dist/lib.esm/error-handlers.js',
            '@zk-kit/utils/f1-field': './node_modules/@zk-kit/utils/dist/lib.esm/f1-field.js',
            '@zk-kit/utils/scalar': './node_modules/@zk-kit/utils/dist/lib.esm/scalar.js',
            '@zk-kit/utils/proof-packing': './node_modules/@zk-kit/utils/dist/lib.esm/proof-packing.js',
            'ethers/crypto': './node_modules/ethers/lib.esm/crypto/index.js',
            'ethers/utils': './node_modules/ethers/lib.esm/utils/index.js',
            'ethers/abi': './node_modules/ethers/lib.esm/abi/index.js',
            '@semaphore-protocol/utils/constants': './node_modules/@semaphore-protocol/utils/dist/lib.esm/constants.js'
          },
        },
      ],
      ["module:react-native-dotenv", {
        "moduleName": "@env",
        "path": ".env",
        "blacklist": null,
        "whitelist": null,
        "safe": false,
        "allowUndefined": true
      }]
    ],
  };
};