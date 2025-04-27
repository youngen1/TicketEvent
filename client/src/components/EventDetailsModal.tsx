import { useState, useEffect, useRef } from "react";
import { Event } from "@shared/schema";
import { 
  Heart, Calendar, MapPin, Users, X, ChevronLeft, ChevronRight, 
  Maximize, ArrowLeft, ArrowRight, Star, Clock,
  CreditCard
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import EventRating from "./EventRating";
import EventAttendance from "./EventAttendance";
import PaymentButton from "./PaymentButton";
import PaystackPaymentButton from "./PaystackPaymentButton";

interface EventDetailsModalProps {
  event: Event | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function EventDetailsModal({ event, isOpen, onClose }: EventDetailsModalProps) {
  const queryClient = useQueryClient();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [parsedImages, setParsedImages] = useState<string[]>([]);
  const [scheduleItems, setScheduleItems] = useState<{ time: string; title: string; description?: string }[]>([]);
  const imageRef = useRef<HTMLImageElement>(null);

  // State for video display
  const [showVideo, setShowVideo] = useState(false);

  // Parse event data and reset state when event changes
  useEffect(() => {
    if (!event) return;
    
    setActiveImageIndex(0);
    setIsFullscreen(false);
    setShowVideo(false);
    
    // Parse images
    let images: string[] = [];
    if (event.images) {
      try {
        images = JSON.parse(event.images);
      } catch (e) {
        console.error("Failed to parse images:", e);
      }
    }
    
    // Fallback to single image if images array is empty
    if (images.length === 0 && event.image) {
      images = [event.image];
    }
    
    setParsedImages(images);
    
    // Parse schedule data
    let schedule: { time: string; title: string; description?: string }[] = [];
    const eventSchedule = (event as any).schedule;
    if (eventSchedule) {
      try {
        schedule = JSON.parse(eventSchedule);
      } catch (e) {
        console.error("Failed to parse schedule:", e);
      }
    }
    
    setScheduleItems(schedule);
  }, [event]);
  
  // Listen for custom event to automatically open fullscreen view
  useEffect(() => {
    const handleOpenFullscreen = (e: CustomEvent) => {
      if (!event) return;
      const { eventId } = e.detail;
      if (event.id === eventId) {
        setIsFullscreen(true);
      }
    };
    
    window.addEventListener('openEventFullscreen', handleOpenFullscreen as EventListener);
    
    return () => {
      window.removeEventListener('openEventFullscreen', handleOpenFullscreen as EventListener);
    };
  }, [event]);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!event) return null;
      const res = await apiRequest("PUT", `/api/events/${event.id}/favorite`, null);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/events"] });
    }
  });

  if (!event) return null;

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev > 0 ? prev - 1 : parsedImages.length - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev < parsedImages.length - 1 ? prev + 1 : 0));
  };

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    
    // Handle relative URLs
    if (url.startsWith('/uploads')) {
      // Use window.location to get current host for correct URL in all environments
      const baseUrl = `${window.location.protocol}//${window.location.host}`;
      return `${baseUrl}${url}`;
    }
    
    // Handle full URLs
    return url;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  // Touch swipe handlers for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isSwipe = Math.abs(distance) > minSwipeDistance;
    
    if (isSwipe) {
      if (distance > 0) {
        // Swipe left
        handleNextImage();
      } else {
        // Swipe right
        handlePrevImage();
      }
    }
  };

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      handlePrevImage();
    } else if (e.key === 'ArrowRight') {
      handleNextImage();
    } else if (e.key === 'Escape' && isFullscreen) {
      setIsFullscreen(false);
    } else if (e.key === 'f') {
      toggleFullscreen();
    }
  };

  // Fullscreen image view component
  const FullscreenImageView = () => (
    <div 
      className="fixed inset-0 z-50 bg-black flex items-center justify-center"
      onKeyDown={handleKeyDown}
      tabIndex={0}
    >
      <button 
        className="absolute top-4 right-4 z-50 text-white p-2 rounded-full bg-black/50 hover:bg-black/70"
        onClick={() => setIsFullscreen(false)}
        aria-label="Close fullscreen view"
      >
        <X size={24} />
      </button>
      
      <div 
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {parsedImages.length > 0 && (
          <img 
            ref={imageRef}
            src={getFullImageUrl(parsedImages[activeImageIndex])}
            alt={`${event.title} - Image ${activeImageIndex + 1}`}
            className="max-h-full max-w-full object-contain"
          />
        )}
        
        {parsedImages.length > 1 && (
          <>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
              {parsedImages.map((_: string, index: number) => (
                <button
                  key={index}
                  onClick={() => setActiveImageIndex(index)}
                  className={`h-3 w-3 rounded-full ${
                    index === activeImageIndex ? "bg-white" : "bg-white/50"
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
            
            <button 
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
              onClick={handlePrevImage}
            >
              <ArrowLeft size={24} />
            </button>
            
            <button 
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full p-3"
              onClick={handleNextImage}
            >
              <ArrowRight size={24} />
            </button>
            
            <div className="absolute top-4 left-4 bg-black/50 text-white px-3 py-2 rounded-md text-sm">
              {activeImageIndex + 1} / {parsedImages.length}
            </div>
          </>
        )}
      </div>
    </div>
  );

  return (
    <>
      {isFullscreen && <FullscreenImageView />}
      
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="sm:max-w-3xl p-0 overflow-hidden max-h-[90vh] overflow-y-auto" 
                       aria-describedby="event-details-description">
          <DialogHeader className="sr-only">
            <DialogTitle>{event.title}</DialogTitle>
          </DialogHeader>
          
          <div className="bg-white">
            {/* Media Display Area */}
            <div 
              className="relative h-64 sm:h-80 w-full bg-neutral-200"
              onTouchStart={!showVideo ? onTouchStart : undefined}
              onTouchMove={!showVideo ? onTouchMove : undefined}
              onTouchEnd={!showVideo ? onTouchEnd : undefined}
              onKeyDown={!showVideo ? handleKeyDown : undefined}
              tabIndex={0}
            >
              {/* Video Player */}
              {event.video && showVideo ? (
                <div className="w-full h-full flex items-center justify-center bg-black">
                  <div className="text-center">
                    <video 
                      src={event.video} 
                      controls 
                      className="max-h-full max-w-full"
                      poster={parsedImages.length > 0 ? getFullImageUrl(parsedImages[0]) : ''}
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                    <p className="text-white text-xs mt-2">If video is slow to load, please wait a moment or click back to images.</p>
                  </div>
                </div>
              ) : parsedImages.length > 0 ? (
                <>
                  <img 
                    src={getFullImageUrl(parsedImages[activeImageIndex])} 
                    alt={event.title} 
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={toggleFullscreen}
                  />
                  
                  {/* Fullscreen button */}
                  <button
                    className="absolute bottom-2 right-2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 z-10"
                    onClick={toggleFullscreen}
                    aria-label="View fullscreen"
                  >
                    <Maximize size={18} />
                  </button>
                  
                  {/* Video toggle button if video exists */}
                  {event.video && (
                    <button
                      className="absolute bottom-2 left-2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 z-10 flex items-center"
                      onClick={() => setShowVideo(true)}
                      aria-label="Show video"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide-video">
                        <path d="m22 8-6 4 6 4V8Z"/>
                        <rect width="14" height="12" x="2" y="6" rx="2" ry="2"/>
                      </svg>
                      <span className="ml-1 text-xs">Play Video</span>
                    </button>
                  )}
                  
                  {/* Image navigation */}
                  {parsedImages.length > 1 && (
                    <>
                      <button 
                        onClick={handlePrevImage}
                        className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 focus:outline-none"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button 
                        onClick={handleNextImage}
                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/30 text-white rounded-full p-1 hover:bg-black/50 focus:outline-none"
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1">
                        {parsedImages.map((_: string, index: number) => (
                          <button
                            key={index}
                            onClick={() => setActiveImageIndex(index)}
                            className={`h-2 w-2 rounded-full ${
                              index === activeImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                            aria-label={`Go to image ${index + 1}`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="w-full h-full bg-neutral-300 flex items-center justify-center text-neutral-500">
                  No Media Available
                </div>
              )}

              {/* Back to Image button when video is showing */}
              {showVideo && event.video && (
                <button
                  className="absolute top-2 left-2 bg-black/40 text-white rounded-full p-1.5 hover:bg-black/60 z-10 flex items-center"
                  onClick={() => setShowVideo(false)}
                  aria-label="Back to images"
                >
                  <ChevronLeft size={18} />
                  <span className="ml-1 text-xs">Back to Images</span>
                </button>
              )}
            </div>

            {/* Thumbnail gallery for quick navigation */}
            {parsedImages.length > 1 && (
              <div className="px-4 pt-2 overflow-x-auto">
                <div className="flex space-x-2 pb-2">
                  {parsedImages.map((url: string, index: number) => (
                    <button
                      key={index}
                      className={`flex-shrink-0 h-16 w-16 rounded overflow-hidden ${
                        index === activeImageIndex ? "ring-2 ring-primary" : ""
                      }`}
                      onClick={() => setActiveImageIndex(index)}
                    >
                      <img
                        src={getFullImageUrl(url)}
                        alt={`Thumbnail ${index + 1}`}
                        className="h-full w-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div className="px-4 pt-5 pb-4 sm:p-6" id="event-details-description">
              <div className="flex justify-between items-start">
                <div>
                  <Badge className={`${getCategoryStyles(event.category || '')}`}>
                    {event.category || 'General'}
                  </Badge>
                  <h3 className="mt-2 text-2xl font-bold text-neutral-900 font-heading">
                    {event.title}
                  </h3>
                </div>
                <button 
                  className="bg-white rounded-full p-1.5 text-neutral-400 hover:text-red-500 focus:outline-none"
                  onClick={() => toggleFavoriteMutation.mutate()}
                  disabled={toggleFavoriteMutation.isPending}
                >
                  <Heart className={(event as any).isFavorite ? "text-red-500 fill-red-500" : ""} size={20} />
                </button>
              </div>
              
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-3">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Calendar className="text-primary" size={20} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-neutral-500">Date & Time</h4>
                    <p className="mt-1 text-sm text-neutral-900">{event.date} • {event.time}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <MapPin className="text-primary" size={20} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-neutral-500">Location</h4>
                    <p className="mt-1 text-sm text-neutral-900">{event.location}</p>
                  </div>
                </div>
                
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <Users className="text-primary" size={20} />
                  </div>
                  <div className="ml-3">
                    <h4 className="text-sm font-medium text-neutral-500">Attendees</h4>
                    <p className="mt-1 text-sm text-neutral-900">{event.attendees || 0} registered</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <h4 className="text-lg font-medium text-neutral-900 font-heading">About The Event</h4>
                <p className="mt-2 text-neutral-600 whitespace-pre-line mobile-text">
                  {event.description}
                </p>
              </div>
              
              <Separator className="my-6" />
              
              {/* Event interaction tabs */}
              <Tabs defaultValue="details" className="w-full">
                <TabsList className="w-full grid grid-cols-2 mb-6 responsive-padding">
                  <TabsTrigger value="details" className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" /> Details
                  </TabsTrigger>
                  <TabsTrigger value="rsvp" className="flex items-center">
                    <Users className="h-4 w-4 mr-2" /> Attendees
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="details" className="mt-0 space-y-6">
                  {/* Event schedule */}
                  {scheduleItems.length > 0 && (
                    <div>
                      <h4 className="text-lg font-medium text-neutral-900 font-heading">Schedule</h4>
                      <div className="mt-2 border-t border-neutral-200">
                        {scheduleItems.map((item, index) => (
                          <div key={index} className={`py-3 flex ${index > 0 ? 'border-t border-neutral-200' : ''}`}>
                            <div className="text-sm font-medium text-neutral-500 w-24">{item.time}</div>
                            <div>
                              <h5 className="text-sm font-medium text-neutral-900">{item.title}</h5>
                              {item.description && (
                                <p className="text-sm text-neutral-600">{item.description}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Event rating component */}
                  <EventRating eventId={event.id} />
                </TabsContent>
                
                <TabsContent value="rsvp" className="mt-0">
                  <EventAttendance event={event} />
                </TabsContent>
              </Tabs>
            </div>
            <DialogFooter className="bg-neutral-50 px-4 py-3 flex flex-row justify-between">
              <div className="flex items-center space-x-2">
                {event.price && parseFloat(event.price) > 0 && (
                  <>
                    <PaystackPaymentButton 
                      eventId={event.id} 
                      amount={parseFloat(event.price)} 
                      buttonText={`Pay with Paystack`}
                      className="flex items-center"
                    />
                    <div className="text-sm font-medium text-neutral-700">
                      Price: R{parseFloat(event.price).toFixed(2)}
                    </div>
                  </>
                )}
              </div>
              <Button type="button" variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function getCategoryStyles(category: string): string {
  const styles: Record<string, string> = {
    "Technology": "bg-blue-100 text-blue-800",
    "Business": "bg-green-100 text-green-800",
    "Music": "bg-purple-100 text-purple-800",
    "Art": "bg-yellow-100 text-yellow-800",
    "Education": "bg-indigo-100 text-indigo-800",
    "Sports": "bg-red-100 text-red-800",
  };
  
  return styles[category] || "bg-gray-100 text-gray-800";
}