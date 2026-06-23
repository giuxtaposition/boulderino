const path = require("path");

const onnxruntimeRoot = path.dirname(
  require.resolve("onnxruntime-react-native/package.json"),
);

module.exports = {
  dependencies: {
    "onnxruntime-react-native": {
      root: onnxruntimeRoot,
      platforms: {
        android: {
          sourceDir: "android",
          packageImportPath:
            "import ai.onnxruntime.reactnative.OnnxruntimePackage;",
          packageInstance: "new OnnxruntimePackage()",
        },
        ios: {
          podspecPath: path.join(
            onnxruntimeRoot,
            "onnxruntime-react-native.podspec",
          ),
        },
      },
    },
  },
};
