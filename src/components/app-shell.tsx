import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate } from "@tanstack/react-router";
import {
  Bell,
  CalendarDays,
  FileText,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  Search,
  Settings,
  Shield,
  Sparkles,
  Users,
} from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";

import { ThemeToggle } from "@/components/theme-toggle";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsAdmin, useProfile, useSignOut, useUser } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/meetings", label: "Meetings", icon: FileText },
  { to: "/actions", label: "Action tracker", icon: ListChecks },
  { to: "/calendar", label: "Calendar", icon: CalendarDays },
  { to: "/team", label: "Team", icon: Users },
  { to: "/profile", label: "Profile", icon: Settings },
] as const;

function SidebarNav({ onNavigate }: { onNavigate?: () => void }) {
  const { data: isAdmin } = useIsAdmin();

  return (
    <div className="flex h-full flex-col gap-1 bg-sidebar p-4">
      <Link to="/" className="mb-5 flex items-center gap-2 px-2" onClick={onNavigate}>
        <span className="flex size-8 items-center justify-center rounded-xl bg-gradient-primary">
          <Sparkles className="size-4 text-primary-foreground" />
        </span>
        <span className="text-base font-bold text-sidebar-foreground">MinuteFlow</span>
      </Link>

      <nav className="flex flex-col gap-1">
        {NAV.map(({ to, label, icon: Icon }) => (
          <Link
            key={to}
            to={to}
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{
              className:
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold bg-sidebar-accent text-sidebar-accent-foreground",
            }}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        ))}
        {isAdmin && (
          <Link
            to="/admin"
            onClick={onNavigate}
            className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-sidebar-foreground/75 transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            activeProps={{
              className:
                "flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-semibold bg-sidebar-accent text-sidebar-accent-foreground",
            }}
          >
            <Shield className="size-4" />
            Admin panel
          </Link>
        )}
      </nav>

      <div className="mt-auto rounded-2xl border border-sidebar-border bg-sidebar-accent/40 p-3">
        <p className="text-xs font-semibold text-sidebar-foreground">AI minutes ready</p>
        <p className="mt-1 text-xs text-sidebar-foreground/70">
          Paste a transcript and MinuteFlow drafts summaries, decisions and actions.
        </p>
        <Button asChild size="sm" className="mt-3 w-full">
          <Link to="/meetings/new" onClick={onNavigate}>
            New meeting
          </Link>
        </Button>
      </div>
    </div>
  );
}

function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const { data } = useQuery({
    queryKey: ["global-search"],
    enabled: open,
    queryFn: async () => {
      const [meetings, actions] = await Promise.all([
        supabase.from("meetings").select("id,title").order("created_at", { ascending: false }).limit(20),
        supabase.from("action_items").select("id,task").order("created_at", { ascending: false }).limit(20),
      ]);
      return { meetings: meetings.data ?? [], actions: actions.data ?? [] };
    },
  });

  return (
    <>
      <Button
        variant="outline"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-56 justify-start gap-2 rounded-xl text-muted-foreground sm:flex"
      >
        <Search className="size-4" />
        <span className="text-sm">Search everything…</span>
      </Button>
      <Button variant="ghost" size="icon" className="sm:hidden" onClick={() => setOpen(true)}>
        <Search className="size-4" />
        <span className="sr-only">Search</span>
      </Button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search meetings and action items…" />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {(data?.meetings.length ?? 0) > 0 && (
            <CommandGroup heading="Meetings">
              {data?.meetings.map((m) => (
                <CommandItem
                  key={m.id}
                  value={`meeting ${m.title}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate({ to: "/meetings/$id", params: { id: m.id } });
                  }}
                >
                  <FileText className="mr-2 size-4" />
                  {m.title}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          {(data?.actions.length ?? 0) > 0 && (
            <CommandGroup heading="Action items">
              {data?.actions.map((a) => (
                <CommandItem
                  key={a.id}
                  value={`action ${a.task}`}
                  onSelect={() => {
                    setOpen(false);
                    navigate({ to: "/actions" });
                  }}
                >
                  <ListChecks className="mr-2 size-4" />
                  {a.task}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}

function Notifications() {
  const queryClient = useQueryClient();
  const { user } = useUser();

  const { data } = useQuery({
    queryKey: ["notifications", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(15);
      if (error) throw error;
      return data;
    },
  });

  const unread = (data ?? []).filter((n) => !n.read).length;

  async function markAllRead() {
    if (!user) return;
    await supabase.from("notifications").update({ read: true }).eq("user_id", user.id).eq("read", false);
    queryClient.invalidateQueries({ queryKey: ["notifications"] });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="size-4" />
          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
              {unread}
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-2xl">
        <DropdownMenuLabel className="flex items-center justify-between">
          Notifications
          {unread > 0 && (
            <button className="text-xs font-medium text-primary" onClick={markAllRead}>
              Mark all read
            </button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {(data ?? []).length === 0 ? (
          <p className="px-2 py-6 text-center text-sm text-muted-foreground">You're all caught up.</p>
        ) : (
          <ScrollArea className="max-h-72">
            {data?.map((n) => (
              <div key={n.id} className="px-2 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium">{n.title}</p>
                  {!n.read && <Badge variant="secondary">New</Badge>}
                </div>
                {n.body && <p className="mt-0.5 text-xs text-muted-foreground">{n.body}</p>}
              </div>
            ))}
          </ScrollArea>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function AppShell({
  title,
  description,
  actions,
  children,
}: {
  title: string;
  description?: string;
  actions?: ReactNode;
  children: ReactNode;
}) {
  const { data: profile } = useProfile();
  const { user } = useUser();
  const signOut = useSignOut();
  const [mobileOpen, setMobileOpen] = useState(false);

  const name = profile?.full_name || user?.email || "there";
  const initials = name
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join("");

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[260px_1fr]">
      <aside className="sticky top-0 hidden h-screen border-r border-sidebar-border lg:block">
        <SidebarNav />
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="sticky top-0 z-30 flex items-center gap-2 border-b bg-background/85 px-4 py-3 backdrop-blur md:px-6">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden">
                <Menu className="size-4" />
                <span className="sr-only">Open navigation</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[270px] p-0">
              <SheetTitle className="sr-only">Navigation</SheetTitle>
              <SidebarNav onNavigate={() => setMobileOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="ml-auto flex items-center gap-1.5">
            <GlobalSearch />
            <Notifications />
            <ThemeToggle />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2 px-2">
                  <Avatar className="size-7">
                    <AvatarFallback className="bg-gradient-primary text-xs text-primary-foreground">
                      {initials || "MF"}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden max-w-28 truncate text-sm font-medium sm:inline">{name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                <DropdownMenuLabel className="truncate">{user?.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/profile">
                    <Settings className="mr-2 size-4" /> Profile settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => void signOut()}>
                  <LogOut className="mr-2 size-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        <main className={cn("flex-1 px-4 py-6 md:px-8 md:py-8")}>
          <div className="mx-auto w-full max-w-6xl">
            <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{title}</h1>
                {description && (
                  <p className="mt-1 text-sm text-muted-foreground md:text-base">{description}</p>
                )}
              </div>
              {actions}
            </div>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
