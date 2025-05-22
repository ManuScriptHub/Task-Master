"use client";

import React, { useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from "@/hooks/useAuth";
import { AppHeader } from "./AppHeader";
import { Loader2 } from "lucide-react";

const AUTH_ROUTES = ["/login", "/register"];
const PUBLIC_ROUTES = [...AUTH_ROUTES]; 

export function ClientLayout({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading) {
      const isAuthRoute = AUTH_ROUTES.includes(location.pathname);
      const isPublicRoute = PUBLIC_ROUTES.includes(location.pathname) || location.pathname === "/"; // Allow homepage as public for landing

      if (isAuthenticated && isAuthRoute) {
        navigate("/"); 
      } else if (!isAuthenticated && !isPublicRoute && location.pathname !== "/") { 
        // If not authenticated, not on a public route, and not on the homepage, redirect to login
        navigate("/login");
      } else if (!isAuthenticated && location.pathname === "/" && !isPublicRoute) {
        // If on homepage, not authenticated, and homepage isn't explicitly public (e.g. needs login)
        // This case depends on whether your homepage itself is public or requires login.
        // For TaskMaster Pro, the main page ('/') shows projects, so it needs auth.
        navigate("/login");
      }
    }
  }, [isAuthenticated, isLoading, location, navigate]);
  
  // This effect can be useful for scenarios where a token might exist but user data couldn't be loaded,
  // forcing a logout or re-authentication.
  useEffect(() => {
    if (!isLoading && !isAuthenticated && user === null && localStorage.getItem(JWT_TOKEN_KEY) && !PUBLIC_ROUTES.includes(location.pathname)) {
       // Token exists in storage, but context says not authenticated (user is null)
       // This could mean token is invalid or user fetch failed.
       console.warn("Token in storage, but not authenticated. Forcing logout.");
       // logout(); // Assuming logout from useAuth() clears storage and redirects
       // Or directly:
       localStorage.removeItem(JWT_TOKEN_KEY);
       navigate("/login");
    }
  }, [isLoading, isAuthenticated, user, location, navigate]);


  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  // Show header if authenticated or on a public route (including auth routes themselves)
  const showHeader = isAuthenticated || PUBLIC_ROUTES.includes(location.pathname) || location.pathname === "/";


  return (
    <div className="flex min-h-screen flex-col">
      {showHeader ? <AppHeader /> : null}
      <main className="flex-grow container py-8">
        {children}
      </main>
      <footer className="py-6 md:px-8 md:py-0 border-t">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-20 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            &copy; {new Date().getFullYear()} TaskMaster Pro. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
