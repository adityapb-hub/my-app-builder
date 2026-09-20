import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import {
  ChevronDown,
  Handshake,
  LayoutDashboard,
  LogOut,
  MessageSquareText,
  Sparkles,
  Store,
  Users,
} from "lucide-react";
import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useActor } from "@/lib/coop";
import { supabase } from "@/integrations/supabase/client";

const NAV = [
  { to: "/providers", label: "Find help", icon: Store },
  { to: "/community", label: "Community", icon: Users },
  { to: "/assistant", label: "Smart assistant", icon: Sparkles },
] as const;

export function AppShell({ children }: { children: ReactNode }) {
  const actor = useActor();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center gap-4 px-4 sm:px-6">
          <Link to="/" className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Handshake className="size-[18px]" strokeWidth={2.2} />
            </span>
            <span className="flex flex-col leading-none">
              <span className="font-display text-[17px] font-bold tracking-tight">
                HomeEase
              </span>
              <span className="mt-0.5 text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                Neighbourhood services
              </span>
            </span>
          </Link>

          <nav className="ml-4 hidden items-center gap-1 md:flex">
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{
                  className:
                    "rounded-lg px-3 py-2 text-sm font-semibold text-primary bg-brand-soft",
                }}
              >
                {item.label}
              </Link>
            ))}
            {actor.uid ? (
              <Link
                to="/bookings"
                className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
                activeProps={{
                  className:
                    "rounded-lg px-3 py-2 text-sm font-semibold text-primary bg-brand-soft",
                }}
              >
                My bookings
              </Link>
            ) : null}
          </nav>

          <div className="ml-auto flex items-center gap-2">
            {actor.uid ? (
              <AccountMenu actor={actor} />
            ) : (
              <>
                <Button
                  asChild
                  variant="ghost"
                  className="hidden text-sm font-semibold sm:inline-flex"
                >
                  <Link to="/auth">Log in</Link>
                </Button>
                <Button asChild className="rounded-full px-4 text-sm font-semibold">
                  <Link to="/auth">Get started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/70 bg-surface">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-6 text-sm text-muted-foreground sm:px-6">
          <p className="font-display text-[15px] font-semibold text-foreground">
            HomeEase
          </p>
          <p>Connecting communities with trusted local services.</p>
        </div>
      </footer>
    </div>
  );
}

function AccountMenu({
  actor,
}: {
  actor: ReturnType<typeof useActor>;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  const initials =
    (actor.profile?.full_name ?? actor.user?.email ?? "You")
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "You";

  async function handleSignOut() {
    await queryClient.cancelQueries();
    queryClient.clear();
    await supabase.auth.signOut();
    navigate({ to: "/auth", replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full border border-border bg-background py-1 pl-1 pr-2.5 transition-colors hover:bg-secondary">
          <span className="grid size-7 place-items-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
            {initials}
          </span>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 rounded-xl">
        <DropdownMenuLabel className="truncate text-sm">
          {actor.profile?.full_name || actor.user?.email}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/dashboard">
            <LayoutDashboard className="size-4" />
            Dashboard
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/bookings">
            <MessageSquareText className="size-4" />
            My bookings
          </Link>
        </DropdownMenuItem>
        {actor.isProvider ? (
          <DropdownMenuItem asChild>
            <Link to="/provider">
              <Store className="size-4" />
              Provider desk
            </Link>
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem asChild>
            <Link to="/provider/register">
              <Store className="size-4" />
              Offer a service
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onSelect={handleSignOut}
          className={pathname === "/auth" ? "hidden" : ""}
        >
          <LogOut className="size-4" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
