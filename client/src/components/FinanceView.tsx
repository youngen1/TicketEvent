import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';

import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { 
  ChevronDown, 
  Download, 
  Banknote, 
  ArrowUpRight, 
  Clock,
  CreditCard,
  DollarSign,
  Users,
  LineChart,
  AlertCircle
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Event, EventTicket } from '@shared/schema';
import { queryClient, apiRequest } from "@/lib/queryClient";

// Withdrawal request schema
const withdrawalFormSchema = z.object({
  amount: z.string()
    .refine(val => !isNaN(Number(val)), {
      message: "Amount must be a valid number",
    })
    .refine(val => Number(val) >= 50, {
      message: "Minimum withdrawal amount is R50",
    }),
  accountName: z.string().min(3, {
    message: "Account name must be at least 3 characters long",
  }),
  accountNumber: z.string().min(10, {
    message: "Please enter a valid account number",
  }),
  bankName: z.string().min(2, {
    message: "Please select a bank",
  }),
});

type WithdrawalFormValues = z.infer<typeof withdrawalFormSchema>;

// Withdrawal history type
type WithdrawalRequest = {
  id: number;
  amount: number;
  status: 'pending' | 'approved' | 'processed' | 'rejected';
  date: Date;
};

interface FinanceViewProps {
  userId: number;
}

