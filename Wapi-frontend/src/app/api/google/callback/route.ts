import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

/** Proxies OAuth callback to Express (redirect_uri can point at site origin). */
export async function GET(request: NextRequest) {
  const search = request.nextUrl.search;

  try {
    const response = await fetch(`${BACKEND_API_URL}/google/callback${search}`, {
      redirect: "manual",
    });

    const location = response.headers.get("location");
    if (location && response.status >= 300 && response.status < 400) {
      return NextResponse.redirect(location);
    }

    const text = await response.text();
    try {
      const data = JSON.parse(text);
      return NextResponse.json(data, { status: response.status });
    } catch {
      return new NextResponse(text, { status: response.status });
    }
  } catch (error: unknown) {
    console.error("Google callback proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
