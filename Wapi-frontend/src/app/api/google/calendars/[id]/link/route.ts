import { authoption } from "@/src/app/api/auth/[...nextauth]/authOption";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function PUT(request: NextRequest, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authoption);
    const bearer = request.headers.get("authorization");
    const token =
      (bearer?.startsWith("Bearer ") ? bearer.slice(7) : undefined) || (session?.accessToken as string | undefined);
    const body = await request.json();

    const response = await fetch(`${BACKEND_API_URL}/google/calendars/${id}/link`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error: unknown) {
    console.error("Google calendar link proxy error:", error);
    return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
  }
}
