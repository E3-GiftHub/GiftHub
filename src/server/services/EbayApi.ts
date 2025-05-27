import axios from "axios";
import qs from "qs";

const EBAY_OAUTH_URL = "https://api.sandbox.ebay.com/identity/v1/oauth2/token";
const EBAY_BROWSE_URL = "https://api.sandbox.ebay.com/buy/browse/v1/item_summary/search";

const CLIENT_ID = process.env.EBAY_APP_ID!;
const CLIENT_SECRET = process.env.EBAY_SECRET!;

function getBasicAuthHeader(): string {
  const raw = `${CLIENT_ID}:${CLIENT_SECRET}`;
  return Buffer.from(raw).toString("base64");
}

async function getAccessToken(): Promise<string> {
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
    Authorization: `Basic ${getBasicAuthHeader()}`,
  };

  const body = qs.stringify({
    grant_type: "client_credentials",
    scope: "https://api.ebay.com/oauth/api_scope",
  });

  const res = await axios.post(EBAY_OAUTH_URL, body, { headers });
  console.log("response status: ", res.statusText);
  return res.data.access_token;
}


export async function searchEbayProducts(query: string) {
  const accessToken = await getAccessToken();
  
  const headers = {
    Authorization: `Bearer ${accessToken}`,
    "Content-Type": "application/json",
  };

  const res = await axios.get(EBAY_BROWSE_URL, {
    headers,
    params: {
      q: query,
      limit: 12,
    },
  });

  return res.data.itemSummaries || [];
}
