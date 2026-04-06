"use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

interface SettingsClientProps {
  hasCalendar: boolean;
}

export default function SettingsClient({ hasCalendar }: SettingsClientProps) {
  async function reconnect() {
    await signIn("google", {
      callbackUrl: "/settings",
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-xl bg-gray-50 p-4">
        <div className="flex items-center gap-3">
          {hasCalendar ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <XCircle className="h-5 w-5 text-gray-300" />
          )}
          <div>
            <p className="text-sm font-medium text-gray-900">
              {hasCalendar ? "Google Calendar connected" : "Not connected"}
            </p>
            <p className="text-xs text-gray-500">
              {hasCalendar
                ? "You can sync schedule items from each kid's page."
                : "Connect to sync schedule items to your Google Calendar."}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={reconnect}
        >
          {hasCalendar ? "Reconnect" : "Connect"}
        </Button>
      </div>

      {hasCalendar && (
        <p className="text-xs text-gray-400">
          To sync an item, go to a kid&apos;s profile, hover over any schedule item, and click the ··· menu → &quot;Sync to Calendar&quot;.
        </p>
      )}
    </div>
  );
}
