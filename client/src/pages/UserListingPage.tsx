import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { User } from "@shared/schema";
import { useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, UserPlus, UserMinus, Search, CalendarDays, Loader2 } from "lucide-react";

// Extended user type with additional API properties
interface ExtendedUser {
  id: number;
  username: string;
  displayName: string | null;
  email: string | null;
  bio: string | null;
  avatar: string | null;
  followersCount: number | null;
  followingCount: number | null;
  isAdmin: boolean | null;
  isFollowing?: boolean;
  eventsCount?: number;
}

export default function UserListingPage() {
  const [, navigate] = useLocation();
  const { user: currentUser, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  
  // Get all users
  const { data: users = [], isLoading } = useQuery<ExtendedUser[]>({
    queryKey: ["/api/users/all"],
  });
  
  const filteredUsers = users
    .filter(user => 
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.displayName && user.displayName.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      // Sort by 1) not current user, 2) followers count
      if (a.id === currentUser?.id) return -1;
      if (b.id === currentUser?.id) return 1;
      return (b.followersCount || 0) - (a.followersCount || 0);
    });
  
  const handleFollowToggle = async (userId: number, isFollowing: boolean) => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to follow users",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const endpoint = `/api/users/${userId}/follow`;
      const method = isFollowing ? "DELETE" : "POST";
      const res = await fetch(endpoint, { method });
      
      if (!res.ok) {
        throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} user`);
      }
      
      // Refresh the data
      setTimeout(() => {
        window.location.reload();
      }, 500);
      
      toast({
        title: "Success",
        description: `You are now ${isFollowing ? 'no longer following' : 'following'} this user`,
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };
  
  const viewProfile = (userId: number) => {
    navigate(`/users/${userId}`);
  };
  
  const getInitials = (name: string) => {
    return name.substring(0, 2).toUpperCase();
  };
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Community</h1>
        <p className="text-muted-foreground">
          Discover event creators and attendees to follow
        </p>
      </div>
      
      <div className="mb-6 relative">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
          <Input 
            className="pl-10"
            placeholder="Search users by name or username..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>
      
      {filteredUsers.length === 0 ? (
        <div className="text-center py-12">
          <Users className="h-16 w-16 mx-auto text-muted-foreground/50 mb-4" />
          <h2 className="text-2xl font-medium mb-2">No users found</h2>
          <p className="text-muted-foreground">
            Try adjusting your search query
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredUsers.map(user => {
            // Check if this is the current user
            const isCurrentUser = currentUser?.id === user.id;
            
            // Check if current user is following this user
            const isFollowing = user.isFollowing || false;
            
            return (
              <Card key={user.id} className="overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <Avatar className="h-16 w-16 cursor-pointer" onClick={() => viewProfile(user.id)}>
                      {user.avatar ? (
                        <AvatarImage src={user.avatar} />
                      ) : null}
                      <AvatarFallback className="text-xl bg-primary text-primary-foreground">
                        {getInitials(user.username)}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 
                            className="font-medium text-lg hover:text-primary cursor-pointer"
                            onClick={() => viewProfile(user.id)}
                          >
                            {user.displayName || user.username}
                          </h3>
                          
                          {user.displayName && (
                            <p className="text-sm text-muted-foreground mb-2">@{user.username}</p>
                          )}
                        </div>
                        
                        {!isCurrentUser && isAuthenticated && (
                          <Button 
                            size="sm" 
                            variant={isFollowing ? "outline" : "default"}
                            onClick={() => handleFollowToggle(user.id, isFollowing)}
                          >
                            {isFollowing ? (
                              <>
                                <UserMinus className="mr-1 h-4 w-4" />
                                <span className="hidden sm:inline">Unfollow</span>
                              </>
                            ) : (
                              <>
                                <UserPlus className="mr-1 h-4 w-4" />
                                <span className="hidden sm:inline">Follow</span>
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-2 mt-3 gap-1">
                        <div className="flex items-center text-sm">
                          <Users className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{user.followersCount || 0} Followers</span>
                        </div>
                        <div className="flex items-center text-sm">
                          <CalendarDays className="mr-1 h-4 w-4 text-muted-foreground" />
                          <span>{user.eventsCount || 0} Events</span>
                        </div>
                      </div>
                      
                      <div className="mt-4">
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => viewProfile(user.id)}
                        >
                          View Profile
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}