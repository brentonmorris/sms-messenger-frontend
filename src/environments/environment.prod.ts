export const environment = {
  production: true,
  apiUrl: (globalThis as any)?.ENV?.["API_URL"] || "https://messenger-api-9488028ef35c.herokuapp.com/api",
};
