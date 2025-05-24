
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { useAuthStore } from "../../stores/authStore";
import { LogOut, CircleCheckBig } from "lucide-react";

export function AppHeader() {
  const { user, logout, isAuthenticated } = useAuthStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <CircleCheckBig className="h-6 w-6 text-primary fill-green-400" />
          <span className="font-bold text-lg">TaskMaster Pro</span>
        </Link>
        <nav className="flex items-center gap-4">
          {isAuthenticated && user ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline">
                Welcome, {user.name}!
              </span>
              <Button variant="ghost" size="icon" onClick={logout} aria-label="Logout">
                <LogOut className="h-5 w-5" />
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link to="/register">Register</Link>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
