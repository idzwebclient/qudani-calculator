import { NextResponse, type NextRequest } from "next/server";

// Komen kredit di atas <html>. Hanya nampak dalam inspect element / view source.
const CREDIT = "<!--\n    Build by Trulab Studio · 60176982032\n-->";
const DOCTYPE = "<!DOCTYPE html>";
const SKIP_HEADER = "x-qudani-credit";

export async function proxy(request: NextRequest) {
  // Hanya buka halaman penuh; navigasi dalam app (RSC) dan fetch dalaman dilangkau.
  const isDocument = request.method === "GET" && request.headers.get("sec-fetch-dest") === "document";
  if (!isDocument || request.headers.has(SKIP_HEADER) || request.headers.has("rsc")) return NextResponse.next();

  const headers = new Headers(request.headers);
  headers.set(SKIP_HEADER, "1");
  const response = await fetch(request.url, { headers, redirect: "manual" });
  if (!response.ok || !response.headers.get("content-type")?.includes("text/html")) return response;

  const html = await response.text();
  const body = html.startsWith(DOCTYPE) && !html.includes(CREDIT) ? `${DOCTYPE}\n${CREDIT}\n${html.slice(DOCTYPE.length)}` : html;
  const outHeaders = new Headers(response.headers);
  outHeaders.delete("content-length");
  outHeaders.delete("content-encoding");
  return new NextResponse(body, { status: response.status, headers: outHeaders });
}

export const config = {
  matcher: ["/", "/closing", "/report", "/form", "/form/:path*"],
};
