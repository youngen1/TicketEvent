import { Share2 } from "lucide-react";
import { Event } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaFacebook, FaTwitter, FaWhatsapp, FaEnvelope, FaLink } from "react-icons/fa";

interface EventShareProps {
  event: Event;
}

export default function EventShare({ event }: EventShareProps) {
  const { toast } = useToast();
  
  const eventUrl = `${window.location.origin}/events?eventId=${event.id}`;
  
  const shareLinks = [
    {
      name: "Facebook",
      icon: <FaFacebook className="h-4 w-4 text-blue-600" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(eventUrl)}`,
    },
    {
      name: "Twitter",
      icon: <FaTwitter className="h-4 w-4 text-blue-400" />,
      url: `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Check out this event: ${event.title}`)}&url=${encodeURIComponent(eventUrl)}`,
    },
    {
      name: "WhatsApp",
      icon: <FaWhatsapp className="h-4 w-4 text-green-500" />,
      url: `https://wa.me/?text=${encodeURIComponent(`Check out this event: ${event.title} ${eventUrl}`)}`,
    },
    {
      name: "Email",
      icon: <FaEnvelope className="h-4 w-4 text-neutral-600" />,
      url: `mailto:?subject=${encodeURIComponent(`Event: ${event.title}`)}&body=${encodeURIComponent(`Check out this event: ${event.title}\n\n${eventUrl}`)}`,
    },
  ];
  
  const copyToClipboard = () => {
    navigator.clipboard.writeText(eventUrl).then(() => {
      toast({
        title: "Link copied!",
        description: "Event link copied to clipboard",
      });
    }).catch(() => {
      toast({
        title: "Failed to copy",
        description: "Could not copy link to clipboard",
        variant: "destructive",
      });
    });
  };
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1">
          <Share2 className="h-4 w-4" /> Share
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {shareLinks.map((link) => (
          <DropdownMenuItem key={link.name} asChild>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 cursor-pointer"
              onClick={(e) => e.stopPropagation()}
            >
              {link.icon}
              <span>Share on {link.name}</span>
            </a>
          </DropdownMenuItem>
        ))}
        <DropdownMenuItem 
          onClick={(e) => {
            e.stopPropagation();
            copyToClipboard();
          }}
          className="flex items-center gap-2 cursor-pointer"
        >
          <FaLink className="h-4 w-4 text-neutral-600" />
          <span>Copy link</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}