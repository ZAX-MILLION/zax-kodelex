import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, MessageCircle, Heart, Trophy, Calendar, ArrowRight, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const CommunityPage = () => {
  const communityStats = [
    { label: 'Active Members', value: '15,420', icon: Users },
    { label: 'Daily Messages', value: '2,341', icon: MessageCircle },
    { label: 'Series Discussed', value: '1,256', icon: Heart },
    { label: 'Events This Month', value: '12', icon: Calendar },
  ];

  const forumCategories = [
    {
      title: 'General Discussion',
      description: 'Chat about manga, anime, and everything in between',
      posts: 1234,
      topics: 89,
      color: 'bg-blue-500'
    },
    {
      title: 'Series Recommendations',
      description: 'Discover new manga and share your favorites',
      posts: 892,
      topics: 156,
      color: 'bg-green-500'
    },
    {
      title: 'Chapter Discussions',
      description: 'Discuss the latest chapters and plot developments',
      posts: 2341,
      topics: 234,
      color: 'bg-purple-500'
    },
    {
      title: 'Fan Art & Creations',
      description: 'Share your artwork and creative content',
      posts: 567,
      topics: 78,
      color: 'bg-pink-500'
    },
    {
      title: 'Technical Support',
      description: 'Get help with the platform and report issues',
      posts: 234,
      topics: 45,
      color: 'bg-orange-500'
    },
    {
      title: 'Site Suggestions',
      description: 'Propose new features and improvements',
      posts: 123,
      topics: 23,
      color: 'bg-yellow-500'
    }
  ];

  const upcomingEvents = [
    {
      title: 'Weekly Manga Discussion',
      date: 'Every Sunday',
      description: 'Join us for our weekly manga discussion thread',
      type: 'Recurring'
    },
    {
      title: 'Fan Art Contest',
      date: 'Feb 15 - Mar 15',
      description: 'Submit your best manga-inspired artwork',
      type: 'Contest'
    },
    {
      title: 'Author Q&A Session',
      date: 'March 5, 2024',
      description: 'Live Q&A with featured manga creators',
      type: 'Special Event'
    }
  ];

  const discordChannels = [
    { name: 'general-chat', description: 'Main community chat', members: 1240 },
    { name: 'manga-talk', description: 'Discuss your favorite series', members: 980 },
    { name: 'chapter-spoilers', description: 'Latest chapter discussions', members: 756 },
    { name: 'recommendations', description: 'Get and share recommendations', members: 643 },
    { name: 'fan-creations', description: 'Share your art and stories', members: 432 },
  ];

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Community</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Join thousands of manga enthusiasts in our vibrant community. 
              Share discussions, get recommendations, and connect with fellow readers.
            </p>
          </div>

          {/* Community Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {communityStats.map((stat) => (
              <Card key={stat.label}>
                <CardContent className="p-4 text-center">
                  <div className="flex flex-col items-center space-y-2">
                    <stat.icon className="h-8 w-8 text-primary" />
                    <div className="text-2xl font-bold">{stat.value}</div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-500 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Join Our Discord</CardTitle>
                    <CardDescription>Real-time chat with the community</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Connect instantly with other manga fans, get real-time updates, and participate in live discussions.
                </p>
                <Button asChild className="w-full">
                  <a href="https://discord.gg/kodelex" target="_blank" rel="noopener noreferrer">
                    Join Discord Server
                    <ExternalLink className="h-4 w-4 ml-2" />
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-blue-500/10" />
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-500 rounded-lg">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <CardTitle>Forum Discussions</CardTitle>
                    <CardDescription>In-depth conversations and topics</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  Participate in detailed discussions, share theories, and connect with like-minded readers.
                </p>
                <Button variant="outline" className="w-full">
                  Browse Forums
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Forum Categories */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Forum Categories</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {forumCategories.map((category) => (
                <Card key={category.title} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded-full ${category.color}`} />
                      <CardTitle className="text-lg">{category.title}</CardTitle>
                    </div>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{category.topics} topics</span>
                      <span>{category.posts} posts</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Discord Channels Preview */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Popular Discord Channels</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {discordChannels.map((channel) => (
                <Card key={channel.name}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">#{channel.name}</div>
                        <div className="text-sm text-muted-foreground">{channel.description}</div>
                      </div>
                      <Badge variant="secondary">{channel.members} members</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Upcoming Events</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event.title}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">{event.type}</Badge>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <CardTitle className="text-lg">{event.title}</CardTitle>
                    <CardDescription>{event.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{event.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Community Guidelines */}
          <Card>
            <CardHeader>
              <CardTitle>Community Guidelines</CardTitle>
              <CardDescription>
                Help us maintain a friendly and welcoming environment for everyone
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-3 text-green-600">Do:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Be respectful and kind to all members</li>
                    <li>• Use spoiler tags for recent chapters</li>
                    <li>• Search before posting duplicate topics</li>
                    <li>• Share constructive feedback and opinions</li>
                    <li>• Help newcomers and answer questions</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-3 text-red-600">Don't:</h4>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    <li>• Share pirated content or illegal links</li>
                    <li>• Engage in harassment or toxic behavior</li>
                    <li>• Spam or post irrelevant content</li>
                    <li>• Share personal information publicly</li>
                    <li>• Post NSFW content outside designated areas</li>
                  </ul>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    Questions about the guidelines?
                  </span>
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/contact">Contact Moderators</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CommunityPage;