const APPINS_API_ENDPOINT =
  process.env.NEXT_PUBLIC_APPINS_API_ENDPOINT ||
  process.env.APPINS_API_ENDPOINT ||
  "https://api.appins.io";

export function getApiEndpoint(providedAPIEndpoint?: string) {
  return providedAPIEndpoint || APPINS_API_ENDPOINT;
}
