import { authoption } from "@/src/app/api/auth/[...nextauth]/authOption";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

function authHeader(request: NextRequest, sessionToken?: string) {
  const bearer = request.headers.get("authorization");
  const token =
    (bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined) || sessionToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authoption);
    const token = session?.accessToken as string | undefined;

    const response = await fetch(`${BACKEND_API_URL}/google/accounts`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...authHeader(request, token),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error("Google accounts proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
