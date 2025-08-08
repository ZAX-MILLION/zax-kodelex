import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Users, Gift, Clock, Award } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { EnhancedSEOHelmet } from '@/components/EnhancedSEOHelmet';

interface Contest {
  id: string;
  title: string;
  description: string;
  start_date: string;
  end_date: string;
  reward_type: string;
  coin_reward: number;
  premium_days: number;
  max_winners: number;
  status: string;
  entry_requirements: any;
}

interface ContestEntry {
  id: string;
  contest_id: string;
  is_winner: boolean;
  reward_claimed: boolean;
  submitted_at: string;
  entry_data: any;
}

const Contests: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>([]);
  const [userEntries, setUserEntries] = useState<ContestEntry[]>([]);
  const [selectedContest, setSelectedContest] = useState<Contest | null>(null);
  const [entryText, setEntryText] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const { toast } = useToast();

  const fetchContests = async () => {
    try {
      const { data, error } = await supabase
        .from('contests')
        .select('*')
        .order('start_date', { ascending: false });

      if (error) throw error;
      setContests(data || []);
    } catch (error) {
      console.error('Error fetching contests:', error);
      toast({
        title: "Error",
        description: "Failed to load contests",
        variant: "destructive"
      });
    }
  };

  const fetchUserEntries = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('contest_entries')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setUserEntries(data || []);
    } catch (error) {
      console.error('Error fetching user entries:', error);
    }
  };

  const submitEntry = async () => {
    if (!selectedContest || !entryText.trim()) return;

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('contest_entries')
        .insert({
          contest_id: selectedContest.id,
          user_id: user.id,
          entry_data: { text: entryText.trim() }
        });

      if (error) throw error;

      toast({
        title: "Entry Submitted!",
        description: "Your contest entry has been submitted successfully."
      });

      setSelectedContest(null);
      setEntryText('');
      fetchUserEntries();
    } catch (error: any) {
      console.error('Error submitting entry:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to submit entry",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchContests(), fetchUserEntries()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'upcoming': return 'bg-blue-500';
      case 'ended': return 'bg-gray-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getRewardIcon = (rewardType: string) => {
    switch (rewardType) {
      case 'coins': return <Gift className="h-4 w-4" />;
      case 'premium': return <Award className="h-4 w-4" />;
      case 'badge': return <Trophy className="h-4 w-4" />;
      case 'early_access': return <Clock className="h-4 w-4" />;
      default: return <Gift className="h-4 w-4" />;
    }
  };

  const formatReward = (contest: Contest) => {
    switch (contest.reward_type) {
      case 'coins':
        return `${contest.coin_reward} coins`;
      case 'premium':
        return `${contest.premium_days} days premium`;
      case 'badge':
        return 'Special badge';
      case 'early_access':
        return 'Early chapter access';
      default:
        return 'Prize';
    }
  };

  const isUserEntered = (contestId: string) => {
    return userEntries.some(entry => entry.contest_id === contestId);
  };

  const getUserEntry = (contestId: string) => {
    return userEntries.find(entry => entry.contest_id === contestId);
  };

  const filterContests = (status: string) => {
    if (status === 'active') {
      return contests.filter(c => c.status === 'active');
    } else if (status === 'upcoming') {
      return contests.filter(c => c.status === 'upcoming');
    } else {
      return contests.filter(c => c.status === 'ended');
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="space-y-4">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-3 bg-muted rounded w-full"></div>
                <div className="h-3 bg-muted rounded w-2/3"></div>
                <div className="h-8 bg-muted rounded"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <>
      <EnhancedSEOHelmet
        title="Contests - Win Coins & Prizes | Manga Reader"
        description="Participate in exciting contests to win coins, premium access, and exclusive rewards. Join the manga community competitions!"
        keywords="manga contests, win coins, manga prizes, community competitions"
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-4">
            <Trophy className="h-8 w-8 inline-block mr-2 text-yellow-500" />
            Contests & Competitions
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Participate in exciting contests to win coins, premium access, and exclusive rewards. 
            Show your manga knowledge and creativity!
          </p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="active">Active ({filterContests('active').length})</TabsTrigger>
            <TabsTrigger value="upcoming">Upcoming ({filterContests('upcoming').length})</TabsTrigger>
            <TabsTrigger value="ended">Ended ({filterContests('ended').length})</TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterContests('active').map((contest) => {
                const userEntry = getUserEntry(contest.id);
                return (
                  <Card key={contest.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold">{contest.title}</h3>
                        <Badge className={`${getStatusColor(contest.status)} text-white`}>
                          {contest.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {contest.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Ends: {new Date(contest.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRewardIcon(contest.reward_type)}
                          <span>Reward: {formatReward(contest)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="h-4 w-4" />
                          <span>Max Winners: {contest.max_winners}</span>
                        </div>
                      </div>

                      {userEntry ? (
                        <div className="space-y-2">
                          <Badge variant={userEntry.is_winner ? 'default' : 'secondary'} className="w-full justify-center">
                            {userEntry.is_winner ? (
                              <>
                                <Trophy className="h-4 w-4 mr-1" />
                                Winner!
                              </>
                            ) : (
                              'Entry Submitted'
                            )}
                          </Badge>
                          {userEntry.is_winner && !userEntry.reward_claimed && (
                            <Badge variant="outline" className="w-full justify-center">
                              Reward Pending
                            </Badge>
                          )}
                        </div>
                      ) : (
                        <Button 
                          className="w-full" 
                          onClick={() => setSelectedContest(contest)}
                        >
                          Enter Contest
                        </Button>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
            
            {filterContests('active').length === 0 && (
              <div className="text-center py-12">
                <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Contests</h3>
                <p className="text-muted-foreground">Check back soon for new contests!</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="upcoming" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterContests('upcoming').map((contest) => (
                <Card key={contest.id} className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start justify-between">
                      <h3 className="text-lg font-semibold">{contest.title}</h3>
                      <Badge className={`${getStatusColor(contest.status)} text-white`}>
                        {contest.status}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {contest.description}
                    </p>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>Starts: {new Date(contest.start_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {getRewardIcon(contest.reward_type)}
                        <span>Reward: {formatReward(contest)}</span>
                      </div>
                    </div>

                    <Button disabled className="w-full">
                      <Clock className="h-4 w-4 mr-2" />
                      Coming Soon
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="ended" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filterContests('ended').map((contest) => {
                const userEntry = getUserEntry(contest.id);
                return (
                  <Card key={contest.id} className="p-6 opacity-75">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <h3 className="text-lg font-semibold">{contest.title}</h3>
                        <Badge className={`${getStatusColor(contest.status)} text-white`}>
                          {contest.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {contest.description}
                      </p>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          <span>Ended: {new Date(contest.end_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getRewardIcon(contest.reward_type)}
                          <span>Reward: {formatReward(contest)}</span>
                        </div>
                      </div>

                      {userEntry && (
                        <Badge variant={userEntry.is_winner ? 'default' : 'secondary'} className="w-full justify-center">
                          {userEntry.is_winner ? (
                            <>
                              <Trophy className="h-4 w-4 mr-1" />
                              You Won!
                            </>
                          ) : (
                            'Participated'
                          )}
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>

        {/* Contest Entry Modal */}
        <Dialog open={!!selectedContest} onOpenChange={() => setSelectedContest(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Enter Contest</DialogTitle>
              <DialogDescription>
                {selectedContest?.title}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm">{selectedContest?.description}</p>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Your Entry</label>
                <Textarea
                  placeholder="Write your contest entry here..."
                  value={entryText}
                  onChange={(e) => setEntryText(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedContest(null)}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={submitEntry}
                  disabled={submitting || !entryText.trim()}
                >
                  {submitting ? 'Submitting...' : 'Submit Entry'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Contests;