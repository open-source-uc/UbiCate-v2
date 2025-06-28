import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "cl.uc.ubicate",
  appName: "UbiCate UC",
  server: {
    url: "https://ubicate.osuc.dev/",
    cleartext: false,
  }
};

export default config;
