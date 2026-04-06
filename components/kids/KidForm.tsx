"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { GRADES, CHILD_COLORS, getInitials } from "@/lib/utils";
import type { Child } from "@prisma/client";

interface KidFormProps {
  child?: Child;
}

export default function KidForm({ child }: KidFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: child?.name ?? "",
    grade: child?.grade ?? "",
    school: child?.school ?? "",
    color: child?.color ?? CHILD_COLORS[0],
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const url = child ? `/api/kids/${child.id}` : "/api/kids";
      const method = child ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error("Failed to save");
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Avatar preview */}
      <div className="flex justify-center">
        <div
          className="h-20 w-20 rounded-full flex items-center justify-center text-2xl font-bold text-white transition-colors"
          style={{ backgroundColor: form.color }}
        >
          {form.name ? getInitials(form.name) : "?"}
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="name">Full Name</Label>
          <Input
            id="name"
            placeholder="e.g. Alex Johnson"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="grade">Grade</Label>
          <Select
            value={form.grade}
            onValueChange={(v) => setForm({ ...form, grade: v })}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select grade" />
            </SelectTrigger>
            <SelectContent>
              {GRADES.map((g) => (
                <SelectItem key={g} value={g}>{g}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="school">School (optional)</Label>
          <Input
            id="school"
            placeholder="e.g. Lincoln Middle School"
            value={form.school}
            onChange={(e) => setForm({ ...form, school: e.target.value })}
          />
        </div>

        <div className="space-y-1.5">
          <Label>Color</Label>
          <div className="flex gap-2 flex-wrap">
            {CHILD_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setForm({ ...form, color })}
                className={`h-8 w-8 rounded-full transition-all ${
                  form.color === color
                    ? "ring-2 ring-offset-2 ring-gray-900 scale-110"
                    : "hover:scale-105"
                }`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="flex gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? "Saving..." : child ? "Save Changes" : "Add Kid"}
        </Button>
      </div>
    </form>
  );
}
