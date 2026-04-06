import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function getChild(id: string, userId: string) {
  return prisma.child.findFirst({ where: { id, userId } });
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const child = await prisma.child.findFirst({
    where: { id, userId: session.user.id },
    include: {
      scheduleItems: {
        orderBy: [{ dueDate: "asc" }, { startTime: "asc" }],
      },
    },
  });

  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(child);
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const child = await getChild(id, session.user.id);
  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { name, grade, school, color } = await req.json();
  const updated = await prisma.child.update({
    where: { id },
    data: { name, grade, school: school || null, color },
  });

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const child = await getChild(id, session.user.id);
  if (!child) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.child.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
