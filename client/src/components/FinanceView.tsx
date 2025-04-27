import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  ChevronDown, 
  Download, 
  Banknote, 
  ArrowUpRight, 
  Clock,
  CreditCard,
  DollarSign,
  Users,
  LineChart
} from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Event, EventTicket } from '@shared/schema';

interface FinanceViewProps {
  userId: number;
}

export default function FinanceView({ userId }: FinanceViewProps) {
  const [period, setPeriod] = useState('all'); // 'all', 'month', 'week'

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
    ticket.status === 'completed' && 
    userEvents.some(event => event.id === ticket.eventId)
  );

  // Filter based on period
  const getPeriodDate = () => {
    const now = new Date();
    if (period === 'week') {
      const weekAgo = new Date();
      weekAgo.setDate(now.getDate() - 7);
      return weekAgo;
    } else if (period === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(now.getMonth() - 1);
      return monthAgo;
    }
    return new Date(0); // Beginning of time for 'all'
  };

  const periodDate = getPeriodDate();
  
  const filteredTickets = completedTickets.filter(ticket => {
    if (period === 'all') return true;
    const ticketDate = new Date(ticket.updatedAt || ticket.createdAt);
    return ticketDate >= periodDate;
  });

  // Calculate revenue statistics
  const totalRevenue = filteredTickets.reduce(
    (sum, ticket) => sum + parseFloat(ticket.amount.toString() || '0'), 
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
    acc[eventId].revenue += parseFloat(ticket.amount.toString() || '0');
    return acc;
  }, {} as Record<number, { event: Event | undefined, tickets: EventTicket[], revenue: number }>);

  const eventRevenue = Object.values(ticketsByEvent)
    .filter(item => item.event) // Filter out events that might not exist
    .sort((a, b) => b.revenue - a.revenue); // Sort by revenue (highest first)

  return (
    <div className="space-y-6">
      {/* Period selection */}
      <div className="flex justify-end">
        <Tabs value={period} onValueChange={setPeriod} className="w-[400px]">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">All Time</TabsTrigger>
            <TabsTrigger value="month">This Month</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
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
                    return (
                      <TableRow key={ticket.id}>
                        <TableCell>{formatDate(new Date(ticket.createdAt || ''))}</TableCell>
                        <TableCell className="font-medium">{event?.title}</TableCell>
                        <TableCell>{ticket.userEmail}</TableCell>
                        <TableCell>{formatCurrency(parseFloat(ticket.amount.toString() || '0'))}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <span className={
                              ticket.status === 'completed' 
                                ? 'text-green-500 flex items-center' 
                                : 'text-amber-500 flex items-center'
                            }>
                              {ticket.status === 'completed' ? (
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
    </div>
  );
}