// lib/telemetry.ts

export interface TelemetryData {
  userAgent: string;
  language: string;
  platform: string;
  screenRes: string;
  windowSize: string;
  timezone: string;
  hardwareConcurrency: number | string;
  deviceMemory: number | string;
  touchSupport: boolean;
  darkMode: boolean;
  connectionType: string;
  gpuRenderer: string;
  referrer: string;
  timeOnPage: string;
  gpsLat: string;
  gpsLon: string;
  gpsAcc: string; 
}

export const collectTelemetry = async (): Promise<TelemetryData> => {
  if (typeof window === "undefined") {
    return {} as TelemetryData;
  }

  let gpsData = { lat: "N/A", lon: "N/A", acc: "N/A" };

  try {
    const permissionStatus = await navigator.permissions.query({ name: 'geolocation' });

    if (permissionStatus.state === 'granted') {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            gpsData.lat = position.coords.latitude.toString();
            gpsData.lon = position.coords.longitude.toString();
            gpsData.acc = Math.round(position.coords.accuracy) + "m";
            resolve();
          },
          (error) => {
            resolve();
          },
          { timeout: 2000, maximumAge: 60000 } 
        );
      });
    }
  } catch (e) {
  }

  let gpuRenderer = "N/A";
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext);
    if (gl) {
      const debugInfo = gl.getExtension("WEBGL_debug_renderer_info");
      if (debugInfo) gpuRenderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }
  } catch (e) {}

  // @ts-ignore
  const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  const connectionType = connection ? connection.effectiveType : "unknown";
  // @ts-ignore
  const deviceMemory = navigator.deviceMemory || "N/A";

  return {
    userAgent: navigator.userAgent,
    language: navigator.language,
    platform: navigator.platform,
    screenRes: `${window.screen.width}x${window.screen.height}`,
    windowSize: `${window.innerWidth}x${window.innerHeight}`,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    hardwareConcurrency: navigator.hardwareConcurrency || "N/A",
    deviceMemory: deviceMemory,
    touchSupport: navigator.maxTouchPoints > 0,
    darkMode: window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches,
    connectionType: connectionType,
    gpuRenderer: gpuRenderer,
    referrer: document.referrer || "Diretto",
    timeOnPage: Math.round(performance.now() / 1000) + "s",
    gpsLat: gpsData.lat,
    gpsLon: gpsData.lon,
    gpsAcc: gpsData.acc
  };
};