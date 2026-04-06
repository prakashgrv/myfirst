import { google } from "googleapis";
import { prisma } from "./prisma";
import type { ScheduleItem, Child } from "@prisma/client";

export async function getCalendarClient(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account?.access_token) return null;

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.access_token,
    refresh_token: account.refresh_token ?? undefined,
    expiry_date: account.expires_at ? account.expires_at * 1000 : undefined,
  });

  return google.calendar({ version: "v3", auth: oauth2Client });
}

export async function syncItemToCalendar(
  item: ScheduleItem & { child: Child },
  userId: string
): Promise<string | null> {
  try {
    const calendar = await getCalendarClient(userId);
    if (!calendar) return null;

    const startDateTime = item.startTime || item.dueDate;
    const endDateTime = item.endTime || item.dueDate;
    if (!startDateTime) return null;

    const eventBody = {
      summary: `[${item.child.name}] ${item.title}`,
      description: item.notes || undefined,
      location: item.location || undefined,
      colorId: getGoogleColorId(item.child.color),
      start: {
        dateTime: startDateTime.toISOString(),
        timeZone: "America/New_York",
      },
      end: {
        dateTime: (endDateTime || startDateTime).toISOString(),
        timeZone: "America/New_York",
      },
    };

    if (item.googleEventId) {
      await calendar.events.patch({
        calendarId: "primary",
        eventId: item.googleEventId,
        requestBody: eventBody,
      });
      return item.googleEventId;
    } else {
      const response = await calendar.events.insert({
        calendarId: "primary",
        requestBody: eventBody,
      });
      return response.data.id || null;
    }
  } catch (error) {
    console.error("Google Calendar sync failed:", error);
    return null;
  }
}

export async function deleteCalendarEvent(
  googleEventId: string,
  userId: string
): Promise<void> {
  try {
    const calendar = await getCalendarClient(userId);
    if (!calendar) return;
    await calendar.events.delete({
      calendarId: "primary",
      eventId: googleEventId,
    });
  } catch (error) {
    console.error("Google Calendar delete failed:", error);
  }
}

// Maps hex color to Google Calendar color IDs (approximate)
function getGoogleColorId(hex: string): string {
  const map: Record<string, string> = {
    "#FF5A5F": "11", // tomato
    "#00A699": "2",  // sage
    "#FC642D": "6",  // tangerine
    "#FFB400": "5",  // banana
    "#7B61FF": "9",  // blueberry
    "#E91E8C": "4",  // flamingo
  };
  return map[hex] || "1";
}
