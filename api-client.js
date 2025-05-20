import { tokenManager } from "./auth.js";

const BASE_URL = "https://www.mcd.com.gt/voiceagent-api/v1";

// Helper function to get headers
async function getHeaders() {
  const token = await tokenManager.getToken();
  const headers = new Headers();

  headers.append("Authorization", `Bearer ${token}`);
  headers.append("Content-Type", "application/json");

  return headers;
}

// API client functions
export const client = {
  async get(endpoint, params) {
    const url = new URL(`${BASE_URL}${endpoint}`);

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, value);
      });
    }

    const response = await fetch(url.toString(), {
      headers: await getHeaders(),
    });

    if (!response.ok) {
      console.log(JSON.stringify(response));

      throw new Error(`Api request failed: ${response.statusText}`);
    }

    return response.json();
  },
};
