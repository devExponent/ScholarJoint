import * as React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import type { Role } from "@/types";
import {
  LayoutDashboard,
  FileText,
  Users,
  CreditCard,
  Settings,
  ClipboardList,
  CheckSquare,
  User as UserIcon,
  LogOut,
  BookOpen,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react";

interface NavItem {
  label: string;
  to: string;
  icon: React.ElementType;
}

const navByRole: Record<Role, NavItem[]> = {
  admin: [
    { label: "Dashboard", to: "/admin", icon: LayoutDashboard },
    { label: "Manage Conferences", to: "/admin/conference", icon: Settings },
    { label: "Manage Submissions", to: "/admin/submissions", icon: FileText },
    { label: "Manage Reviewers", to: "/admin/reviewers", icon: Users },
    { label: "Payments", to: "/admin/payments", icon: CreditCard },
  ],
  reviewer: [
    { label: "Dashboard", to: "/reviewer", icon: LayoutDashboard },
    { label: "Assigned Papers", to: "/reviewer/assigned", icon: ClipboardList },
    { label: "Completed Reviews", to: "/reviewer/completed", icon: CheckSquare },
  ],
  author: [
    { label: "Dashboard", to: "/author", icon: LayoutDashboard },
    { label: "New Submission", to: "/author/submit", icon: FileText },
    { label: "My Submissions", to: "/author/submissions", icon: BookOpen },
    { label: "Payments", to: "/author/payments", icon: CreditCard },
  ],
};

const ROLE_SEGMENTS: Role[] = ["admin", "reviewer", "author"];
const DESKTOP_OPEN_STORAGE_KEY = "scholarjoint_sidebar_open";
const DESKTOP_BREAKPOINT_QUERY = "(min-width: 768px)";

function loadDesktopOpenPreference(): boolean {
  try {
    const raw = localStorage.getItem(DESKTOP_OPEN_STORAGE_KEY);
    if (raw !== null) return raw === "true";
  } catch {
    // localStorage unavailable - default to open
  }
  return true;
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Two independent states on purpose:
  // - desktopOpen: persists across sessions, controls the sidebar's width on
  //   md+ screens (collapses to 0 rather than overlaying, so content reflows).
  // - mobileOpen: resets every navigation, controls a slide-in overlay drawer
  //   below md (collapsing width on a narrow phone wouldn't leave useful
  //   room, so it stays an overlay there).
  const [desktopOpen, setDesktopOpen] = React.useState(loadDesktopOpenPreference);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  React.useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  React.useEffect(() => {
    try {
      localStorage.setItem(DESKTOP_OPEN_STORAGE_KEY, String(desktopOpen));
    } catch {
      // best-effort only
    }
  }, [desktopOpen]);

  if (!user) return null;

  // The section actually being viewed can differ from the logged-in user's own
  // role - e.g. an Admin browsing into /reviewer/* (allowed by the role
  // hierarchy). Nav items and the portal label should reflect what's on
  // screen, not just who's logged in, or they visually contradict the page.
  const firstSegment = location.pathname.split("/")[1] as Role | undefined;
  const activeRole: Role = firstSegment && ROLE_SEGMENTS.includes(firstSegment) ? firstSegment : user.role;
  const items = navByRole[activeRole] ?? [];
  const isBrowsingOutsideOwnRole = activeRole !== user.role;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Close the mobile drawer automatically if the window is ever resized up
  // to desktop width while it happens to be open - otherwise a stale "open"
  // flag could reappear if the window is later resized back down.
  React.useEffect(() => {
    const mq = window.matchMedia(DESKTOP_BREAKPOINT_QUERY);
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) setMobileOpen(false);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // One button, any screen size. Rather than branching on a JS width check
  // at click-time (which is one more thing that can disagree with the CSS
  // breakpoints), it simply flips both states every click. Only one of them
  // ever has a visible effect at a given width - the desktop aside only
  // responds to desktopOpen (md:block) and the mobile drawer only responds
  // to mobileOpen (md:hidden) - so this always produces the correct result
  // regardless of exactly where the current width falls.
  const toggleSidebar = () => {
    setDesktopOpen((v) => !v);
    setMobileOpen((v) => !v);
  };

  const sidebarContent = (
    <>
      <div className="flex h-20 shrink-0 items-center justify-between gap-2 border-b border-white/10 px-6">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 shrink-0 text-accent" />
          <span className="font-display text-xl font-semibold">Scholarjoint</span>
        </div>
        <button
          onClick={() => setMobileOpen(false)}
          className="rounded-md p-1 text-white/70 hover:bg-white/10 hover:text-white md:hidden"
          aria-label="Close menu"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {isBrowsingOutsideOwnRole && (
        <button
          onClick={() => navigate(`/${user.role}`)}
          className="mx-3 mt-3 flex items-center gap-2 rounded-md bg-white/10 px-3 py-2 text-sm font-medium text-white/90 hover:bg-white/15"
        >
          <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Back to {user.role} portal</span>
        </button>
      )}

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === `/${activeRole}`}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors",
                isActive
                  ? "bg-white/10 text-white"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
              )
            }
          >
            <item.icon className="h-4 w-4 shrink-0" />
            <span className="truncate">{item.label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="shrink-0 border-t border-white/10 p-3">
        <NavLink
          to={`/${activeRole}/profile`}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-base font-medium transition-colors",
              isActive ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/5 hover:text-white"
            )
          }
        >
          <UserIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">Profile Settings</span>
        </NavLink>
        <button
          onClick={handleLogout}
          className="mt-1 flex w-full items-center gap-3 rounded-md px-3 py-2 text-base font-medium text-white/70 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-4 w-4 shrink-0" />
          <span className="truncate">Log Out</span>
        </button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop sidebar - width collapses to 0 rather than disappearing, so
          content reflows smoothly. The inner div keeps a fixed w-72 so the
          nav text doesn't squash/wrap mid-animation - the outer aside just
          clips it via overflow-hidden while its width animates. */}
      <aside
        className={cn(
          "hidden shrink-0 overflow-hidden border-border bg-primary text-primary-foreground transition-[width,border-width] duration-200 md:block",
          desktopOpen ? "md:w-72 md:border-r" : "md:w-0 md:border-r-0"
        )}
      >
        <div className="flex h-full w-72 flex-col">{sidebarContent}</div>
      </aside>

      {/* Mobile sidebar drawer - slides in over content, only interactive below md */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity md:hidden",
          mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
        )}
        onClick={() => setMobileOpen(false)}
        aria-hidden="true"
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[85vw] flex-col bg-primary text-primary-foreground transition-transform duration-200 md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {sidebarContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 border-b border-border bg-card px-4 sm:h-20 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <button
              onClick={toggleSidebar}
              className="shrink-0 rounded-md p-1.5 text-foreground hover:bg-secondary/60"
              aria-label={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
              title={desktopOpen ? "Collapse sidebar" : "Expand sidebar"}
            >
              <Menu className="h-6 w-6" />
            </button>
            <div className="min-w-0 truncate text-base text-muted-foreground">
              <span className="font-medium text-foreground capitalize">{activeRole} Portal</span>
            </div>
          </div>
          <div className="flex min-w-0 items-center gap-3">
            <div className="hidden min-w-0 text-right lg:block">
              <div className="truncate text-base font-medium leading-tight">{user.firstName} {user.lastName}</div>
              <div className="truncate text-sm text-muted-foreground leading-tight">{user.email}</div>
            </div>
            <div className="flex shrink-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-base font-semibold text-accent">
                {user.firstName[0]}
                {user.lastName[0]}
              </div>
              <Button variant="ghost" size="icon" className="shrink-0 lg:hidden" onClick={handleLogout} aria-label="Log out">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </header>
        <main className="min-w-0 flex-1 overflow-x-hidden p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
