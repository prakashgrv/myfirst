import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, isToday, isTomorrow, isPast } from "date-fns";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const CHILD_COLORS = [
  "#FF5A5F", // coral
  "#00A699", // teal
  "#FC642D", // orange
  "#484848", // dark gray
  "#767676", // mid gray
  "#FFB400", // yellow
  "#7B61FF", // purple
  "#E91E8C", // pink
];

export function getChildColor(index: number): string {
  return CHILD_COLORS[index % CHILD_COLORS.length];
}

export function formatDueDate(date: Date | null | undefined): string {
  if (!date) return "";
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  if (isPast(date)) return `Overdue · ${format(date, "MMM d")}`;
  return format(date, "MMM d");
}

export function formatTime(date: Date | null | undefined): string {
  if (!date) return "";
  return format(date, "h:mm a");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export const GRADES = [
  "6th Grade",
  "7th Grade",
  "8th Grade",
  "9th Grade",
  "10th Grade",
  "11th Grade",
  "12th Grade",
];

export const DAYS_OF_WEEK = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export const SUBJECTS = [
  "Math",
  "English",
  "Science",
  "History",
  "Social Studies",
  "Foreign Language",
  "Art",
  "Music",
  "PE",
  "Computer Science",
  "Other",
];
