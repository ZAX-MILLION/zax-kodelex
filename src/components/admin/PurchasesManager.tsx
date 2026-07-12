import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Download, Eye, RefreshCw, Search, DollarSign, Users, FileText } from 'lucide-react';

interface Purchase {
  id: string;
  amount: number;
  currency: string;
  status: string;
  payment_method: string;
  created_at: string;
  customer: {
    email: string;
    first_name: string;
    last_name: string;
    company: string;
  };
  license: {
    license_key: string;
    license_type: string;
    domains_allowed: number;
  } | null;
}

interface PurchaseStats {
  totalPurchases: number;
  totalRevenue: number;
  completedPurchases: number;
  pendingPurchases: number;
}

const PurchasesManager = () => {
  const { toast } = useToast();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [stats, setStats] = useState<PurchaseStats>({
    totalPurchases: 0,
    totalRevenue: 0,
    completedPurchases: 0,
    pendingPurchases: 0
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchPurchases();
    fetchStats();
  }, []);

  const fetchPurchases = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select(`
          *,
          customer:customers(
            email,
            first_name,
            last_name,
            company
          ),
          license:licenses!purchases_license_id_fkey(
            license_key,
            license_type,
            domains_allowed
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPurchases(data || []);
    } catch (error) {
      console.error('Error fetching purchases:', error);
      toast({
        title: "Error",
        description: "Failed to fetch purchases",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const { data, error } = await supabase
        .from('purchases')
        .select('amount, status');

      if (error) throw error;

      const stats = (data || []).reduce((acc, purchase) => {
        acc.totalPurchases++;
        if (purchase.status === 'completed') {
          acc.completedPurchases++;
          acc.totalRevenue += Number(purchase.amount);
        } else if (purchase.status === 'pending') {
          acc.pendingPurchases++;
        }
        return acc;
      }, {
        totalPurchases: 0,
        totalRevenue: 0,
        completedPurchases: 0,
        pendingPurchases: 0
      });

      setStats(stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const updatePurchaseStatus = async (purchaseId: string, newStatus: 'completed' | 'pending' | 'failed' | 'refunded') => {
    try {
      const { error } = await supabase
        .from('purchases')
        .update({ status: newStatus })
        .eq('id', purchaseId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Purchase status updated successfully",
      });

      fetchPurchases();
      fetchStats();
    } catch (error) {
      console.error('Error updating purchase:', error);
      toast({
        title: "Error",
        description: "Failed to update purchase status",
        variant: "destructive",
      });
    }
  };

  const exportPurchases = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "ID,Customer Email,Name,Amount,Currency,Status,Payment Method,License Key,License Type,Date\n" +
      purchases.map(purchase => {
        const customerName = `${purchase.customer?.first_name || ''} ${purchase.customer?.last_name || ''}`.trim();
        return [
          purchase.id,
          purchase.customer?.email || '',
          customerName,
          purchase.amount,
          purchase.currency,
          purchase.status,
          purchase.payment_method || '',
          purchase.license?.license_key || '',
          purchase.license?.license_type || '',
          new Date(purchase.created_at).toLocaleDateString()
        ].join(',');
      }).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `purchases_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast({
      title: "Export Complete",
      description: "Purchases data has been exported to CSV",
    });
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = searchTerm === '' || 
      purchase.customer?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.customer?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.customer?.last_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.license?.license_key?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <FileText className="h-8 w-8 text-blue-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Purchases</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPurchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <DollarSign className="h-8 w-8 text-green-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Revenue</p>
                <p className="text-2xl font-bold text-gray-900">${stats.totalRevenue}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-purple-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-gray-900">{stats.completedPurchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <RefreshCw className="h-8 w-8 text-orange-600" />
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPurchases}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Management</CardTitle>
          <CardDescription>
            Manage all purchases, license keys, and customer information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search by customer email, name, or license key..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
            <Button onClick={exportPurchases} variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button onClick={fetchPurchases} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          {/* Purchases Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>License</TableHead>
                  <TableHead>Payment Method</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPurchases.map((purchase) => (
                  <TableRow key={purchase.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {purchase.customer?.first_name} {purchase.customer?.last_name}
                        </div>
                        <div className="text-sm text-gray-500">{purchase.customer?.email}</div>
                        {purchase.customer?.company && (
                          <div className="text-xs text-gray-400">{purchase.customer.company}</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        ${purchase.amount} {purchase.currency}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(purchase.status)}>
                        {purchase.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {purchase.license ? (
                        <div>
                          <div className="font-mono text-xs">
                            {purchase.license.license_key}
                          </div>
                          <div className="text-xs text-gray-500">
                            {purchase.license.license_type} ({purchase.license.domains_allowed === 999 ? 'Unlimited' : purchase.license.domains_allowed} domains)
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-400">No license</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">{purchase.payment_method || 'N/A'}</span>
                    </TableCell>
                    <TableCell>
                      {new Date(purchase.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {purchase.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => updatePurchaseStatus(purchase.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        {purchase.status === 'completed' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updatePurchaseStatus(purchase.id, 'refunded')}
                          >
                            Refund
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {filteredPurchases.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No purchases found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PurchasesManager;