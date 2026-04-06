import { Resend } from "resend";
import { format } from "date-fns";

let _resend: Resend | null = null;

function getResend(): Resend {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      throw new Error("RESEND_API_KEY is not set");
    }
    _resend = new Resend(process.env.RESEND_API_KEY);
  }
  return _resend;
}

export async function sendReminderEmail({
  to,
  kidName,
  itemTitle,
  itemType,
  dueTime,
  minutesBefore,
}: {
  to: string;
  kidName: string;
  itemTitle: string;
  itemType: "HOMEWORK" | "ACTIVITY";
  dueTime: string;
  minutesBefore: number;
}) {
  const resend = getResend();

  const timeLabel =
    minutesBefore >= 60
      ? `${minutesBefore / 60} hour${minutesBefore / 60 > 1 ? "s" : ""}`
      : `${minutesBefore} minutes`;

  await resend.emails.send({
    from: "FamilyScheduler <reminders@familyscheduler.app>",
    to,
    subject: `Reminder: ${kidName}'s ${itemType === "HOMEWORK" ? "homework" : "activity"} in ${timeLabel}`,
    html: `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 480px; margin: 0 auto; padding: 24px;">
        <div style="background: #FF5A5F; border-radius: 16px; padding: 24px; color: white; margin-bottom: 24px;">
          <h1 style="margin: 0; font-size: 24px; font-weight: 700;">FamilyScheduler</h1>
          <p style="margin: 8px 0 0; opacity: 0.85;">Schedule Reminder</p>
        </div>
        <div style="background: #f7f7f7; border-radius: 16px; padding: 24px;">
          <p style="margin: 0 0 8px; color: #484848; font-size: 14px;">Reminder for <strong>${kidName}</strong></p>
          <h2 style="margin: 0 0 8px; color: #222; font-size: 20px;">${itemTitle}</h2>
          <p style="margin: 0 0 16px; color: #767676;">
            ${itemType === "HOMEWORK" ? "📚 Homework" : "🏃 Activity"} · Due at ${dueTime}
          </p>
          <div style="background: #fff3cd; border-radius: 8px; padding: 12px;">
            <p style="margin: 0; color: #856404; font-size: 14px;">⏰ Coming up in <strong>${timeLabel}</strong></p>
          </div>
        </div>
        <p style="margin: 24px 0 0; color: #767676; font-size: 12px; text-align: center;">
          Sent by FamilyScheduler
        </p>
      </div>
    `,
  });
}
