import { authoption } from "@/src/app/api/auth/[...nextauth]/authOption";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id: googleAccountId } = await context.params;
    const session = await getServerSession(authoption);
    const bearer = request.headers.get("authorization");
    const token =
      (bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined) || (session?.accessToken as string | undefined);

    const response = await fetch(`${BACKEND_API_URL}/google/accounts/${googleAccountId}/sheets`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error("Google sheets GET proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
