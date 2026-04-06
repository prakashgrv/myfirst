import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { deleteCalendarEvent } from "@/lib/google-calendar";

async function getItem(id: string, userId: string) {
  return prisma.scheduleItem.findFirst({
    where: { id, child: { userId } },
    include: { child: true },
  });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getItem(id, session.user.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(item);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getItem(id, session.user.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = await req.json();
  const {
    title, type, subject, location, dueDate, startTime, endTime,
    recurring, recurrenceDays, priority, notes, completed,
  } = body;

  const updated = await prisma.scheduleItem.update({
    where: { id },
    data: {
      title, type, subject: subject || null, location: location || null,
      dueDate: dueDate ? new Date(dueDate) : null,
      startTime: startTime ? new Date(startTime) : null,
      endTime: endTime ? new Date(endTime) : null,
      recurring: recurring ?? item.recurring,
      recurrenceDays: recurrenceDays ?? item.recurrenceDays,
      priority: priority ?? item.priority,
      notes: notes || null,
      completed: completed ?? item.completed,
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const item = await getItem(id, session.user.id);
  if (!item) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (item.googleEventId) {
    await deleteCalendarEvent(item.googleEventId, session.user.id);
  }

  await prisma.scheduleItem.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
