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
          },
        },
      ],
    ],
  };
};