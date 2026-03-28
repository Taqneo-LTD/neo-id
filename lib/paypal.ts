import { Client, Environment, LogLevel } from "@paypal/paypal-server-sdk";

// ─── Config ──────────────────────────────────────────────

function getMode(): "sandbox" | "live" {
  const mode = process.env.PAYPAL_MODE ?? "sandbox";
  if (mode !== "sandbox" && mode !== "live") {
    throw new Error(`Invalid PAYPAL_MODE: "${mode}". Must be "sandbox" or "live".`);
  }
  return mode;
}

function getCredentials() {
  const mode = getMode();
  const clientId =
    mode === "live"
      ? process.env.PAYPAL_LIVE_CLIENT_ID
      : process.env.PAYPAL_SANDBOX_CLIENT_ID;
  const clientSecret =
    mode === "live"
      ? process.env.PAYPAL_LIVE_CLIENT_SECRET
      : process.env.PAYPAL_SANDBOX_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error(
      `Missing PayPal ${mode} credentials. Set PAYPAL_${mode.toUpperCase()}_CLIENT_ID and PAYPAL_${mode.toUpperCase()}_CLIENT_SECRET.`,
    );
  }

  return { clientId, clientSecret };
}

// ─── Singleton Client ────────────────────────────────────

const globalForPayPal = globalThis as unknown as { paypalClient: Client };

export function getPayPalClient(): Client {
  if (globalForPayPal.paypalClient) return globalForPayPal.paypalClient;

  const mode = getMode();
  const { clientId, clientSecret } = getCredentials();

  const client = new Client({
    clientCredentialsAuthCredentials: {
      oAuthClientId: clientId,
      oAuthClientSecret: clientSecret,
    },
    timeout: 0,
    environment: mode === "live" ? Environment.Production : Environment.Sandbox,
    logging: {
      logLevel: LogLevel.Info,
      logRequest: { logBody: false },
      logResponse: { logBody: false },
    },
  });

  if (process.env.NODE_ENV !== "production") {
    globalForPayPal.paypalClient = client;
  }

  return client;
}

// ─── Public Client ID (for frontend PayPalScriptProvider) ─

export function getPayPalClientId(): string {
  const { clientId } = getCredentials();
  return clientId;
}

// ─── Currency ────────────────────────────────────────────
// PayPal sandbox doesn't support SAR — use USD there, SAR in production.

export function getPayPalCurrency(): string {
  return getMode() === "live" ? "SAR" : "USD";
}

// ─── Access Token (for direct REST calls) ────────────────
// The SDK handles auth for its own controllers, but Catalog Products API
// is not in the SDK — so we need a raw access token for fetch calls.

export async function getPayPalAccessToken(): Promise<string> {
  const mode = getMode();
  const { clientId, clientSecret } = getCredentials();
  const baseUrl =
    mode === "live"
      ? "https://api-m.paypal.com"
      : "https://api-m.sandbox.paypal.com";

  const res = await fetch(`${baseUrl}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    throw new Error(`PayPal auth failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token as string;
}
