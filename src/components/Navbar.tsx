"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Sun, Moon, BookOpen, Menu, X, LogOut, LayoutDashboard, Shield, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/program", label: "Program" },
  { href: "/courses", label: "Courses" },
];

export function Navbar() {
  const { theme, setTheme } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setMounted(true);
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled ? "bg-paper/95 dark:bg-ink-navy/95 backdrop-blur-md shadow-sm border-b border-line-gray-light dark:border-line-gray-dark" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 bg-signal-emerald rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-bold text-lg text-ink-navy dark:text-paper tracking-tight">Caliber</span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive(link.href)
                    ? "text-signal-emerald bg-signal-emerald/10"
                    : "text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper hover:bg-line-gray-light/50 dark:hover:bg-line-gray-dark/50"
                }`}>
                {link.label}
              </Link>
            ))}
            {/* Practice — primary pill */}
            <Link href="/practice"
              className={`ml-1 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                isActive("/practice")
                  ? "bg-signal-emerald text-white shadow-md shadow-signal-emerald/30"
                  : "bg-signal-emerald/10 text-signal-emerald hover:bg-signal-emerald hover:text-white hover:shadow-md hover:shadow-signal-emerald/30"
              }`}>
              <Zap className="w-3.5 h-3.5" />
              Practice
            </Link>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2">
            {mounted && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="p-2 rounded-lg text-slate dark:text-paper/70 hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors" aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}

            {isAuthenticated ? (
              <div className="flex items-center gap-2">
                {user?.role === "admin" && (
                  <Link href="/admin" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-alert-coral border border-alert-coral/30 rounded-lg hover:bg-alert-coral/10 transition-colors">
                    <Shield className="w-3.5 h-3.5" /> Admin
                  </Link>
                )}
                <Link href="/dashboard" className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-signal-emerald text-white rounded-lg hover:bg-signal-emerald/90 transition-colors">
                  <LayoutDashboard className="w-3.5 h-3.5" /> Dashboard
                </Link>
                <button onClick={logout} className="p-2 rounded-lg text-slate dark:text-paper/70 hover:bg-line-gray-light dark:hover:bg-line-gray-dark transition-colors" aria-label="Logout">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-slate dark:text-paper/70 hover:text-ink-navy dark:hover:text-paper transition-colors">
                  Sign In
                </Link>
                <Link href="/signup" className="px-4 py-2 text-sm font-medium bg-ink-navy dark:bg-paper text-paper dark:text-ink-navy rounded-lg hover:opacity-90 transition-opacity">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile: theme + hamburger */}
          <div className="flex md:hidden items-center gap-2">
            {mounted && (
              <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} className="p-2 rounded-lg text-slate dark:text-paper/70" aria-label="Toggle theme">
                {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </button>
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} className="p-2 rounded-lg text-slate dark:text-paper/70" aria-label="Toggle menu">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-paper dark:bg-ink-navy border-b border-line-gray-light dark:border-line-gray-dark overflow-hidden">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href} onClick={() => setMenuOpen(false)}
                  className={`block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(link.href) ? "text-signal-emerald bg-signal-emerald/10" : "text-slate dark:text-paper/70 hover:bg-line-gray-light dark:hover:bg-line-gray-dark"
                  }`}>
                  {link.label}
                </Link>
              ))}
              <Link href="/practice" onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold text-signal-emerald bg-signal-emerald/10">
                <Zap className="w-3.5 h-3.5" /> Practice
              </Link>
              <div className="pt-2 border-t border-line-gray-light dark:border-line-gray-dark">
                {isAuthenticated ? (
                  <div className="space-y-1">
                    <Link href="/dashboard" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-signal-emerald">Dashboard</Link>
                    <button onClick={() => { logout(); setMenuOpen(false); }} className="block w-full text-left px-4 py-2.5 text-sm font-medium text-slate dark:text-paper/70">Sign Out</button>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <Link href="/login" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-slate dark:text-paper/70">Sign In</Link>
                    <Link href="/signup" onClick={() => setMenuOpen(false)} className="block px-4 py-2.5 text-sm font-bold text-ink-navy dark:text-paper">Sign Up</Link>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
