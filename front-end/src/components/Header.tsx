import { Button } from "@/components/ui/button";
import { useAuth } from "../contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

export default function Header() {
  const { logout } = useAuth();
  const location = useLocation();

  return (
    <header className="w-full bg-gray-900/50 backdrop-blur-sm border-b border-gray-800">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <nav className="flex items-center space-x-4">
          <Link to="/chat">
            <Button 
              variant={location.pathname === "/chat" ? "default" : "ghost"}
              className="text-sm"
            >
              Chat Room
            </Button>
          </Link>
          <Link to="/settings">
            <Button 
              variant={location.pathname === "/settings" ? "default" : "ghost"}
              className="text-sm"
            >
              Account Settings
            </Button>
          </Link>
        </nav>
        <Button onClick={logout} variant="ghost" className="text-sm">
          Logout
        </Button>
      </div>
    </header>
  );
} 