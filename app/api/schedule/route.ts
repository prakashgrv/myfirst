import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const childId = searchParams.get("childId");
  const household = searchParams.get("household");

  let where: Record<string, unknown> = {};

  if (childId) {
    // Verify ownership
    const child = await prisma.child.findFirst({
      where: { id: childId, userId: session.user.id },
    });
    if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });
    where = { childId };
  } else if (household) {
    const children = await prisma.child.findMany({
      where: { userId: session.user.id },
      select: { id: true },
    });
    where = { childId: { in: children.map((c) => c.id) } };
  } else {
    return NextResponse.json({ error: "Provide childId or household=true" }, { status: 400 });
  }

  const items = await prisma.scheduleItem.findMany({
    where,
    include: { child: true },
    orderBy: [{ dueDate: "asc" }, { startTime: "asc" }, { createdAt: "desc" }],
  });

  return NextResponse.json(items);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const {
    childId,
    type,
    title,
    subject,
    location,
    dueDate,
    startTime,
    endTime,
    recurring,
    recurrenceDays,
    priority,
    notes,
    reminderMinutes,
  } = body;

  if (!childId || !type || !title) {
    return NextResponse.json({ error: "childId, type, and title are required" }, { status: 400 });
  }

  const child = await prisma.child.findFirst({
    where: { id: childId, userId: session.user.id },
  });
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  const item = await prisma.scheduleItem.create({
    data: {
      childId,
      type,
      title,
      subject: subject || null,
      location: location || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      recurring: recurring ?? false,
      recurrenceDays: recurrenceDays ?? [],
      priority: priority ?? "MEDIUM",
      notes: notes || null,
      reminders:
        reminderMinutes && parseInt(reminderMinutes) > 0
          ? {
              create: { minutesBefore: parseInt(reminderMinutes) },
            }
          : undefined,
    },
    include: { reminders: true },
  });

  return NextResponse.json(item, { status: 201 });
}
