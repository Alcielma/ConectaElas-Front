import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.ufape.lmts.conectaelas",
  appName: "Conecta Elas",
  webDir: "dist",
  bundledWebRuntime: false,
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#E6005A",
      spinnerColor: "#ffffff",
      spinnerStyle: "small",
    },
  },
};

export default config;
