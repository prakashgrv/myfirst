import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendReminderEmail } from "@/lib/resend";
import { format } from "date-fns";

// Called by Vercel Cron every 15 minutes
export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const now = new Date();

  const pendingReminders = await prisma.reminder.findMany({
    where: { sent: false },
    include: {
      scheduleItem: {
        include: {
          child: {
            include: { user: true },
          },
        },
      },
    },
  });

  let sent = 0;
  const errors: string[] = [];

  for (const reminder of pendingReminders) {
    const item = reminder.scheduleItem;
    const triggerAt = item.dueDate || item.startTime;
    if (!triggerAt) continue;

    const reminderTime = new Date(triggerAt.getTime() - reminder.minutesBefore * 60 * 1000);
    const windowEnd = new Date(reminderTime.getTime() + 15 * 60 * 1000); // 15-min window

    if (now >= reminderTime && now < windowEnd) {
      try {
        await sendReminderEmail({
          to: item.child.user.email,
          kidName: item.child.name,
          itemTitle: item.title,
          itemType: item.type,
          dueTime: format(triggerAt, "h:mm a, MMM d"),
          minutesBefore: reminder.minutesBefore,
        });

        await prisma.reminder.update({
          where: { id: reminder.id },
          data: { sent: true, sentAt: now },
        });

        sent++;
      } catch (err) {
        errors.push(`Reminder ${reminder.id}: ${err}`);
      }
    }
  }

  return NextResponse.json({ sent, errors });
}
