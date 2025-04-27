import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  CreditCard, DollarSign, RefreshCw, TrendingUp, 
  BarChart2, Calendar, Clock, ArrowUp, ArrowDown 
} from 'lucide-react';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';

interface FinanceViewProps {
  userId: number;
}

interface FinanceStats {
  totalRevenue: number;
  pendingPayouts: number;
  completedPayouts: number;
  ticketsSold: number;
  events: {
    id: number;
    title: string;
    date: string;
    revenue: number;
    ticketsSold: number;
  }[];
  recentTransactions: {
    id: number;
    date: string;
    amount: number;
    type: 'payout' | 'sale';
    status: 'completed' | 'pending' | 'failed';
    description: string;
  }[];
}

export default function FinanceView({ userId }: FinanceViewProps) {
  const { toast } = useToast();
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewPeriod, setViewPeriod] = useState<'all' | 'month' | 'week'>('all');

  // Fetch finance data
  const { data: financeData, isLoading } = useQuery({
    queryKey: [`/api/users/${userId}/finance`, viewPeriod, refreshKey],
    queryFn: async () => {
      try {
        // Simulating API call for now
        // In production, this would be a real API call to the backend
        // const response = await apiRequest('GET', `/api/users/${userId}/finance?period=${viewPeriod}`);
        // return response.json();
        
        // For now, calculate finance data from tickets
        const ticketsResponse = await apiRequest('GET', '/api/users/tickets');
        const tickets = await ticketsResponse.json();
        
        const eventsResponse = await apiRequest('GET', `/api/users/${userId}/events`);
        const events = await eventsResponse.json();
        
        // Calculate finance stats
        const stats: FinanceStats = {
          totalRevenue: 0,
          pendingPayouts: 0,
          completedPayouts: 0,
          ticketsSold: 0,
          events: [],
          recentTransactions: []
        };
        
        // Process event tickets
        const eventTicketMap = new Map();
        
        // Only count completed tickets
        const completedTickets = tickets.filter((ticket: any) => 
          ticket.paymentStatus === 'completed' && events.some((e: any) => e.id === ticket.eventId)
        );
        
        completedTickets.forEach((ticket: any) => {
          const eventId = ticket.eventId;
          stats.totalRevenue += ticket.totalAmount;
          stats.ticketsSold += ticket.quantity || 1;
          
          // Track per-event metrics
          if (!eventTicketMap.has(eventId)) {
            const event = events.find((e: any) => e.id === eventId);
            if (event) {
              eventTicketMap.set(eventId, {
                id: eventId,
                title: event.title,
                date: event.date,
                revenue: 0,
                ticketsSold: 0
              });
            }
          }
          
          if (eventTicketMap.has(eventId)) {
            const eventStats = eventTicketMap.get(eventId);
            eventStats.revenue += ticket.totalAmount;
            eventStats.ticketsSold += ticket.quantity || 1;
            eventTicketMap.set(eventId, eventStats);
          }
          
          // Add to transactions
          stats.recentTransactions.push({
            id: ticket.id,
            date: ticket.purchaseDate || ticket.createdAt,
            amount: ticket.totalAmount,
            type: 'sale',
            status: 'completed',
            description: `Ticket sale for ${ticket.event?.title || 'Unknown Event'}`
          });
        });
        
        // Sort transactions by date (newest first)
        stats.recentTransactions.sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        // Set events data
        stats.events = Array.from(eventTicketMap.values());
        
        // Simulate pending payouts as 20% of revenue not yet paid out
        stats.pendingPayouts = Math.round(stats.totalRevenue * 0.2 * 100) / 100;
        stats.completedPayouts = Math.round((stats.totalRevenue - stats.pendingPayouts) * 100) / 100;
        
        return stats;
      } catch (error) {
        console.error('Error fetching finance data:', error);
        toast({
          title: 'Failed to load financial data',
          description: 'Please try again later.',
          variant: 'destructive'
        });
        return null;
      }
    }
  });

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'Refreshing financial data',
      description: 'Your financial overview is being updated.',
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      minimumFractionDigits: 2
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Format percentage change (dummy for now)
  const getPercentageChange = () => {
    return { value: 12.5, increase: true };
  };

  if (isLoading || !financeData) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex justify-center items-center min-h-[300px]">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Financial Overview</h2>
        <div className="flex items-center space-x-2">
          <TabsList>
            <TabsTrigger 
              value="all" 
              onClick={() => setViewPeriod('all')}
              className={viewPeriod === 'all' ? 'bg-primary text-primary-foreground' : ''}
            >
              All Time
            </TabsTrigger>
            <TabsTrigger 
              value="month" 
              onClick={() => setViewPeriod('month')}
              className={viewPeriod === 'month' ? 'bg-primary text-primary-foreground' : ''}
            >
              This Month
            </TabsTrigger>
            <TabsTrigger 
              value="week" 
              onClick={() => setViewPeriod('week')}
              className={viewPeriod === 'week' ? 'bg-primary text-primary-foreground' : ''}
            >
              This Week
            </TabsTrigger>
          </TabsList>
          <button 
            onClick={handleRefresh}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            title="Refresh data"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-purple-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <DollarSign className="h-5 w-5 text-purple-500 mr-2" />
                <div className="text-2xl font-bold">{formatCurrency(financeData.totalRevenue)}</div>
              </div>
              <div className="flex items-center text-xs">
                {getPercentageChange().increase ? (
                  <ArrowUp className="h-3 w-3 text-green-500 mr-1" />
                ) : (
                  <ArrowDown className="h-3 w-3 text-red-500 mr-1" />
                )}
                <span className={getPercentageChange().increase ? 'text-green-500' : 'text-red-500'}>
                  {getPercentageChange().value}%
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Available for Payout
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <CreditCard className="h-5 w-5 text-green-500 mr-2" />
                <div className="text-2xl font-bold">{formatCurrency(financeData.pendingPayouts)}</div>
              </div>
              <div>
                <button className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">
                  Request Payout
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-white">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tickets Sold
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <BarChart2 className="h-5 w-5 text-blue-500 mr-2" />
                <div className="text-2xl font-bold">{financeData.ticketsSold}</div>
              </div>
              <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                {financeData.events.length} Events
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Event revenue breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Event Revenue</CardTitle>
          <CardDescription>
            Breakdown of revenue by event
          </CardDescription>
        </CardHeader>
        <CardContent>
          {financeData.events.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No revenue data available for your events.
            </div>
          ) : (
            <div className="space-y-4">
              {financeData.events.map((event) => (
                <div key={event.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div className="space-y-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span>{formatDate(event.date)}</span>
                      <span className="mx-2">•</span>
                      <span>{event.ticketsSold} tickets sold</span>
                    </div>
                  </div>
                  <div className="font-semibold">{formatCurrency(event.revenue)}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent transactions */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
          <CardDescription>
            Your most recent financial transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          {financeData.recentTransactions.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No transaction data available yet.
            </div>
          ) : (
            <div className="space-y-4">
              {financeData.recentTransactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between pb-4 border-b last:border-b-0">
                  <div className="space-y-1">
                    <div className="font-medium">{transaction.description}</div>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1" />
                      <span>{formatDate(transaction.date)}</span>
                      <span className="mx-2">•</span>
                      <span className={`uppercase ${
                        transaction.status === 'completed' ? 'text-green-600' : 
                        transaction.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                      }`}>
                        {transaction.status}
                      </span>
                    </div>
                  </div>
                  <div className={`font-semibold ${transaction.type === 'sale' ? 'text-green-600' : 'text-blue-600'}`}>
                    {transaction.type === 'sale' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}