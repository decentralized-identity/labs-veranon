import { Link, useLocation } from "react-router-dom"
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { cn } from "../lib/utils"

export function Header() {
  const location = useLocation()
  
  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/'
    }
    return location.pathname.startsWith(path)
  }

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between w-full">
        <div className="flex items-center gap-8">
          {/* Logo/Brand */}
          <Link 
            to="/" 
            className={cn(
              "font-semibold select-none transition-colors",
              isActive('/') ? "text-foreground" : "text-foreground/60 hover:text-foreground"
            )}
          >
            VerAnon
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link 
              to="/manager" 
              className={cn(
                "text-sm transition-colors",
                isActive('/manager') ? "text-foreground font-medium" : "text-foreground/60 hover:text-foreground"
              )}
            >
              For Managers
            </Link>
            <Link 
              to="/service-provider" 
              className={cn(
                "text-sm transition-colors",
                isActive('/service-provider') ? "text-foreground font-medium" : "text-foreground/60 hover:text-foreground"
              )}
            >
              For Service Providers
            </Link>
          </nav>
        </div>
        <ConnectButton />
      </div>
    </header>
  )
} 