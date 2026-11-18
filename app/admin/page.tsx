"use client";

import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Send, Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

type Client = {
  id: string;
  email: string;
  firstname: string;
  lastname: string;
  status: string;
  CreatedAt: string;
  lastLogin: string | null;
  eligibleForWelcome: boolean;
  hasReceivedWelcome: boolean;
};

type ClientList = {
  clients: Client[];
  pagination: { pageNumber: number; totalPages: number; totalCount: number };
};

export default function AdminDashboard() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [result, setResult] = useState<ClientList | null>(null);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [message, setMessage] = useState("");
  const [feedback, setFeedback] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [loadError, setLoadError] = useState("");

  const loadClients = useCallback(async (signal?: AbortSignal) => {
    setLoadError("");
    try {
      const response = await fetch(`/api/admin/clients?pageNumber=${page}&pageSize=25`, {
        cache: "no-store",
        signal,
      });
      if (response.status === 401) {
        router.replace("/");
        return;
      }
      const data = (await response.json()) as ClientList & { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Could not load clients.");
      setResult(data);
    } catch (error) {
      if (error instanceof Error && error.name !== "AbortError") setLoadError(error.message);
    }
  }, [page, router]);

  useEffect(() => {
    const controller = new AbortController();
    void loadClients(controller.signal);
    return () => controller.abort();
  }, [loadClients]);

  async function handleSend(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedClient) return;

    setIsSending(true);
    setFeedback("");
    try {
      const response = await fetch("/api/admin/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId: selectedClient.id, content: message }),
      });
      const data = (await response.json()) as { message?: string };
      if (!response.ok) throw new Error(data.message ?? "Could not send welcome message.");

      setFeedback(`Welcome message sent to ${selectedClient.firstname}.`);
      setMessage("");
      setSelectedClient(null);
      await loadClients();
    } catch (error) {
      setFeedback(error instanceof Error ? error.message : "Could not send welcome message.");
    } finally {
      setIsSending(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.replace("/");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-muted/40">
      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <a className="flex items-center gap-3 font-semibold tracking-[0.16em]" href="/admin">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">N</span>
            <span className="text-xs">NEO SALOON · ADMIN</span>
          </a>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut aria-hidden="true" />
            Sign out
          </Button>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl gap-7 px-5 py-9 md:py-12">
        <section>
          <Badge variant="secondary" className="mb-3">CLIENT MANAGEMENT</Badge>
          <h1 className="text-3xl font-semibold tracking-tight">Clients</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Review client accounts and send a personal welcome to eligible new clients.
          </p>
        </section>

        <div className="grid items-start gap-6 lg:grid-cols-[1.3fr_0.7fr]">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Users aria-hidden="true" className="size-5" />
                <div>
                  <CardTitle>Client accounts</CardTitle>
                  <CardDescription>{result?.pagination.totalCount ?? "—"} registered clients</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loadError ? <p className="mb-4 text-sm text-destructive" role="alert">{loadError}</p> : null}
              <div className="divide-y">
                {result?.clients.map((client) => (
                  <div key={client.id} className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-medium">{client.firstname} {client.lastname}</p>
                      <p className="truncate text-sm text-muted-foreground">{client.email}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Joined {new Date(client.CreatedAt).toLocaleDateString()}
                        {client.lastLogin ? ` · Last login ${new Date(client.lastLogin).toLocaleDateString()}` : ""}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      {client.hasReceivedWelcome ? (
                        <Badge variant="secondary">Welcomed</Badge>
                      ) : client.eligibleForWelcome ? (
                        <Badge>New client</Badge>
                      ) : (
                        <Badge variant="outline">Not eligible</Badge>
                      )}
                      {client.eligibleForWelcome ? (
                        <Button
                          variant={selectedClient?.id === client.id ? "secondary" : "outline"}
                          size="sm"
                          onClick={() => {
                            setSelectedClient(client);
                            setFeedback("");
                          }}
                        >
                          {selectedClient?.id === client.id ? "Selected" : "Welcome"}
                        </Button>
                      ) : null}
                    </div>
                  </div>
                ))}
                {result && result.clients.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">No client accounts yet.</p>
                ) : null}
                {!result && !loadError ? (
                  <p className="py-8 text-center text-sm text-muted-foreground" role="status">Loading clients…</p>
                ) : null}
              </div>
              {result && result.pagination.totalPages > 1 ? (
                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-xs text-muted-foreground">
                    Page {result.pagination.pageNumber} of {result.pagination.totalPages}
                  </span>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}>
                      Previous
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={page >= result.pagination.totalPages}
                      onClick={() => setPage((value) => value + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Send a welcome</CardTitle>
              <CardDescription>
                A welcome can only be sent once to an active client who joined in the last seven days.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedClient ? (
                <form className="grid gap-4" onSubmit={handleSend}>
                  <div className="rounded-lg bg-muted px-3 py-2 text-sm">
                    <p className="font-medium">{selectedClient.firstname} {selectedClient.lastname}</p>
                    <p className="text-muted-foreground">{selectedClient.email}</p>
                  </div>
                  <label className="grid gap-2 text-sm font-medium" htmlFor="welcome-message">
                    Message
                    <Textarea
                      id="welcome-message"
                      value={message}
                      onChange={(event) => setMessage(event.target.value)}
                      placeholder="Welcome to Neo Saloon! Here’s a little about what you can expect…"
                      maxLength={1000}
                      rows={6}
                      required
                    />
                    <span className="text-right text-xs font-normal text-muted-foreground">{message.length}/1000</span>
                  </label>
                  <Button type="submit" disabled={isSending || !message.trim()}>
                    <Send aria-hidden="true" />
                    {isSending ? "Sending…" : "Send welcome"}
                  </Button>
                </form>
              ) : (
                <p className="rounded-lg border border-dashed p-5 text-center text-sm text-muted-foreground">
                  Choose an eligible new client to compose a welcome message.
                </p>
              )}
              {feedback ? <p className="mt-4 text-sm text-muted-foreground" role="status">{feedback}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
