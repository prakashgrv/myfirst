import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getChildColor } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const children = await prisma.child.findMany({
    where: { userId: session.user.id },
    include: { scheduleItems: { where: { completed: false } } },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(children);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, grade, school, color } = await req.json();
  if (!name || !grade) return NextResponse.json({ error: "Name and grade required" }, { status: 400 });

  const existingCount = await prisma.child.count({ where: { userId: session.user.id } });

  const child = await prisma.child.create({
    data: {
      name,
      grade,
      school: school || null,
      color: color || getChildColor(existingCount),
      userId: session.user.id,
    },
  });

  return NextResponse.json(child, { status: 201 });
}
