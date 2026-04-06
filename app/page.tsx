import Link from "next/link";
import { CalendarDays, BookOpen, Users, Bell, Globe, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

const features = [
  {
    icon: BookOpen,
    title: "Homework Tracking",
    desc: "Add assignments with due dates, subjects, and priority levels. Never miss a deadline.",
    color: "#FF5A5F",
  },
  {
    icon: CalendarDays,
    title: "Activity Scheduling",
    desc: "Manage sports, clubs, lessons, and all recurring extracurriculars in one place.",
    color: "#00A699",
  },
  {
    icon: Users,
    title: "Household View",
    desc: "See every child's schedule side by side with color-coded views for your whole family.",
    color: "#FC642D",
  },
  {
    icon: Bell,
    title: "Smart Reminders",
    desc: "Get email reminders before deadlines so nothing slips through the cracks.",
    color: "#FFB400",
  },
  {
    icon: Globe,
    title: "Google Calendar Sync",
    desc: "Push any schedule item to Google Calendar for seamless family coordination.",
    color: "#7B61FF",
  },
  {
    icon: Star,
    title: "Per-Kid Dashboards",
    desc: "Each child gets their own profile view — perfect for a quick morning check-in.",
    color: "#E91E8C",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Nav */}
      <nav className="border-b border-gray-100 px-6 py-4">
        <div className="mx-auto max-w-7xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FF5A5F]">
              <CalendarDays className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-gray-900">FamilyScheduler</span>
          </div>
          <Link href="/login">
            <Button variant="outline" size="sm">Sign in</Button>
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#FF5A5F]/5 via-white to-[#00A699]/5" />
        <div className="relative mx-auto max-w-7xl px-6 py-24 sm:py-32 text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#FF5A5F]/10 px-4 py-2 text-sm font-medium text-[#FF5A5F] mb-6">
            <Star className="h-4 w-4" />
            Built for busy families
          </div>
          <h1 className="text-5xl sm:text-6xl font-bold text-gray-900 tracking-tight leading-tight mb-6">
            One place for every
            <br />
            <span className="text-[#FF5A5F]">kid&apos;s schedule.</span>
          </h1>
          <p className="text-xl text-gray-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Track homework, manage extracurriculars, and stay ahead of every deadline —
            for every child in your household.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <svg className="h-5 w-5" viewBox="0 0 24 24">
                  <path fill="currentColor" fillOpacity=".8" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="currentColor" fillOpacity=".8" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="currentColor" fillOpacity=".8" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                  <path fill="currentColor" fillOpacity=".8" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                Get started with Google
              </Button>
            </Link>
          </div>

          {/* Floating kid cards preview */}
          <div className="mt-16 flex justify-center gap-4 flex-wrap">
            {[
              { name: "Alex", grade: "8th Grade", color: "#FF5A5F", hw: 2, act: 1 },
              { name: "Jordan", grade: "10th Grade", color: "#00A699", hw: 1, act: 2 },
              { name: "Sam", grade: "6th Grade", color: "#FC642D", hw: 3, act: 0 },
            ].map((kid) => (
              <div
                key={kid.name}
                className="rounded-2xl border border-gray-100 bg-white shadow-md p-4 w-44 text-left transition-transform hover:-translate-y-1"
              >
                <div className="h-1.5 w-full rounded-full mb-3" style={{ backgroundColor: kid.color }} />
                <div className="flex items-center gap-2 mb-3">
                  <div
                    className="h-9 w-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
                    style={{ backgroundColor: kid.color }}
                  >
                    {kid.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{kid.name}</p>
                    <p className="text-xs text-gray-400">{kid.grade}</p>
                  </div>
                </div>
                <div className="flex gap-1.5 flex-wrap">
                  {kid.hw > 0 && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                      {kid.hw} HW
                    </span>
                  )}
                  {kid.act > 0 && (
                    <span className="text-xs bg-green-50 text-green-700 px-2 py-0.5 rounded-full font-medium">
                      {kid.act} activity
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-4">
            Everything your family needs
          </h2>
          <p className="text-center text-gray-500 mb-12 max-w-xl mx-auto">
            From daily homework checks to long-term activity planning — all in one beautifully simple app.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl bg-white border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div
                    className="h-12 w-12 rounded-2xl flex items-center justify-center mb-4"
                    style={{ backgroundColor: `${f.color}15` }}
                  >
                    <Icon className="h-6 w-6" style={{ color: f.color }} />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-[#FF5A5F]">
        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to get organized?
          </h2>
          <p className="text-white/80 text-lg mb-8">
            Join families who stay on top of every homework assignment and after-school activity.
          </p>
          <Link href="/login">
            <Button size="lg" className="bg-white text-[#FF5A5F] hover:bg-gray-50">
              Start for free — it&apos;s always free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8 px-6">
        <div className="mx-auto max-w-7xl flex items-center justify-between text-sm text-gray-400">
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-lg bg-[#FF5A5F] flex items-center justify-center">
              <CalendarDays className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-medium text-gray-600">FamilyScheduler</span>
          </div>
          <p>© {new Date().getFullYear()} FamilyScheduler. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
