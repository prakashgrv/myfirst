"use client";

import { useState } from "react";
import Link from "next/link";
import type { Child, ScheduleItem } from "@prisma/client";
import ScheduleItemCard from "@/components/schedule/ScheduleItemCard";
import KidAvatar from "@/components/kids/KidAvatar";
import { formatDueDate } from "@/lib/utils";
import { addDays, format, startOfDay, isAfter, isBefore } from "date-fns";

type ChildWithItems = Child & { scheduleItems: ScheduleItem[] };

interface HouseholdClientProps {
  children: ChildWithItems[];
}

function groupByDate(
  items: (ScheduleItem & { child: Child })[],
  days: number = 14
) {
  const groups: Record<string, (ScheduleItem & { child: Child })[]> = {};
  const today = startOfDay(new Date());

  for (let i = 0; i < days; i++) {
    const day = addDays(today, i);
    const key = format(day, "yyyy-MM-dd");
    groups[key] = [];
  }

  for (const item of items) {
    const date = item.dueDate || item.startTime;
    if (!date) {
      groups["no-date"] = groups["no-date"] || [];
      groups["no-date"].push(item);
      continue;
    }
    const key = format(startOfDay(new Date(date)), "yyyy-MM-dd");
    if (groups[key]) {
      groups[key].push(item);
    }
  }

  return groups;
}

export default function HouseholdClient({ children }: HouseholdClientProps) {
  const [activeKids, setActiveKids] = useState<string[]>(
    children.map((c) => c.id)
  );

  function toggleKid(id: string) {
    setActiveKids((prev) =>
      prev.includes(id) ? prev.filter((k) => k !== id) : [...prev, id]
    );
  }

  const allItems = children
    .filter((c) => activeKids.includes(c.id))
    .flatMap((c) => c.scheduleItems.map((item) => ({ ...item, child: c })));

  const grouped = groupByDate(allItems);

  if (children.length === 0) {
    return (
      <div className="text-center py-20 text-gray-400">
        <p className="text-lg font-medium mb-2">No kids registered yet.</p>
        <Link href="/kids/new" className="text-[#FF5A5F] underline text-sm">
          Add your first kid
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Kid filter chips */}
      <div className="flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium text-gray-500 mr-1">Filter:</span>
        {children.map((child) => {
          const active = activeKids.includes(child.id);
          return (
            <button
              key={child.id}
              onClick={() => toggleKid(child.id)}
              className="flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium transition-all border"
              style={{
                backgroundColor: active ? child.color : "white",
                borderColor: child.color,
                color: active ? "white" : child.color,
              }}
            >
              <KidAvatar name={child.name} color={child.color} size="sm" />
              {child.name}
            </button>
          );
        })}
      </div>

      {/* Day groups */}
      <div className="space-y-6">
        {Object.entries(grouped).map(([dateKey, items]) => {
          if (items.length === 0) return null;
          const isNoDate = dateKey === "no-date";
          const date = isNoDate ? null : new Date(dateKey);
          const isToday =
            date &&
            startOfDay(date).getTime() === startOfDay(new Date()).getTime();

          return (
            <div key={dateKey}>
              <div className="flex items-center gap-3 mb-3">
                <h3
                  className={`text-sm font-semibold ${
                    isToday ? "text-[#FF5A5F]" : "text-gray-500"
                  }`}
                >
                  {isNoDate
                    ? "No Date"
                    : isToday
                    ? `Today · ${format(date!, "EEEE, MMMM d")}`
                    : format(date!, "EEEE, MMMM d")}
                </h3>
                <div className="flex-1 h-px bg-gray-100" />
                <span className="text-xs text-gray-400">
                  {items.length} item{items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <Link key={item.id} href={`/kids/${item.child.id}`}>
                    <ScheduleItemCard
                      item={item}
                      childColor={item.child.color}
                      childName={item.child.name}
                    />
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {allItems.length === 0 && (
        <div className="text-center py-16 text-gray-400">
          <p>No upcoming items for the selected kids.</p>
        </div>
      )}
    </div>
  );
}
