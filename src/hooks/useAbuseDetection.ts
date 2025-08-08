import { useState, useEffect } from 'react';
import { AbuseFlag, UserActivitySummary } from '@/types/analytics';
import { useAuth } from '@/contexts/AuthContext';

// Mock data for demonstration since we don't have real tables
const generateMockAbuseFlags = (): AbuseFlag[] => [
  {
    id: '1',
    user_id: 'user123',
    ip_address: '192.168.1.100',
    flag_type: 'excessive_downloads',
    severity: 'high',
    description: 'User downloaded 50+ chapters in 1 hour',
    metadata: { download_count: 52, time_window: '1h' },
    status: 'active',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '2',
    user_id: 'user456',
    flag_type: 'suspicious_coins',
    severity: 'critical',
    description: 'Unusual coin balance increase without transaction',
    metadata: { balance_change: 1000, expected: 0 },
    status: 'investigating',
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
  },
  {
    id: '3',
    ip_address: '10.0.0.50',
    flag_type: 'multiple_accounts',
    severity: 'medium',
    description: 'Same IP created 5+ accounts in 24h',
    metadata: { account_count: 7, time_window: '24h' },
    status: 'active',
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString()
  }
];

const generateMockUserActivity = (): UserActivitySummary[] => [
  {
    user_id: '1',
    email: 'admin@test.com',
    username: 'admin',
    total_reads: 245,
    total_downloads: 12,
    coins_spent: 150,
    subscription_status: 'premium',
    last_activity: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    suspicious_flags: 0,
    account_status: 'active',
    signup_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: '2',
    email: 'user@test.com',
    username: 'testuser',
    total_reads: 89,
    total_downloads: 45,
    coins_spent: 320,
    subscription_status: 'free',
    last_activity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    suspicious_flags: 2,
    account_status: 'active',
    signup_date: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
  },
  {
    user_id: '3',
    email: 'suspicious@example.com',
    username: 'poweruser',
    total_reads: 1250,
    total_downloads: 380,
    coins_spent: 50,
    subscription_status: 'free',
    last_activity: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
    suspicious_flags: 5,
    account_status: 'suspended',
    signup_date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
  }
];

export const useAbuseDetection = () => {
  const { user, userProfile } = useAuth();
  const [abuseFlags, setAbuseFlags] = useState<AbuseFlag[]>([]);
  const [userActivity, setUserActivity] = useState<UserActivitySummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    setTimeout(() => {
      setAbuseFlags(generateMockAbuseFlags());
      setUserActivity(generateMockUserActivity());
      setLoading(false);
    }, 1000);
  }, []);

  const flagUser = async (
    userId: string, 
    flagType: AbuseFlag['flag_type'],
    severity: AbuseFlag['severity'],
    description: string,
    metadata?: Record<string, any>
  ) => {
    const newFlag: AbuseFlag = {
      id: Date.now().toString(),
      user_id: userId,
      flag_type: flagType,
      severity,
      description,
      metadata,
      status: 'active',
      flagged_by: user?.id,
      created_at: new Date().toISOString()
    };

    setAbuseFlags(prev => [newFlag, ...prev]);
    
    console.log('🚨 User flagged:', {
      userId,
      type: flagType,
      severity,
      flaggedBy: userProfile?.email
    });

    return newFlag;
  };

  const resolveFlag = async (flagId: string, resolution: string) => {
    setAbuseFlags(prev => prev.map(flag => 
      flag.id === flagId 
        ? { 
            ...flag, 
            status: 'resolved', 
            resolved_by: user?.id,
            resolution_note: resolution,
            resolved_at: new Date().toISOString()
          }
        : flag
    ));

    console.log('✅ Flag resolved:', { flagId, resolution });
  };

  const dismissFlag = async (flagId: string, reason: string) => {
    setAbuseFlags(prev => prev.map(flag => 
      flag.id === flagId 
        ? { 
            ...flag, 
            status: 'dismissed', 
            resolved_by: user?.id,
            resolution_note: reason,
            resolved_at: new Date().toISOString()
          }
        : flag
    ));

    console.log('❌ Flag dismissed:', { flagId, reason });
  };

  const suspendUser = async (userId: string, reason: string) => {
    setUserActivity(prev => prev.map(user => 
      user.user_id === userId 
        ? { ...user, account_status: 'suspended' }
        : user
    ));

    console.log('⛔ User suspended:', { userId, reason });
  };

  const banUser = async (userId: string, reason: string) => {
    setUserActivity(prev => prev.map(user => 
      user.user_id === userId 
        ? { ...user, account_status: 'banned' }
        : user
    ));

    console.log('🔨 User banned:', { userId, reason });
  };

  const activateUser = async (userId: string) => {
    setUserActivity(prev => prev.map(user => 
      user.user_id === userId 
        ? { ...user, account_status: 'active' }
        : user
    ));

    console.log('✅ User reactivated:', { userId });
  };

  // Auto-detection functions (would run on server in real implementation)
  const detectExcessiveDownloads = (userId: string, downloadsInHour: number) => {
    if (downloadsInHour > 30) {
      flagUser(
        userId,
        'excessive_downloads',
        downloadsInHour > 50 ? 'critical' : 'high',
        `User downloaded ${downloadsInHour} chapters in 1 hour`,
        { download_count: downloadsInHour, time_window: '1h' }
      );
    }
  };

  const detectSuspiciousCoins = (userId: string, unexpectedIncrease: number) => {
    if (unexpectedIncrease > 500) {
      flagUser(
        userId,
        'suspicious_coins',
        'critical',
        `Unexpected coin balance increase of ${unexpectedIncrease}`,
        { balance_change: unexpectedIncrease }
      );
    }
  };

  const activeFlags = abuseFlags.filter(flag => flag.status === 'active');
  const criticalFlags = abuseFlags.filter(flag => flag.severity === 'critical' && flag.status === 'active');

  return {
    abuseFlags,
    userActivity,
    activeFlags,
    criticalFlags,
    loading,
    flagUser,
    resolveFlag,
    dismissFlag,
    suspendUser,
    banUser,
    activateUser,
    detectExcessiveDownloads,
    detectSuspiciousCoins
  };
};