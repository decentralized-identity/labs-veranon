import { Link, useLocation } from "react-router-dom"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { cn } from "../lib/utils"
import { useState } from "react"

export function Header() {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between w-full">
        <div className="flex items-center gap-4 md:gap-8">
          {/* Mobile Menu Button - Now First */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 -ml-2"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            </svg>
          </button>

          {/* Logo/Brand - Now Second */}
          <Link 
            to="/" 
            className={cn(
              "font-semibold select-none transition-colors",
              isActive('/') ? "text-foreground" : "text-foreground/60 hover:text-foreground"
            )}
          >
            VerAnon
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link 
              to="/manager" 
              className={cn(
                "text-sm transition-colors",
                isActive('/manager') ? "text-foreground font-medium" : "text-foreground/60 hover:text-foreground"
              )}
            >
              Managers
            </Link>
            <Link 
              to="/service-provider" 
              className={cn(
                "text-sm transition-colors",
                isActive('/service-provider') ? "text-foreground font-medium" : "text-foreground/60 hover:text-foreground"
              )}
            >
              Service Providers
            </Link>
          </nav>
        </div>

        <div className="flex items-center">
          <ConnectButton />
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border">
          <nav className="flex flex-col px-4 py-2">
            <Link 
              to="/manager" 
              className={cn(
                "py-2 text-sm transition-colors",
                isActive('/manager') ? "text-foreground font-medium" : "text-foreground/60 hover:text-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Managers
            </Link>
            <Link 
              to="/service-provider" 
              className={cn(
                "py-2 text-sm transition-colors",
                isActive('/service-provider') ? "text-foreground font-medium" : "text-foreground/60 hover:text-foreground"
              )}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Service Providers
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
} 