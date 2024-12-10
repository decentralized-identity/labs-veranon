import { Button } from "./ui/button"
import { Link } from "react-router-dom"

export function Header() {
  return (
    <header className="border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between w-full">
        <div className="flex items-center gap-8">
          {/* Logo/Brand */}
          <Link to="/" className="font-semibold text-foreground select-none">
            VerAnon
          </Link>
          
          {/* Navigation */}
          <nav className="hidden md:flex gap-8">
            <Link to="/manager" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              For Managers
            </Link>
            <Link to="/provider" className="text-sm text-foreground/60 hover:text-foreground transition-colors">
              For Service Providers
            </Link>
          </nav>
        </div>

        {/* Wallet Connect Button */}
        <Button variant="ghost" size="sm">
          Connect Wallet
        </Button>
      </div>
    </header>
  )
} 