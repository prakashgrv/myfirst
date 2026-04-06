"use client";

import { useState } from "react";
import { BookOpen, Activity, Clock, MapPin, MoreHorizontal, Pencil, Trash2, Check, CalendarDays } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn, formatDueDate, formatTime } from "@/lib/utils";
import type { ScheduleItem } from "@prisma/client";

interface ScheduleItemCardProps {
  item: ScheduleItem;
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onSyncCalendar?: (id: string) => void;
  compact?: boolean;
  childColor?: string;
  childName?: string;
}

const priorityVariant: Record<string, "high" | "medium" | "low"> = {
  HIGH: "high",
  MEDIUM: "medium",
  LOW: "low",
};

export default function ScheduleItemCard({
  item,
  onEdit,
  onDelete,
  onToggleComplete,
  onSyncCalendar,
  compact = false,
  childColor,
  childName,
}: ScheduleItemCardProps) {
  const [completing, setCompleting] = useState(false);

  const isHomework = item.type === "HOMEWORK";
  const date = item.dueDate || item.startTime;
  const dateLabel = formatDueDate(date ? new Date(date) : null);
  const timeLabel = item.startTime ? formatTime(new Date(item.startTime)) : null;

  const isOverdue =
    date && !item.completed && new Date(date) < new Date() && dateLabel.includes("Overdue");

  async function toggleComplete() {
    if (!onToggleComplete) return;
    setCompleting(true);
    await onToggleComplete(item.id, !item.completed);
    setCompleting(false);
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-xl border bg-white p-4 transition-all",
        item.completed
          ? "opacity-60 border-gray-100"
          : "border-gray-100 hover:border-gray-200 hover:shadow-sm",
        isOverdue && "border-red-100 bg-red-50/30"
      )}
    >
      {/* Check circle */}
      <button
        onClick={toggleComplete}
        disabled={completing}
        className={cn(
          "mt-0.5 h-5 w-5 shrink-0 rounded-full border-2 transition-all flex items-center justify-center",
          item.completed
            ? "border-green-500 bg-green-500"
            : "border-gray-300 hover:border-[#FF5A5F]"
        )}
      >
        {item.completed && <Check className="h-3 w-3 text-white" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {childColor && childName && (
                <span
                  className="text-xs font-medium px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: childColor }}
                >
                  {childName}
                </span>
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  item.completed ? "line-through text-gray-400" : "text-gray-900"
                )}
              >
                {item.title}
              </span>
            </div>

            {!compact && (
              <div className="mt-1.5 flex items-center flex-wrap gap-x-3 gap-y-1">
                {item.subject && (
                  <span className="text-xs text-gray-500">{item.subject}</span>
                )}
                {dateLabel && (
                  <span
                    className={cn(
                      "flex items-center gap-1 text-xs",
                      isOverdue ? "text-red-600 font-medium" : "text-gray-500"
                    )}
                  >
                    <Clock className="h-3 w-3" />
                    {dateLabel}
                    {timeLabel && ` · ${timeLabel}`}
                  </span>
                )}
                {item.location && (
                  <span className="flex items-center gap-1 text-xs text-gray-500">
                    <MapPin className="h-3 w-3" />
                    {item.location}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {!compact && item.priority && (
              <Badge variant={priorityVariant[item.priority]} className="text-xs">
                {item.priority.charAt(0) + item.priority.slice(1).toLowerCase()}
              </Badge>
            )}
            <Badge variant="secondary" className="text-xs gap-1">
              {isHomework ? (
                <><BookOpen className="h-3 w-3" />HW</>
              ) : (
                <><Activity className="h-3 w-3" />Activity</>
              )}
            </Badge>

            {(onEdit || onDelete || onSyncCalendar) && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-gray-100 transition-all">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Pencil className="h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onSyncCalendar && (
                    <DropdownMenuItem onClick={() => onSyncCalendar(item.id)}>
                      <CalendarDays className="h-4 w-4" />
                      Sync to Calendar
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600 focus:text-red-600"
                        onClick={() => onDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
