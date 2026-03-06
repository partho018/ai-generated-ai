import { GoogleAuth } from "google-auth-library";
import path from "path";

const credentials = process.env.GOOGLE_SERVICE_ACCOUNT 
  ? JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT) 
  : undefined;

export const auth = new GoogleAuth({
  credentials,
  keyFilename: credentials ? undefined : path.join(process.cwd(), "original-crow-466907-f0-daecb73c47b5.json"),
  scopes: ["https://www.googleapis.com/auth/cloud-platform"],
});

export async function getGoogleAccessToken() {
  const client = await auth.getClient();
  const { token } = await client.getAccessToken();
  return token;
}
