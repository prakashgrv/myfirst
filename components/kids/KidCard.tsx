"use client";

import Link from "next/link";
import { BookOpen, Activity, ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import KidAvatar from "./KidAvatar";
import type { Child, ScheduleItem } from "@prisma/client";

interface KidCardProps {
  child: Child & { scheduleItems: ScheduleItem[] };
  index: number;
}

export default function KidCard({ child, index }: KidCardProps) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const todayItems = child.scheduleItems.filter((item) => {
    if (item.completed) return false;
    const date = item.dueDate || item.startTime;
    if (!date) return false;
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === today.getTime();
  });

  const homeworkCount = todayItems.filter((i) => i.type === "HOMEWORK").length;
  const activityCount = todayItems.filter((i) => i.type === "ACTIVITY").length;

  const nextItem = child.scheduleItems
    .filter((i) => !i.completed && (i.dueDate || i.startTime))
    .sort((a, b) => {
      const da = new Date(a.dueDate || a.startTime!).getTime();
      const db = new Date(b.dueDate || b.startTime!).getTime();
      return da - db;
    })[0];

  return (
    <Link href={`/kids/${child.id}`}>
      <Card className="group cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 overflow-hidden">
        {/* Color accent bar */}
        <div className="h-2 w-full" style={{ backgroundColor: child.color }} />
        <CardContent className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <KidAvatar name={child.name} color={child.color} avatarUrl={child.avatarUrl} size="md" />
              <div>
                <h3 className="font-semibold text-gray-900 text-base leading-tight">{child.name}</h3>
                <p className="text-sm text-gray-500">{child.grade}</p>
                {child.school && (
                  <p className="text-xs text-gray-400">{child.school}</p>
                )}
              </div>
            </div>
            <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-[#FF5A5F] transition-colors mt-1" />
          </div>

          {/* Today's summary */}
          <div className="flex items-center gap-3">
            {homeworkCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-2.5 py-1.5">
                <BookOpen className="h-3.5 w-3.5 text-blue-600" />
                <span className="text-xs font-medium text-blue-700">
                  {homeworkCount} HW
                </span>
              </div>
            )}
            {activityCount > 0 && (
              <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-2.5 py-1.5">
                <Activity className="h-3.5 w-3.5 text-green-600" />
                <span className="text-xs font-medium text-green-700">
                  {activityCount} {activityCount === 1 ? "activity" : "activities"}
                </span>
              </div>
            )}
            {todayItems.length === 0 && (
              <span className="text-xs text-gray-400">Nothing today</span>
            )}
          </div>

          {/* Next upcoming */}
          {nextItem && (
            <div className="mt-3 pt-3 border-t border-gray-50">
              <p className="text-xs text-gray-400 mb-0.5">Next up</p>
              <p className="text-sm text-gray-700 font-medium truncate">{nextItem.title}</p>
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
