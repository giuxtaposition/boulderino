{
  description = "Boulderino dev environment (Expo + Playwright on NixOS)";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = {
    self,
    nixpkgs,
    flake-utils,
  }:
    flake-utils.lib.eachDefaultSystem (
      system: let
        pkgs = import nixpkgs {
          inherit system;
          config = {
            allowUnfree = true;
            android_sdk.accept_license = true;
          };
        };

        buildToolsVersion = "36.0.0";
        ndkVersion = "27.1.12297006";

        androidComposition = pkgs.androidenv.composeAndroidPackages {
          cmdLineToolsVersion = "13.0";
          platformToolsVersion = "35.0.2";
          buildToolsVersions = [buildToolsVersion "35.0.0"];
          platformVersions = ["36" "35" "34"];
          abiVersions = ["arm64-v8a" "x86_64"];
          cmakeVersions = ["3.22.1"];
          includeNDK = true;
          ndkVersions = [ndkVersion];
          includeEmulator = false;
          includeSystemImages = false;
          includeSources = false;
          includeExtras = [];
        };

        androidSdk = androidComposition.androidsdk;
      in {
        devShells.default = pkgs.mkShell {
          packages = with pkgs; [
            nodejs_22
            pnpm
            git
            jdk17
            playwright-driver.browsers
            android-tools
            androidSdk
          ];

          env = {
            PLAYWRIGHT_BROWSERS_PATH = "${pkgs.playwright-driver.browsers}";
            PLAYWRIGHT_SKIP_VALIDATE_HOST_REQUIREMENTS = "true";
            JAVA_HOME = "${pkgs.jdk17}/lib/openjdk";
            ANDROID_HOME = "${androidSdk}/libexec/android-sdk";
            ANDROID_SDK_ROOT = "${androidSdk}/libexec/android-sdk";
            ANDROID_NDK_HOME = "${androidSdk}/libexec/android-sdk/ndk/${ndkVersion}";
            ANDROID_NDK_ROOT = "${androidSdk}/libexec/android-sdk/ndk/${ndkVersion}";
            GRADLE_OPTS = "-Dorg.gradle.project.android.aapt2FromMavenOverride=${androidSdk}/libexec/android-sdk/build-tools/${buildToolsVersion}/aapt2";
          };

          shellHook = ''
            unset PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
            echo "boulderino dev shell ready"
            echo "  JAVA_HOME=$JAVA_HOME"
            echo "  ANDROID_HOME=$ANDROID_HOME"
            echo "  ANDROID_NDK_HOME=$ANDROID_NDK_HOME"
            echo "  PLAYWRIGHT_BROWSERS_PATH=$PLAYWRIGHT_BROWSERS_PATH"
          '';
        };
      }
    );
}
