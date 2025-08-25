export const environment = {
  production: false,
  apiUrl: (globalThis as any)?.ENV?.["API_URL"] || "http://localhost:3000/api",
};
