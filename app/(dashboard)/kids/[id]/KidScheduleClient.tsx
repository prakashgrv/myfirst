"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import ScheduleItemCard from "@/components/schedule/ScheduleItemCard";
import ScheduleForm from "@/components/schedule/ScheduleForm";
import type { Child, ScheduleItem } from "@prisma/client";
import { isAfter, startOfDay } from "date-fns";

interface KidScheduleClientProps {
  child: Child;
  initialItems: ScheduleItem[];
}

export default function KidScheduleClient({
  child,
  initialItems,
}: KidScheduleClientProps) {
  const [items, setItems] = useState<ScheduleItem[]>(initialItems);
  const [formOpen, setFormOpen] = useState(false);
  const [editItem, setEditItem] = useState<ScheduleItem | null>(null);

  const today = startOfDay(new Date());

  const upcoming = items.filter((i) => {
    if (i.completed) return false;
    const d = i.dueDate || i.startTime;
    if (!d) return true;
    return isAfter(new Date(d), today) || startOfDay(new Date(d)).getTime() === today.getTime();
  });

  const completed = items.filter((i) => i.completed);
  const homework = items.filter((i) => i.type === "HOMEWORK" && !i.completed);
  const activities = items.filter((i) => i.type === "ACTIVITY" && !i.completed);

  async function handleDelete(id: string) {
    if (!confirm("Delete this item?")) return;
    await fetch(`/api/schedule/${id}`, { method: "DELETE" });
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  async function handleToggleComplete(id: string, completed: boolean) {
    const res = await fetch(`/api/schedule/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed }),
    });
    const updated = await res.json();
    setItems((prev) => prev.map((i) => (i.id === id ? updated : i)));
  }

  async function handleSyncCalendar(id: string) {
    const res = await fetch("/api/calendar/sync", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ scheduleItemId: id }),
    });
    if (res.ok) {
      alert("Synced to Google Calendar!");
    } else {
      const data = await res.json();
      alert(data.error || "Sync failed");
    }
  }

  function handleSaved() {
    // Refresh by re-fetching
    fetch(`/api/kids/${child.id}`)
      .then((r) => r.json())
      .then((data) => setItems(data.scheduleItems || []));
    setEditItem(null);
  }

  function openEdit(item: ScheduleItem) {
    setEditItem(item);
    setFormOpen(true);
  }

  return (
    <>
      <div className="flex items-center justify-between">
        <Tabs defaultValue="upcoming" className="w-full">
          <div className="flex items-center justify-between mb-4">
            <TabsList>
              <TabsTrigger value="upcoming">
                Upcoming ({upcoming.length})
              </TabsTrigger>
              <TabsTrigger value="homework">
                Homework ({homework.length})
              </TabsTrigger>
              <TabsTrigger value="activities">
                Activities ({activities.length})
              </TabsTrigger>
              <TabsTrigger value="completed">Done</TabsTrigger>
            </TabsList>
            <Button
              size="sm"
              className="gap-2"
              onClick={() => {
                setEditItem(null);
                setFormOpen(true);
              }}
            >
              <Plus className="h-4 w-4" />
              Add item
            </Button>
          </div>

          <TabsContent value="upcoming">
            <ItemList
              items={upcoming}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              onSyncCalendar={handleSyncCalendar}
              emptyMessage="No upcoming items — everything is clear!"
            />
          </TabsContent>

          <TabsContent value="homework">
            <ItemList
              items={homework}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              onSyncCalendar={handleSyncCalendar}
              emptyMessage="No homework assignments. 🎉"
            />
          </TabsContent>

          <TabsContent value="activities">
            <ItemList
              items={activities}
              onEdit={openEdit}
              onDelete={handleDelete}
              onToggleComplete={handleToggleComplete}
              onSyncCalendar={handleSyncCalendar}
              emptyMessage="No activities scheduled."
            />
          </TabsContent>

          <TabsContent value="completed">
            <ItemList
              items={completed}
              onToggleComplete={handleToggleComplete}
              onDelete={handleDelete}
              emptyMessage="Nothing completed yet."
            />
          </TabsContent>
        </Tabs>
      </div>

      <ScheduleForm
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditItem(null);
        }}
        onSaved={handleSaved}
        childId={child.id}
        item={editItem}
      />
    </>
  );
}

function ItemList({
  items,
  onEdit,
  onDelete,
  onToggleComplete,
  onSyncCalendar,
  emptyMessage,
}: {
  items: ScheduleItem[];
  onEdit?: (item: ScheduleItem) => void;
  onDelete?: (id: string) => void;
  onToggleComplete?: (id: string, completed: boolean) => void;
  onSyncCalendar?: (id: string) => void;
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <ScheduleItemCard
          key={item.id}
          item={item}
          onEdit={onEdit}
          onDelete={onDelete}
          onToggleComplete={onToggleComplete}
          onSyncCalendar={onSyncCalendar}
        />
      ))}
    </div>
  );
}
