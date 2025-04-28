import { User } from "@shared/schema";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CalendarDays, Users, Star, Heart, MapPin, Info } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UserProfileSummaryProps {
  user: User;
  stats?: {
    eventsAttended: number;
    eventsCreated: number;
    averageRating: number;
  };
}

export default function UserProfileSummary({ user, stats }: UserProfileSummaryProps) {
  const interests = user.interests ? user.interests.split(',').map(i => i.trim()).filter(Boolean) : [];
  const joinedDate = user.createdAt ? formatDistanceToNow(new Date(user.createdAt), { addSuffix: true }) : "Unknown";
  
  return (
    <Card className="w-full shadow-md">
      <CardHeader className="pb-3">
        <CardTitle className="text-xl font-semibold">About {user.displayName || user.username}</CardTitle>
        <CardDescription className="flex items-center text-sm text-muted-foreground">
          <CalendarDays className="mr-1 h-4 w-4" /> 
          Joined {joinedDate}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {user.bio && (
          <div className="space-y-2">
            <div className="flex items-center">
              <Info className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Bio</h3>
            </div>
            <p className="text-sm text-muted-foreground">{user.bio}</p>
          </div>
        )}
        
        {interests.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center">
              <Heart className="mr-2 h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-medium">Interests</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {interests.map((interest, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {interest}
                </Badge>
              ))}
            </div>
          </div>
        )}
        
        {stats && (
          <>
            <Separator />
            <div className="pt-2 grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold">{stats.eventsCreated}</p>
                <p className="text-xs text-muted-foreground">Events Created</p>
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.eventsAttended}</p>
                <p className="text-xs text-muted-foreground">Events Attended</p>
              </div>
              <div>
                <div className="flex items-center justify-center">
                  <p className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</p>
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 ml-1" />
                </div>
                <p className="text-xs text-muted-foreground">Average Rating</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}