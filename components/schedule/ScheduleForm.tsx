"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DAYS_OF_WEEK, SUBJECTS } from "@/lib/utils";
import type { ScheduleItem } from "@prisma/client";
import { format } from "date-fns";

interface ScheduleFormProps {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  childId: string;
  item?: ScheduleItem | null;
}

function toDatetimeLocal(date: Date | string | null | undefined) {
  if (!date) return "";
  return format(new Date(date), "yyyy-MM-dd'T'HH:mm");
}

export default function ScheduleForm({
  open,
  onClose,
  onSaved,
  childId,
  item,
}: ScheduleFormProps) {
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"HOMEWORK" | "ACTIVITY">(
    item?.type ?? "HOMEWORK"
  );
  const [form, setForm] = useState({
    title: item?.title ?? "",
    subject: item?.subject ?? "",
    location: item?.location ?? "",
    dueDate: toDatetimeLocal(item?.dueDate),
    startTime: toDatetimeLocal(item?.startTime),
    endTime: toDatetimeLocal(item?.endTime),
    priority: item?.priority ?? ("MEDIUM" as const),
    recurring: item?.recurring ?? false,
    recurrenceDays: item?.recurrenceDays ?? ([] as string[]),
    notes: item?.notes ?? "",
    reminderMinutes: "60",
  });

  function toggle(v: string) {
    setForm((f) => ({
      ...f,
      recurrenceDays: f.recurrenceDays.includes(v)
        ? f.recurrenceDays.filter((d) => d !== v)
        : [...f.recurrenceDays, v],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const body = {
        ...form,
        type,
        childId,
        dueDate: type === "HOMEWORK" && form.dueDate ? form.dueDate : null,
        startTime: type === "ACTIVITY" && form.startTime ? form.startTime : null,
        endTime: type === "ACTIVITY" && form.endTime ? form.endTime : null,
      };
      const url = item ? `/api/schedule/${item.id}` : "/api/schedule";
      const method = item ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error("Failed");
      onSaved();
      onClose();
    } catch {
      alert("Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{item ? "Edit Item" : "Add Schedule Item"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type toggle */}
          <div className="flex rounded-xl bg-gray-100 p-1 gap-1">
            {(["HOMEWORK", "ACTIVITY"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setType(t)}
                className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                  type === t
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {t === "HOMEWORK" ? "📚 Homework" : "🏃 Activity"}
              </button>
            ))}
          </div>

          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input
              placeholder={type === "HOMEWORK" ? "e.g. Math Chapter 5 Problems" : "e.g. Soccer Practice"}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </div>

          {type === "HOMEWORK" ? (
            <>
              <div className="space-y-1.5">
                <Label>Subject</Label>
                <Select value={form.subject} onValueChange={(v) => setForm({ ...form, subject: v })}>
                  <SelectTrigger><SelectValue placeholder="Select subject" /></SelectTrigger>
                  <SelectContent>
                    {SUBJECTS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Due Date & Time</Label>
                <Input
                  type="datetime-local"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v as "HIGH" | "MEDIUM" | "LOW" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="HIGH">🔴 High</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                    <SelectItem value="LOW">🟢 Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1.5">
                <Label>Location (optional)</Label>
                <Input
                  placeholder="e.g. Community Center Field 2"
                  value={form.location}
                  onChange={(e) => setForm({ ...form, location: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Start Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.startTime}
                    onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>End Time</Label>
                  <Input
                    type="datetime-local"
                    value={form.endTime}
                    onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="recurring"
                    checked={form.recurring}
                    onChange={(e) => setForm({ ...form, recurring: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="recurring">Recurring activity</Label>
                </div>
              </div>
              {form.recurring && (
                <div className="space-y-1.5">
                  <Label>Repeat on</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {DAYS_OF_WEEK.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggle(day)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          form.recurrenceDays.includes(day)
                            ? "bg-[#FF5A5F] text-white"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          <div className="space-y-1.5">
            <Label>Reminder (email)</Label>
            <Select value={form.reminderMinutes} onValueChange={(v) => setForm({ ...form, reminderMinutes: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="120">2 hours before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
                <SelectItem value="0">No reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label>Notes (optional)</Label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder="Any extra details..."
              rows={2}
              className="w-full rounded-xl border border-gray-200 px-4 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#FF5A5F] focus:border-transparent resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Saving..." : item ? "Save Changes" : "Add Item"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
