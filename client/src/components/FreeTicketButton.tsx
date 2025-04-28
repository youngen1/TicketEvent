import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Ticket } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface FreeTicketButtonProps {
  eventId: number;
  className?: string;
  buttonText?: string;
}

export default function FreeTicketButton({ 
  eventId, 
  className = "", 
  buttonText = "Get Free Ticket" 
}: FreeTicketButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const getTicketMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('POST', '/api/tickets/free', {
        eventId: eventId
      });
    },
    onMutate: () => {
      setIsLoading(true);
    },
    onSuccess: async () => {
      toast({
        title: "Success!",
        description: "Your free ticket has been registered",
        variant: "default",
      });
      
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/tickets/attendees`] });
      queryClient.invalidateQueries({ queryKey: [`/api/events/${eventId}/ticket`] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/tickets'] });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Could not register your free ticket",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsLoading(false);
    }
  });
  
  const handleClick = () => {
    getTicketMutation.mutate();
  };
  
  return (
    <Button 
      onClick={handleClick} 
      disabled={isLoading} 
      className={`${className}`}
    >
      <Ticket className="h-4 w-4 mr-2" />
      {isLoading ? "Processing..." : buttonText}
    </Button>
  );
}