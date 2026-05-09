import { authoption } from "@/src/app/api/auth/[...nextauth]/authOption";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: wabaId } = await params;
    const session = await getServerSession(authoption);
    const token = session?.accessToken as string;

    const syncChat = request.nextUrl.searchParams.get("sync_chat");
    const queryString = syncChat ? `?sync_chat=${syncChat}` : "";

    const response = await fetch(`${BACKEND_API_URL}/whatsapp/baileys/qrcode/${wabaId}${queryString}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.message || "Failed to fetch QR code" },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error: unknown) {
    console.error("Baileys QR code API error:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
