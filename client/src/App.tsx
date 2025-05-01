import { Switch, Route, useLocation } from "wouter";
import React, { useEffect } from "react";
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
import UserListingPage from "@/pages/UserListingPage";
import MapPage from "@/pages/MapPage";
import FavoritesPage from "@/pages/FavoritesPage";
import PaymentSuccessPage from "@/pages/PaymentSuccessPage";
import PaymentSettingsPage from "@/pages/PaymentSettingsPage";
import FinancePage from "@/pages/FinancePage";
import AdminPage from "@/pages/AdminPage";
import UserManagementPage from "@/pages/UserManagementPage";
import VerifyEmailPage from "@/pages/VerifyEmailPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import ForgotPasswordPage from "@/pages/ForgotPasswordPage";
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
      <Route path="/events/:id" component={EventsPage} />
      <Route path="/calendar" component={CalendarPage} />
      <Route path="/map" component={MapPage} />
      <Route path="/favorites" component={FavoritesPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/profile" component={ProfilePage} />
      <Route path="/users" component={UserListingPage} />
      <Route path="/community" component={UserListingPage} />
      <Route path="/users/:id" component={UserProfilePage} />
      <Route path="/payment/success" component={PaymentSuccessPage} />
      <Route path="/payment/settings" component={PaymentSettingsPage} />
      <Route path="/finance" component={FinancePage} />
      <Route path="/admin" component={AdminPage} />
      <Route path="/admin/users" component={UserManagementPage} />
      {/* Authentication routes */}
      <Route path="/verify-email" component={VerifyEmailPage} />
      <Route path="/reset-password" component={ResetPasswordPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

// Component to handle deep linking to events via URL parameters
function EventDeepLinkHandler() {
  const [, setLocation] = useLocation();
  
  useEffect(() => {
    // Check for eventId in URL query parameters when app loads
    const params = new URLSearchParams(window.location.search);
    const eventId = params.get('eventId');
    
    if (eventId) {
      console.log('Found eventId in URL:', eventId);
      // Find the event and open its modal
      const openEventModal = () => {
        try {
          const parsedId = parseInt(eventId, 10);
          if (isNaN(parsedId)) {
            console.error('Invalid eventId, not a number:', eventId);
            return;
          }
          
          // Create a custom event to trigger opening the event modal
          const customEvent = new CustomEvent('openEventById', {
            detail: { eventId: parsedId }
          });
          
          console.log('Dispatching openEventById event with:', parsedId);
          window.dispatchEvent(customEvent);
          
          // Don't clear the URL parameter immediately to allow time for event to be processed
          // We'll do this from the events page after the modal opens
        } catch (error) {
          console.error('Error opening event from deep link:', error);
        }
      };
      
      // Navigate to the events page if not already there (helps with deep linking)
      if (window.location.pathname !== '/events') {
        setLocation('/events', { replace: true });
        // Add a delay to ensure navigation has completed before dispatching the event
        setTimeout(openEventModal, 500);
      } else {
        // We're already on the events page, open the modal with a shorter delay
        setTimeout(openEventModal, 300);
      }
    }
  }, [setLocation]);
  
  return null;
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
            <EventDeepLinkHandler />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;