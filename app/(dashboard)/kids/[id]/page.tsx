import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import KidAvatar from "@/components/kids/KidAvatar";
import KidScheduleClient from "./KidScheduleClient";

export default async function KidProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  const { id } = await params;

  const child = await prisma.child.findFirst({
    where: { id, userId: session!.user!.id! },
    include: {
      scheduleItems: {
        orderBy: [{ dueDate: "asc" }, { startTime: "asc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!child) notFound();

  return (
    <div className="space-y-6">
      {/* Kid header */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="h-3 w-full" style={{ backgroundColor: child.color }} />
        <div className="p-6 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <KidAvatar
              name={child.name}
              color={child.color}
              avatarUrl={child.avatarUrl}
              size="xl"
            />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{child.name}</h1>
              <p className="text-gray-500">{child.grade}</p>
              {child.school && <p className="text-sm text-gray-400">{child.school}</p>}
            </div>
          </div>
          <div className="flex gap-2">
            <Link href={`/kids/${child.id}/edit`}>
              <Button variant="outline" size="sm" className="gap-2">
                <Pencil className="h-4 w-4" />
                Edit
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Schedule client */}
      <KidScheduleClient child={child} initialItems={child.scheduleItems} />
    </div>
  );
}
