import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, CalendarDays, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import KidCard from "@/components/kids/KidCard";
import { format } from "date-fns";

export default async function DashboardPage() {
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const allTodayItems = children.flatMap((c) =>
    c.scheduleItems.filter((item) => {
      const date = item.dueDate || item.startTime;
      if (!date) return false;
      const d = new Date(date);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    }).map((item) => ({ ...item, child: c }))
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Good {getGreeting()},{" "}
            <span className="text-[#FF5A5F]">
              {session?.user?.name?.split(" ")[0]}
            </span>
          </h1>
          <p className="text-gray-500 mt-1">
            {format(new Date(), "EEEE, MMMM d")} · {children.length} kid{children.length !== 1 ? "s" : ""} registered
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/household">
            <Button variant="outline" size="sm" className="gap-2">
              <Users className="h-4 w-4" />
              <span className="hidden sm:inline">Household</span>
            </Button>
          </Link>
          <Link href="/kids/new">
            <Button size="sm" className="gap-2">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Add Kid</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Today's summary bar */}
      {allTodayItems.length > 0 && (
        <div className="rounded-2xl bg-[#FF5A5F]/5 border border-[#FF5A5F]/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CalendarDays className="h-4 w-4 text-[#FF5A5F]" />
            <span className="text-sm font-semibold text-[#FF5A5F]">
              {allTodayItems.length} item{allTodayItems.length !== 1 ? "s" : ""} due today
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTodayItems.slice(0, 5).map((item) => (
              <Link
                key={item.id}
                href={`/kids/${item.child.id}`}
                className="flex items-center gap-1.5 rounded-full bg-white border border-gray-100 px-3 py-1 text-xs font-medium text-gray-700 hover:border-[#FF5A5F]/30 transition-colors"
              >
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: item.child.color }}
                />
                {item.title}
              </Link>
            ))}
            {allTodayItems.length > 5 && (
              <span className="text-xs text-gray-400 px-2 py-1">
                +{allTodayItems.length - 5} more
              </span>
            )}
          </div>
        </div>
      )}

      {/* Kids grid */}
      {children.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your Kids</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {children.map((child, i) => (
              <KidCard key={child.id} child={child} index={i} />
            ))}
            {/* Add kid card */}
            <Link href="/kids/new">
              <div className="rounded-2xl border-2 border-dashed border-gray-200 p-5 h-full flex flex-col items-center justify-center gap-2 text-gray-400 hover:border-[#FF5A5F]/40 hover:text-[#FF5A5F] transition-all cursor-pointer min-h-[160px]">
                <Plus className="h-8 w-8" />
                <span className="text-sm font-medium">Add a kid</span>
              </div>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20">
      <div className="mx-auto mb-4 h-20 w-20 rounded-full bg-[#FF5A5F]/10 flex items-center justify-center">
        <Users className="h-10 w-10 text-[#FF5A5F]" />
      </div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">No kids yet</h2>
      <p className="text-gray-500 mb-6 max-w-sm mx-auto">
        Add your first kid to start tracking their homework and activities.
      </p>
      <Link href="/kids/new">
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add your first kid
        </Button>
      </Link>
    </div>
  );
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "morning";
  if (h < 17) return "afternoon";
  return "evening";
}
