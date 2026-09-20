import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.invocarem.lectiolatinreader",
  appName: "Lectio",
  webDir: "dist",
  ios: {
    contentInset: "never",
    preferredContentMode: "mobile",
    scheme: "LectioLatinReader",
  },
  plugins: {
    StatusBar: {
      style: "LIGHT",
      backgroundColor: "#f3ead8",
    },
    SplashScreen: {
      backgroundColor: "#f3ead8",
      launchAutoHide: true,
      launchShowDuration: 0,
    },
  },
};

export default config;
