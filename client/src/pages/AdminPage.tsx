import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Banknote, 
  Users, 
  LineChart, 
  ShieldCheck,
  ArrowUpDown,
  Calendar
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { User, EventTicket } from '@shared/schema';
import { useQuery } from "@tanstack/react-query";

export default function AdminPage() {
  const { toast } = useToast();
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalEvents: 0,
    totalTicketsSold: 0,
    totalRevenue: 0,
    platformBalance: 0
  });
  
  // Fetch admin data 
  const { data: adminData, isLoading: isLoadingAdmin } = useQuery({
    queryKey: ['/api/admin/stats'],
    queryFn: async () => {
      const response = await fetch('/api/admin/stats');
      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Access denied",
            description: "You don't have admin privileges to view this page.",
            variant: "destructive",
          });
          throw new Error("Unauthorized");
        }
        throw new Error('Failed to fetch admin data');
      }
      return response.json();
    },
    retry: false
  });

  // Fetch recent transactions
  const { data: recentTransactions = [], isLoading: isLoadingTransactions } = useQuery<EventTicket[]>({
    queryKey: ['/api/admin/transactions'],
    queryFn: async () => {
      const response = await fetch('/api/admin/transactions');
      if (!response.ok) throw new Error('Failed to fetch transactions');
      return response.json();
    },
    retry: false
  });

  useEffect(() => {
    if (adminData) {
      setPlatformStats({
        totalUsers: adminData.totalUsers || 0,
        totalEvents: adminData.totalEvents || 0,
        totalTicketsSold: adminData.totalTicketsSold || 0,
        totalRevenue: adminData.totalRevenue || 0,
        platformBalance: adminData.platformBalance || 0
      });
    }
  }, [adminData]);

  if (isLoadingAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="container py-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary h-6 w-6" />
          <span className="text-lg font-medium">Platform Administration</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Platform Balance</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformStats.platformBalance)}</div>
            <p className="text-xs text-muted-foreground">
              15% of all ticket sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <LineChart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(platformStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From all ticket sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Registered users
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{platformStats.totalEvents}</div>
            <p className="text-xs text-muted-foreground">
              {platformStats.totalTicketsSold} tickets sold
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Recent ticket sales with platform fees
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoadingTransactions ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : recentTransactions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Platform Fee</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentTransactions
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                  .map(transaction => {
                    const totalAmount = parseFloat(transaction.totalAmount?.toString() || "0");
                    const platformFee = totalAmount * 0.15;
                    
                    return (
                      <TableRow key={transaction.id}>
                        <TableCell>{formatDate(new Date(transaction.createdAt || ''))}</TableCell>
                        <TableCell className="font-medium">Event #{transaction.eventId}</TableCell>
                        <TableCell>User #{transaction.userId}</TableCell>
                        <TableCell>{formatCurrency(totalAmount)}</TableCell>
                        <TableCell className="text-primary font-medium">
                          {formatCurrency(platformFee)}
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            transaction.paymentStatus === 'completed' 
                              ? 'bg-green-100 text-green-800' 
                              : transaction.paymentStatus === 'pending' 
                              ? 'bg-yellow-100 text-yellow-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {transaction.paymentStatus}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No transaction data available yet</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}