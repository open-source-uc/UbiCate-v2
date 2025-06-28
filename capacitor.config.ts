import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cl.osuc.ubicate",
  appName: "UbiCate",
  server: {
    url: "https://ubicate.osuc.dev/",
    cleartext: false,
    errorPath: "index.html",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      backgroundColor: "#150b04",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_INSIDE",
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
