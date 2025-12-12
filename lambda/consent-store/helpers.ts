import { IncomingRequestDataInterface } from "./Interfaces/IncomingRequestDataInterface";

export const getRequestData = (event): IncomingRequestDataInterface => {
  let body = event.body || "";

  // Als het base64 encoded is
  if (event.isBase64Encoded) {
    body = Buffer.from(body, "base64").toString("utf8");
  }

  // URL-decode uitvoeren
  const decoded = decodeURIComponent(body);

  // Als er een 'payload=' voor zit ? strippen
  const jsonString = decoded.startsWith("payload=") ? decoded.slice(8) : decoded;

  return JSON.parse(jsonString);
};

export function extractDomain(input: string): string | null {
  if (!input) return null;

  // Altijd een protocol forceren zodat URL() niet crasht
  let url = input.trim();
  if (!/^https?:\/\//i.test(url)) {
    url = "https://" + url;
  }

  try {
    const { hostname } = new URL(url);
    return hostname.replace(/^www\./i, "");
  } catch {
    return null;
  }
}
