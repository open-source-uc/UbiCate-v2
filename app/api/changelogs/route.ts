import { NextResponse } from "next/server";

import { getChangelogs } from "@/lib/changelog/data";

export async function GET() {
  try {
    const changelogs = await getChangelogs();
    return NextResponse.json({ message: "Success", changelogs }, { status: 200 });
  } catch (error) {
    console.error("Error in GET changelogs:", error);
    return NextResponse.json({ message: "Error", changelogs: [] }, { status: 200 });
  }
}

export const runtime = "nodejs";
