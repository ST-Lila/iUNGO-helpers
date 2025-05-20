import dotenv from "dotenv";

dotenv.config();

let token = null;
let tokenExpiry = null;

export const tokenManager = {
  async getToken() {
    if (token && tokenExpiry && tokenExpiry > new Date()) {
      return token;
    }

    return await this.generateNewToken();
  },

  async generateNewToken() {
    const credentials = {
      username: process.env.MCDONALDS_API_USERNAME,
      password: process.env.MCDONALDS_API_PASSWORD,
    };

    try {
      const response = await fetch(
        "https://www.mcd.com.gt/voiceagent-api/oauth/token",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Basic ${Buffer.from(
              `${credentials.username}:${credentials.password}`
            ).toString("base64")}`,
          },
          body: new URLSearchParams({
            grant_type: "client_credentials",
            scope: "any",
          }),
        }
      );

      if (!response.ok) {
        console.log(response);
        throw new Error("Failed to generate token");
      }

      const data = await response.json();
      token = data.access_token;

      // Set token expiry to 15 minutes from now
      tokenExpiry = new Date(Date.now() + 900000);

      return token;
    } catch (error) {
      console.error("Error generating token:", error);
      throw error;
    }
  },
};
