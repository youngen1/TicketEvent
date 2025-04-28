import { User } from "@shared/schema";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Link } from "wouter";
import { UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EventHostCardProps {
  host: User | null;
  isLoading: boolean;
}

export default function EventHostCard({ host, isLoading }: EventHostCardProps) {
  if (isLoading) {
    return (
      <div className="mt-4 flex items-center space-x-3 p-3 border rounded-lg animate-pulse">
        <div className="bg-gray-200 h-10 w-10 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-32"></div>
        </div>
      </div>
    );
  }

  if (!host) {
    return (
      <div className="mt-4 flex items-center space-x-3 p-3 border rounded-lg">
        <div className="bg-neutral-100 h-10 w-10 rounded-full flex items-center justify-center">
          <UserIcon className="h-5 w-5 text-neutral-400" />
        </div>
        <div>
          <p className="text-sm text-neutral-500">Host information unavailable</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const displayName = host.displayName || host.username;

  return (
    <div className="mt-4 flex items-center justify-between p-3 border rounded-lg">
      <div className="flex items-center space-x-3">
        <Avatar className="h-10 w-10 cursor-pointer">
          {host.avatar ? (
            <AvatarImage src={host.avatar} alt={displayName} />
          ) : null}
          <AvatarFallback className="bg-primary text-primary-foreground">
            {getInitials(displayName)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-sm">{displayName}</p>
          <p className="text-xs text-neutral-500">@{host.username}</p>
        </div>
      </div>
      <Link href={`/user/${host.id}`}>
        <Button
          variant="outline"
          size="sm"
          className="text-xs"
        >
          View Profile
        </Button>
      </Link>
    </div>
  );
}