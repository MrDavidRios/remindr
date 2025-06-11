import { createDefaultSettings } from "@remindr/shared";

export const getTestingSettings = () => {
  return {
    ...createDefaultSettings(),
    autoUpdate: process.env.AUTO_UPDATE === "true",
    startupMode: process.env.OFFLINE === "true" ? "offline" : "online",
    autoStartup: process.env.AUTO_STARTUP === "true",
  };
};
