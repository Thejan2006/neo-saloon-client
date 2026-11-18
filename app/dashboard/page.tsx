"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpRight, CalendarDays, LogOut, MessageCircle, Scissors, ShieldCheck, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

type DashboardData = {
  client: {
    firstname: string;
    lastname: string;
    email: string;
    CreatedAt: string;
  };
  welcomeMessage: {
    content: string;
    createdAt: string;
    sender: { firstname: string; lastname: string };
  } | null;
};

export default function ClientDashboard() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/dashboard", { cache: "no-store", signal: controller.signal })
      .then(async (response) => {
        if (response.status === 401) {
          router.replace("/");
          return;
        }
        const result = (await response.json()) as DashboardData & { message?: string };
        if (!response.ok) throw new Error(result.message ?? "Could not load your dashboard.");
        setData(result);
      })
      .catch((loadError: unknown) => {
        if (loadError instanceof Error && loadError.name !== "AbortError") {
          setError(loadError.message);
        }
      });

    return () => controller.abort();
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  if (!data) {
    return (
      <main className="min-h-screen bg-muted/40 px-5 py-12">
        <p className="mx-auto max-w-3xl text-sm text-muted-foreground" role={error ? "alert" : "status"}>
          {error || "Preparing your Neo Saloon space…"}
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a className="flex items-center gap-3 font-semibold tracking-[0.16em]" href="/dashboard">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">N</span>
            <span className="text-xs">NEO SALOON</span>
          </a>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-7 px-5 py-9 md:py-12">
        <section className="relative overflow-hidden rounded-3xl bg-[#191918] px-7 py-9 text-white md:px-10 md:py-12">
          <div className="absolute -right-10 -top-20 size-72 rounded-full border border-white/10" aria-hidden="true" />
          <div className="relative max-w-2xl">
            <Badge variant="outline" className="mb-5 border-white/25 bg-white/5 text-white">
              <Sparkles aria-hidden="true" />
              YOUR PERSONAL SALON SPACE
            </Badge>
            <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">
              Good to have you here, {data.client.firstname}.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/65 md:text-base">
              Your Neo Saloon account is ready. This is your place to keep up with messages and get to know the experience.
            </p>
          </div>
        </section>

        {data.welcomeMessage ? (
          <Card className="border-primary/15 shadow-sm">
            <CardHeader>
              <div className="flex items-start gap-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
                  <MessageCircle aria-hidden="true" className="size-5" />
                </span>
                <div>
                  <CardTitle>A note from the Neo Saloon team</CardTitle>
                  <CardDescription>
                    From {data.welcomeMessage.sender.firstname} {data.welcomeMessage.sender.lastname} ·{" "}
                    {new Date(data.welcomeMessage.createdAt).toLocaleDateString()}
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-sm leading-7 text-foreground/80">
                {data.welcomeMessage.content}
              </p>
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="grid size-10 place-items-center rounded-xl bg-muted">
                <ShieldCheck aria-hidden="true" className="size-5" />
              </span>
              <div>
                <CardTitle className="text-base">Your account</CardTitle>
                <CardDescription>Signed in securely</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{data.client.email}</CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="grid size-10 place-items-center rounded-xl bg-muted">
                <CalendarDays aria-hidden="true" className="size-5" />
              </span>
              <div>
                <CardTitle className="text-base">Member since</CardTitle>
                <CardDescription>Your Neo Saloon journey</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              {new Date(data.client.CreatedAt).toLocaleDateString(undefined, {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
              <span className="grid size-10 place-items-center rounded-xl bg-muted">
                <Scissors aria-hidden="true" className="size-5" />
              </span>
              <div>
                <CardTitle className="text-base">A little introduction</CardTitle>
                <CardDescription>Make yourself at home</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 text-sm text-muted-foreground">
              Explore Neo Saloon and reach out to the team when you’re ready to plan a visit.
              <ArrowUpRight aria-hidden="true" className="size-4 shrink-0" />
            </CardContent>
          </Card>
        </section>
      </div>
    </main>
  );
}
