import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CalendarDays, Bell, User } from "lucide-react";
import SettingsClient from "./SettingsClient";

export default async function SettingsPage() {
  const session = await auth();
  const user = await prisma.user.findUnique({
    where: { id: session!.user!.id! },
  });
  const googleAccount = await prisma.account.findFirst({
    where: { userId: session!.user!.id!, provider: "google" },
  });

  const hasCalendar = !!googleAccount?.access_token && !!googleAccount?.scope?.includes("calendar");

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage your account and preferences.</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-[#FF5A5F]/10 flex items-center justify-center">
            <User className="h-5 w-5 text-[#FF5A5F]" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Profile</h2>
            <p className="text-sm text-gray-500">Your account information</p>
          </div>
        </div>
        <div className="space-y-3">
          <div className="flex justify-between items-center py-2 border-b border-gray-50">
            <span className="text-sm text-gray-500">Name</span>
            <span className="text-sm font-medium text-gray-900">{user?.name}</span>
          </div>
          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Email</span>
            <span className="text-sm font-medium text-gray-900">{user?.email}</span>
          </div>
        </div>
      </div>

      {/* Google Calendar */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-blue-50 flex items-center justify-center">
            <CalendarDays className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Google Calendar</h2>
            <p className="text-sm text-gray-500">Sync your schedule items to Google Calendar</p>
          </div>
        </div>
        <SettingsClient hasCalendar={hasCalendar} />
      </div>

      {/* Reminders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-xl bg-yellow-50 flex items-center justify-center">
            <Bell className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">Email Reminders</h2>
            <p className="text-sm text-gray-500">Reminders are sent to {user?.email}</p>
          </div>
        </div>
        <div className="rounded-xl bg-gray-50 p-4">
          <p className="text-sm text-gray-600">
            Email reminders are automatically sent based on the lead time you set when creating each schedule item.
            You can set reminders per item (15 min, 30 min, 1 hr, 2 hr, or 1 day before).
          </p>
        </div>
      </div>
    </div>
  );
}
