import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import EventsPage from "@/pages/EventsPage";
import CalendarPage from "@/pages/CalendarPage";
import AboutPage from "@/pages/AboutPage";
import ProfilePage from "@/pages/ProfilePage";
import UserProfilePage from "@/pages/UserProfilePage";
import MapPage from "@/pages/MapPage";
import FavoritesPage from "@/pages/FavoritesPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentSettingsPage from "@/pages/PaymentSettingsPage";
import FinancePage from "@/pages/FinancePage";
import AdminPage from "@/pages/AdminPage";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState } from "react";
import CreateEventModal from "@/components/CreateEventModal";
import LoginModal from "@/components/LoginModal";
import SignupModal from "@/components/SignupModal";
import { AuthProvider } from "@/contexts/AuthContext";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/events" component={EventsPage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/users/:id" component={UserProfilePage} />
      <Route path="/payment/success" component={PaymentSuccessPage} />
      <Route path="/payment/settings" component={PaymentSettingsPage} />
      <Route path="/finance" component={FinancePage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isSignupModalOpen, setIsSignupModalOpen] = useState(false);

  const handleLoginSuccess = () => {
    // After successful login, close modal and update UI
    setIsLoginModalOpen(false);
  };

  const handleSignupSuccess = () => {
    // After successful signup, show login modal
    setIsSignupModalOpen(false);
    setIsLoginModalOpen(true);
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="flex flex-col min-h-screen">
            <Navbar 
              onNewEventClick={() => setIsCreateModalOpen(true)} 
              onLoginClick={() => setIsLoginModalOpen(true)}
              onSignupClick={() => setIsSignupModalOpen(true)}
            />
            <div className="flex-grow">
              <Router />
            </div>
            <Footer />
            <CreateEventModal 
              isOpen={isCreateModalOpen} 
              onClose={() => setIsCreateModalOpen(false)} 
            />
            <LoginModal
              isOpen={isLoginModalOpen}
              onClose={() => setIsLoginModalOpen(false)}
              onSignupClick={() => {
                setIsLoginModalOpen(false);
                setIsSignupModalOpen(true);
              }}
              onSuccess={handleLoginSuccess}
            />
            <SignupModal
              isOpen={isSignupModalOpen}
              onClose={() => setIsSignupModalOpen(false)}
              onLoginClick={() => {
                setIsSignupModalOpen(false);
                setIsLoginModalOpen(true);
              }}
              onSuccess={handleSignupSuccess}
            />
            <Toaster />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;