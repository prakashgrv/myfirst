import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import HouseholdClient from "./HouseholdClient";

export default async function HouseholdPage() {
  const session = await auth();

  const children = await prisma.child.findMany({
    where: { userId: session!.user!.id! },
    include: {
      scheduleItems: {
        where: { completed: false },
        orderBy: [{ dueDate: "asc" }, { startTime: "asc" }],
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Household View</h1>
        <p className="text-gray-500 mt-1">All schedules in one place.</p>
      </div>
      <HouseholdClient children={children} />
    </div>
  );
}
