import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { Redirect, Link } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
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
import { Loader2, Users, Calendar, Ticket, Database, TrendingUp, CircleDollarSign } from "lucide-react";

interface AdminStats {
  totalUsers: number;
  totalEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  platformBalance: number;
}

interface Transaction {
  id: number;
  eventId: number;
  userId: number;
  quantity: number;
  totalAmount: number;
  paymentStatus: string;
  paymentReference: string;
  purchaseDate: string;
  createdAt: string;
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  
  // Fetch admin stats
  const { 
    data: stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetch: refetchStats
  } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
    enabled: isAuthenticated && user?.isAdmin === true
  });
  
  // Fetch admin transactions
  const { 
    data: transactions,
    isLoading: isTransactionsLoading,
    error: transactionsError,
    refetch: refetchTransactions
  } = useQuery<Transaction[]>({
    queryKey: ['/api/admin/transactions'],
    enabled: isAuthenticated && user?.isAdmin === true
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
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="h-5 w-5 mr-2 text-primary" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isStatsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats?.totalUsers || 0
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-primary" />
              Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isStatsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats?.totalEvents || 0
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Ticket className="h-5 w-5 mr-2 text-primary" />
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isStatsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                stats?.totalTicketsSold || 0
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-primary" />
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isStatsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(stats?.totalRevenue || 0)
              )}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <CircleDollarSign className="h-5 w-5 mr-2 text-primary" />
              Platform Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {isStatsLoading ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                formatCurrency(stats?.platformBalance || 0)
              )}
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Recent Transactions */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            The most recent ticket purchases on the platform
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isTransactionsLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : transactionsError ? (
            <div className="text-center py-8 text-red-500">
              Error loading transactions
            </div>
          ) : (transactions?.length || 0) === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No transactions found
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>A list of recent ticket purchases.</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Event</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Quantity</TableHead>
                    <TableHead>Amount</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Reference</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions?.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell className="font-medium">{transaction.id}</TableCell>
                      <TableCell>{transaction.eventId}</TableCell>
                      <TableCell>{transaction.userId}</TableCell>
                      <TableCell>{transaction.quantity}</TableCell>
                      <TableCell className="font-medium">{formatCurrency(transaction.totalAmount)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.paymentStatus === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : transaction.paymentStatus === 'pending'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {transaction.paymentStatus}
                        </span>
                      </TableCell>
                      <TableCell>{new Date(transaction.purchaseDate).toLocaleDateString()}</TableCell>
                      <TableCell className="font-mono text-xs">{transaction.paymentReference.substring(0, 8)}...</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => {
            refetchTransactions();
            refetchStats();
          }}>
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
      
      {/* System Management */}
      <Card>
        <CardHeader>
          <CardTitle>System Management</CardTitle>
          <CardDescription>
            Administrative functions for platform management
          </CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Button className="flex items-center" variant="outline">
            <Database className="mr-2 h-4 w-4" />
            Database Backup
          </Button>
          <Button className="flex items-center" variant="outline" asChild>
            <Link href="/admin/users">
              <Users className="mr-2 h-4 w-4" />
              Manage Users
            </Link>
          </Button>
          <div className="flex flex-col gap-2">
            <Button 
              className="flex items-center" 
              variant="outline"
              onClick={async () => {
                if (window.confirm("Are you sure you want to delete ALL events? This action cannot be undone.")) {
                  try {
                    const res = await fetch("/api/admin/events/all", {
                      method: "DELETE"
                    });
                    
                    if (res.ok) {
                      toast({
                        title: "Success",
                        description: "All events have been deleted successfully",
                      });
                      
                      // Refresh stats
                      refetchStats();
                    } else {
                      throw new Error("Failed to delete events");
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to delete events",
                      variant: "destructive"
                    });
                  }
                }
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Delete All Events
            </Button>
            
            <Button 
              className="flex items-center" 
              variant="outline"
              onClick={async () => {
                try {
                  const res = await fetch("/api/admin/events/sample", {
                    method: "POST"
                  });
                  
                  if (res.ok) {
                    const data = await res.json();
                    toast({
                      title: "Success",
                      description: `Created ${data.count} South African sample events successfully`,
                    });
                    
                    // Refresh stats
                    refetchStats();
                  } else {
                    throw new Error("Failed to create sample events");
                  }
                } catch (error) {
                  toast({
                    title: "Error",
                    description: "Failed to create sample events",
                    variant: "destructive"
                  });
                }
              }}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Create Sample Events
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}