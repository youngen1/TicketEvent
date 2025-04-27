import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Users, Search, Ban, CheckCircle, User, ArrowLeft } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "wouter";

interface UserData {
  id: number;
  username: string;
  displayName: string;
  email: string;
  isAdmin: boolean;
  createdAt: string;
  followersCount: number;
  followingCount: number;
  avatar: string;
  isBanned: boolean;
}

export default function UserManagementPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  
  // Set up debounce effect for search
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 500);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchQuery]);
  
  // Fetch users
  const { 
    data: users,
    isLoading: isUsersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery<UserData[]>({
    queryKey: ['/api/admin/users', debouncedSearchQuery],
    queryFn: async ({ queryKey }) => {
      const [_, query] = queryKey;
      const url = `/api/admin/users${query ? `?search=${query}` : ''}`;
      const res = await apiRequest("GET", url);
      return res.json();
    },
    enabled: isAuthenticated && user?.isAdmin === true
  });
  
  // Toggle ban status mutation
  const toggleBanMutation = useMutation({
    mutationFn: async (userId: number) => {
      const res = await apiRequest("POST", `/api/admin/users/${userId}/toggle-ban`);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/admin/users'] });
      toast({
        title: "User status updated",
        description: "User ban status has been toggled successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    },
  });
  
  // Handle auth loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  // Redirect non-admin users
  if (!isAuthenticated || user?.isAdmin !== true) {
    toast({
      title: "Access Denied",
      description: "You don't have permission to view this page.",
      variant: "destructive"
    });
    return <Redirect to="/" />;
  }
  
  return (
    <div className="container mx-auto py-8 px-4 md:px-8">
      <div className="flex items-center mb-6">
        <Link href="/admin" className="mr-4">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Admin Dashboard
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">User Management</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>User Administration</CardTitle>
          <CardDescription>
            Search, view, and manage user accounts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-neutral-500" />
              <Input
                type="text"
                placeholder="Search users by username or display name..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => refetchUsers()}>
              Refresh
            </Button>
          </div>
          
          {isUsersLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : usersError ? (
            <div className="text-center py-8 text-red-500">
              Error loading users. Please try again.
            </div>
          ) : !users || users.length === 0 ? (
            <div className="text-center py-8 text-neutral-500">
              {debouncedSearchQuery 
                ? `No users found matching "${debouncedSearchQuery}"`
                : "No users found in the system"
              }
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Followers</TableHead>
                    <TableHead>Following</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((userData) => (
                    <TableRow key={userData.id}>
                      <TableCell className="font-medium flex items-center gap-2">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={userData.avatar} alt={userData.displayName} />
                          <AvatarFallback>{userData.username.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div>{userData.displayName}</div>
                          <div className="text-neutral-500 text-xs">@{userData.username}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {userData.isAdmin ? (
                          <Badge variant="default" className="bg-blue-500">Admin</Badge>
                        ) : (
                          <Badge variant="outline">User</Badge>
                        )}
                      </TableCell>
                      <TableCell>{userData.followersCount}</TableCell>
                      <TableCell>{userData.followingCount}</TableCell>
                      <TableCell>
                        {userData.isBanned ? (
                          <Badge variant="destructive">Banned</Badge>
                        ) : (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300">Active</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        {userData.isAdmin ? (
                          <Button variant="ghost" disabled className="text-neutral-400">
                            <User className="h-4 w-4 mr-1" />
                            Admin
                          </Button>
                        ) : (
                          <Button 
                            variant={userData.isBanned ? "outline" : "destructive"} 
                            size="sm"
                            onClick={() => toggleBanMutation.mutate(userData.id)}
                            disabled={toggleBanMutation.isPending}
                          >
                            {toggleBanMutation.isPending ? (
                              <Loader2 className="h-4 w-4 animate-spin mr-1" />
                            ) : userData.isBanned ? (
                              <CheckCircle className="h-4 w-4 mr-1" />
                            ) : (
                              <Ban className="h-4 w-4 mr-1" />
                            )}
                            {userData.isBanned ? "Unban User" : "Ban User"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}