export default function FinanceView({ userId }: FinanceViewProps) {
  const [isWithdrawalDialogOpen, setIsWithdrawalDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch bank list from Paystack
  const { data: banks = [], isLoading: isLoadingBanks } = useQuery({
    queryKey: ['/api/finance/banks'],
    queryFn: async () => {
      const response = await fetch('/api/finance/banks');
      if (!response.ok) throw new Error('Failed to fetch banks');
      return response.json();
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });

  // Fetch user's events
  const { data: userEvents = [] } = useQuery<Event[]>({
    queryKey: ['/api/users', userId, 'events'],
    queryFn: async () => {
      const response = await fetch(`/api/users/${userId}/events`);
      if (!response.ok) throw new Error('Failed to fetch events');
      return response.json();
    }
  });

  // Fetch all sold tickets
  const { data: userTickets = [] } = useQuery<EventTicket[]>({
    queryKey: ['/api/users/tickets'],
    queryFn: async () => {
      const response = await fetch('/api/users/tickets');
      if (!response.ok) throw new Error('Failed to fetch tickets');
      return response.json();
    }
  });

  // Filter completed tickets
  const completedTickets = userTickets.filter(ticket => 
    ticket.paymentStatus === 'completed' && 
    userEvents.some(event => event.id === ticket.eventId)
  );

  // Use all completed tickets
  const filteredTickets = completedTickets;

  // Calculate revenue statistics
  const totalRevenue = filteredTickets.reduce(
    (sum, ticket) => sum + parseFloat(ticket.totalAmount.toString() || '0'), 
    0
  );
  
  const ticketsByEvent = filteredTickets.reduce((acc, ticket) => {
    const eventId = ticket.eventId;
    if (!acc[eventId]) {
      acc[eventId] = {
        event: userEvents.find(e => e.id === eventId),
        tickets: [],
        revenue: 0
      };
    }
    acc[eventId].tickets.push(ticket);
    acc[eventId].revenue += parseFloat(ticket.totalAmount.toString() || '0');
    return acc;
  }, {} as Record<number, { event: Event | undefined, tickets: EventTicket[], revenue: number }>);

  const eventRevenue = Object.values(ticketsByEvent)
    .filter(item => item.event) // Filter out events that might not exist
    .sort((a, b) => b.revenue - a.revenue); // Sort by revenue (highest first)
    
  // Mock withdrawal history
  const [withdrawalHistory, setWithdrawalHistory] = useState<WithdrawalRequest[]>([
    {
      id: 1,
      amount: 250.00,
      status: 'processed',
      date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000), // 15 days ago
    },
    {
      id: 2,
      amount: 375.50,
      status: 'approved',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
    {
      id: 3,
      amount: 120.75,
      status: 'pending',
      date: new Date(), // Today
    }
  ]);
  
  // Form for withdrawal requests
  const form = useForm<WithdrawalFormValues>({
    resolver: zodResolver(withdrawalFormSchema),
    defaultValues: {
      amount: "",
      accountName: "",
      accountNumber: "",
      bankName: "",
    },
  });
  
  // Mutation for submitting withdrawal requests
  const withdrawalMutation = useMutation({
    mutationFn: async (data: WithdrawalFormValues) => {
      // Make the API call to the backend
      const response = await apiRequest("POST", "/api/finance/withdraw", data);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to submit withdrawal request");
      }
      
      const result = await response.json();
      
      // Create a new withdrawal request for the UI display
      const newRequest: WithdrawalRequest = {
        id: withdrawalHistory.length + 1,
        amount: parseFloat(data.amount),
        status: 'pending',
        date: new Date(),
      };
      
      // Add to history 
      setWithdrawalHistory(prev => [newRequest, ...prev]);
      
      return result;
    },
    onSuccess: () => {
      toast({
        title: "Withdrawal request submitted",
        description: "Your request is being processed and will be reviewed shortly.",
      });
      form.reset();
      setIsWithdrawalDialogOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Withdrawal failed",
        description: error.message || "There was an error processing your withdrawal request. Please try again.",
        variant: "destructive",
      });
    }
  });
  
  const onSubmit = (data: WithdrawalFormValues) => {
    const availableBalance = totalRevenue * 0.85;
    const requestAmount = parseFloat(data.amount);
    
    if (requestAmount > availableBalance) {
      toast({
        title: "Insufficient funds",
        description: `You can withdraw a maximum of ${formatCurrency(availableBalance)}`,
        variant: "destructive",
      });
      return;
    }
    
    withdrawalMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      {/* Withdrawal request button */}
      <div className="flex justify-between items-center">
        <Button 
          onClick={() => setIsWithdrawalDialogOpen(true)} 
          className="bg-primary hover:bg-primary/90"
        >
          <Banknote className="mr-2 h-4 w-4" /> Request Withdrawal
        </Button>
        
        <div className="text-lg font-semibold text-primary">
          Financial Overview
        </div>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              From {filteredTickets.length} ticket sales
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available for Payout</CardTitle>
            <Banknote className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue * 0.85)}</div>
            <p className="text-xs text-muted-foreground">
              After platform fee (15%)
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredTickets.length}</div>
            <p className="text-xs text-muted-foreground">
              {Object.keys(ticketsByEvent).length} active events
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Revenue by event */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Event</CardTitle>
          <CardDescription>
            Breakdown of your event earnings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventRevenue.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Event</TableHead>
                  <TableHead>Tickets Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                  <TableHead>After Fees</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {eventRevenue.map(({ event, tickets, revenue }) => (
                  <TableRow key={event?.id}>
                    <TableCell className="font-medium">{event?.title}</TableCell>
                    <TableCell>{tickets.length}</TableCell>
                    <TableCell>{formatCurrency(revenue)}</TableCell>
                    <TableCell>{formatCurrency(revenue * 0.85)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No revenue data available for this period</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your most recent ticket sales
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredTickets.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Event</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTickets
                  .sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime())
                  .slice(0, 10) // Show only 10 most recent transactions
                  .map(ticket => {
                    const event = userEvents.find(e => e.id === ticket.eventId);
                    // Get user info
                    const userID = ticket.userId;
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>{formatDate(new Date(ticket.createdAt || ''))}</TableCell>
                        <TableCell className="font-medium">{event?.title}</TableCell>
                        <TableCell>User #{userID}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(ticket.totalAmount.toString() || '0'))}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={
                              ticket.paymentStatus === 'completed' 
                                ? 'text-green-500 flex items-center' 
                                : 'text-amber-500 flex items-center'
                            }>
                              {ticket.paymentStatus === 'completed' ? (
                                <>
                                  <ArrowUpRight className="mr-1 h-4 w-4" />
                                  Paid
                                </>
                              ) : (
                                <>
                                  <Clock className="mr-1 h-4 w-4" />
                                  Pending
                                </>
                              )}
                            </span>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No transactions available for this period</p>
            </div>
          )}
        </CardContent>
        <CardFooter className="justify-between border-t px-6 py-4">
          <p className="text-sm text-muted-foreground">
            Showing {Math.min(filteredTickets.length, 10)} of {filteredTickets.length} transactions
          </p>
          {filteredTickets.length > 0 && (
            <Button variant="outline" size="sm" className="ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Download CSV
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>
            Your withdrawal requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawalHistory.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawalHistory.map(withdrawal => (
                  <TableRow key={withdrawal.id}>
                    <TableCell>{formatDate(withdrawal.date)}</TableCell>
                    <TableCell>{formatCurrency(withdrawal.amount)}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <span className={
                          withdrawal.status === 'processed' 
                            ? 'text-green-500 flex items-center' 
                            : withdrawal.status === 'approved'
                              ? 'text-blue-500 flex items-center'
                              : withdrawal.status === 'rejected'
                                ? 'text-red-500 flex items-center'
                                : 'text-amber-500 flex items-center'
                        }>
                          {withdrawal.status === 'processed' ? (
                            <>
                              <ArrowUpRight className="mr-1 h-4 w-4" />
                              Processed
                            </>
                          ) : withdrawal.status === 'approved' ? (
                            <>
                              <Clock className="mr-1 h-4 w-4" />
                              Approved
                            </>
                          ) : withdrawal.status === 'rejected' ? (
                            <>
                              <AlertCircle className="mr-1 h-4 w-4" />
                              Rejected
                            </>
                          ) : (
                            <>
                              <Clock className="mr-1 h-4 w-4" />
                              Pending
                            </>
                          )}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No withdrawal requests yet</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Withdrawal Request Full Page */}
      {isWithdrawalDialogOpen && (
        <div className="fixed inset-0 bg-background z-50 overflow-y-auto">
          <div className="container mx-auto py-10 px-4 sm:px-6 max-w-4xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-bold">Request Withdrawal</h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setIsWithdrawalDialogOpen(false)}
                className="rounded-full"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            <div className="bg-card rounded-lg border p-6 shadow-sm">
              <p className="text-muted-foreground mb-8">
                Enter your bank details to request a withdrawal of your available funds directly to your account.
              </p>
              
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="amount"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel className="text-lg">Amount</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="0.00" 
                              {...field} 
                              type="number"
                              step="0.01"
                              min="50"
                              max={(totalRevenue * 0.85).toString()}
                              className="text-lg h-12"
                            />
                          </FormControl>
                          <FormDescription className="text-base">
                            Minimum withdrawal amount is R50. Available: {formatCurrency(totalRevenue * 0.85)}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="bankName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Bank Name</FormLabel>
                          <FormControl>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <SelectTrigger className="w-full h-12 text-base">
                                <SelectValue placeholder="Select your bank" />
                              </SelectTrigger>
                              <SelectContent className="max-h-[300px] overflow-y-auto">
                                {isLoadingBanks ? (
                                  <div className="flex items-center justify-center py-2">
                                    <span className="animate-spin mr-2">○</span> Loading banks...
                                  </div>
                                ) : banks.length > 0 ? (
                                  banks
                                    .sort((a: any, b: any) => a.name.localeCompare(b.name))
                                    .map((bank: any) => (
                                      <SelectItem key={bank.id} value={bank.name} className="text-base">
                                        {bank.name}
                                      </SelectItem>
                                    ))
                                ) : (
                                  <div className="p-2 text-center text-muted-foreground">
                                    No banks available. Please try again later.
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accountName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Account Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter account holder name" 
                              {...field} 
                              className="h-12 text-base" 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="accountNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-lg">Account Number</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your account number" 
                              {...field} 
                              className="h-12 text-base"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="flex items-center justify-end space-x-4 pt-6 mt-8 border-t">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsWithdrawalDialogOpen(false)}
                      className="h-12 px-6 text-base"
                    >
                      Cancel
                    </Button>
                    <Button
                      type="submit"
                      disabled={withdrawalMutation.isPending}
                      className="bg-primary hover:bg-primary/90 h-12 px-6 text-base"
                    >
                      {withdrawalMutation.isPending ? (
                        <>
                          <span className="animate-spin mr-2">○</span>
                          Processing...
                        </>
                      ) : (
                        "Request Withdrawal"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}