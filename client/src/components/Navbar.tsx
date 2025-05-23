import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Menu, X, User, Plus, LogIn, LogOut, Heart, Bell, Calendar, CreditCard, Lock, ShieldCheck, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import NotificationCenter from "@/components/NotificationCenter";

interface NavbarProps {
  onNewEventClick: () => void;
  onLoginClick: () => void;
  onSignupClick: () => void;
}

export default function Navbar({ onNewEventClick, onLoginClick, onSignupClick }: NavbarProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, isAuthenticated, logout } = useAuth();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navLinks = [
    { href: "/", label: "Home" },
    { href: "/events", label: "Events" },
    { href: "/users", label: "Community" },
    { href: "/calendar", label: "Calendar" },
    { href: "/map", label: "Map" },
    { href: "/about", label: "About" }
  ];

  return (
    <nav className="bg-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <h1 className="text-xl font-bold text-primary font-heading">ProjectEvents</h1>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  className={`${
                    location === link.href
                      ? "border-b-2 border-primary text-neutral-900"
                      : "border-transparent text-neutral-600 hover:text-neutral-900"
                  } inline-flex items-center px-1 pt-1 text-sm font-medium`}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center space-x-3">
            <Button 
              className="bg-primary hover:bg-blue-600 text-white" 
              onClick={onNewEventClick}
            >
              <Plus className="h-4 w-4 mr-1" /> New Event
            </Button>

            {isAuthenticated ? (
              <div className="flex items-center space-x-1">
                {/* Notification center */}
                <NotificationCenter />
                
                {/* Favorites link */}
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" title="Saved Events">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                
                {/* Calendar link */}
                <Link href="/calendar">
                  <Button variant="ghost" size="icon" title="My Calendar">
                    <Calendar className="h-5 w-5" />
                  </Button>
                </Link>
                
                {/* User dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <span className="sr-only">Open user menu</span>
                      <div className="h-8 w-8 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700">
                        <User className="h-5 w-5" />
                      </div>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <div className="px-4 py-3">
                      <p className="text-sm font-medium leading-none">{user?.displayName || user?.username || 'Admin'}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">{user?.username || 'admin'}</p>
                    </div>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/profile" className="w-full">
                        <User className="h-4 w-4 mr-2" /> Your Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/users" className="w-full">
                        <Users className="h-4 w-4 mr-2" /> Community
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/tickets" className="w-full">
                        <Calendar className="h-4 w-4 mr-2" /> My Tickets
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/finance" className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" /> Finance
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/payment/settings" className="w-full">
                        <CreditCard className="h-4 w-4 mr-2" /> Payment Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/change-password" className="w-full">
                        <Lock className="h-4 w-4 mr-2" /> Change Password
                      </Link>
                    </DropdownMenuItem>
                    {user?.isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="w-full">
                          <ShieldCheck className="h-4 w-4 mr-2" /> Admin Dashboard
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={logout} className="text-red-600 w-full">
                      <LogOut className="h-4 w-4 mr-2" /> Log out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={onLoginClick}
                >
                  <LogIn className="h-4 w-4 mr-1" /> Log in
                </Button>
                <Button
                  onClick={onSignupClick}
                >
                  Sign up
                </Button>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button 
              className="p-2 rounded-md text-neutral-600 hover:bg-neutral-100 focus:outline-none"
              onClick={toggleMobileMenu}
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}>
        <div className="pt-2 pb-3 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`${
                location === link.href
                  ? "bg-primary text-white"
                  : "text-neutral-800 hover:bg-neutral-100"
              } block pl-3 pr-4 py-2 text-base font-medium`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {isAuthenticated ? (
          <div className="pt-4 pb-3 border-t border-neutral-200">
            <div className="flex items-center px-4">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-neutral-200 flex items-center justify-center text-neutral-700">
                  <User className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-3">
                <div className="text-base font-medium text-neutral-800">{user?.displayName || user?.username || 'Admin'}</div>
                <div className="text-sm text-neutral-500">{user?.username || 'admin'}</div>
              </div>
            </div>
            <div className="mt-3 space-y-1">
              <button 
                className="block w-full text-left px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={onNewEventClick}
              >
                <Plus className="h-4 w-4 inline mr-2" /> New Event
              </button>
              <Link 
                href="/profile" 
                className="block px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-2" /> Your Profile
                </div>
              </Link>
              <Link 
                href="/users" 
                className="block px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Users className="h-4 w-4 mr-2" /> Community
                </div>
              </Link>
              <Link 
                href="/tickets" 
                className="block px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-2" /> My Tickets
                </div>
              </Link>
              <Link 
                href="/finance" 
                className="block px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" /> Finance
                </div>
              </Link>
              <Link 
                href="/payment/settings" 
                className="block px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 mr-2" /> Payment Settings
                </div>
              </Link>
              <Link 
                href="/change-password" 
                className="block px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Lock className="h-4 w-4 mr-2" /> Change Password
                </div>
              </Link>
              {user?.isAdmin && (
                <Link 
                  href="/admin" 
                  className="block px-4 py-2 text-base font-medium text-neutral-700 hover:bg-neutral-100"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <div className="flex items-center">
                    <ShieldCheck className="h-4 w-4 mr-2" /> Admin Dashboard
                  </div>
                </Link>
              )}
              <button 
                className="block w-full text-left px-4 py-2 text-base font-medium text-red-600 hover:bg-neutral-100"
                onClick={logout}
              >
                <LogOut className="h-4 w-4 inline mr-2" /> Log out
              </button>
            </div>
          </div>
        ) : (
          <div className="pt-4 pb-3 border-t border-neutral-200 px-4 space-y-2">
            <Button
              className="w-full"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onLoginClick();
              }}
            >
              <LogIn className="h-4 w-4 mr-1" /> Log in
            </Button>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setIsMobileMenuOpen(false);
                onSignupClick();
              }}
            >
              Sign up
            </Button>
          </div>
        )}
      </div>
    </nav>
  );
}
