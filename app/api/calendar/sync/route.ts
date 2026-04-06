import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { syncItemToCalendar } from "@/lib/google-calendar";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { scheduleItemId } = await req.json();

  const item = await prisma.scheduleItem.findFirst({
    where: { id: scheduleItemId, child: { userId: session.user.id } },
    include: { child: true },
  });

  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const googleEventId = await syncItemToCalendar(item, session.user.id);

  if (googleEventId) {
    await prisma.scheduleItem.update({
      where: { id: scheduleItemId },
      data: { googleEventId },
    });
    return NextResponse.json({ success: true, googleEventId });
  }

  return NextResponse.json(
    { error: "Calendar sync failed. Make sure Google Calendar is connected." },
    { status: 422 }
  );
}
