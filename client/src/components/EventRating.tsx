import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Event } from "@shared/schema";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EventRatingProps {
  eventId: number;
}

export default function EventRating({ eventId }: EventRatingProps) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [currentRating, setCurrentRating] = useState<number>(0);
  const [hoverRating, setHoverRating] = useState<number>(0);

  // Fetch the current user's rating for this event
  const { data: userRating } = useQuery({
    queryKey: ["/api/events", eventId, "ratings", user?.id],
    enabled: isAuthenticated && !!user?.id,
  });

  // Fetch the average rating for this event
  const { data: averageRating } = useQuery({
    queryKey: ["/api/events", eventId, "ratings", "average"],
  });

  useEffect(() => {
    if (userRating?.rating) {
      setCurrentRating(userRating.rating);
    }
  }, [userRating]);

  // Rate event mutation
  const rateEventMutation = useMutation({
    mutationFn: async (rating: number) => {
      return apiRequest(`/api/events/${eventId}/ratings`, {
        method: "POST",
        body: JSON.stringify({
          rating,
          userId: user?.id,
          eventId,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Rating Submitted",
        description: "Your rating has been submitted successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "ratings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "ratings", "average"] });
      queryClient.invalidateQueries({ queryKey: ["/api/events", eventId, "ratings", user?.id] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit rating. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRating = (rating: number) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please log in to rate this event.",
        variant: "destructive",
      });
      return;
    }
    setCurrentRating(rating);
    rateEventMutation.mutate(rating);
  };

  const formatRating = (rating: number | null | undefined) => {
    if (rating === null || rating === undefined) return "No ratings yet";
    return typeof rating === 'number' ? rating.toFixed(1) : "No ratings";
  };

  return (
    <Card className="mt-6">
      <CardContent className="pt-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">Event Rating</h3>
            <div className="flex items-center">
              <span className="text-xl font-semibold mr-2">
                {formatRating(averageRating)}
              </span>
              <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
            </div>
          </div>

          <div className="flex flex-col space-y-2">
            <p className="text-sm text-muted-foreground mb-2">
              {isAuthenticated
                ? "Rate this event"
                : "Log in to rate this event"}
            </p>
            <div className="flex space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="sm"
                  className="p-1 h-auto"
                  disabled={!isAuthenticated || rateEventMutation.isPending}
                  onClick={() => handleRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <Star
                    className={`h-8 w-8 ${
                      star <= (hoverRating || currentRating)
                        ? "fill-yellow-400 text-yellow-400"
                        : "text-muted-foreground"
                    } transition-colors`}
                  />
                </Button>
              ))}
            </div>
            {userRating?.rating && (
              <p className="text-xs text-muted-foreground mt-1">
                Your rating: {userRating.rating} / 5
              </p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}