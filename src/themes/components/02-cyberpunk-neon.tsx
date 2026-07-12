import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Zap, Clock, TrendingUp } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export const CyberpunkNeonHomepage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      {/* Animated Background Grid */}
      <div className="fixed inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-accent/20" />
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNlMTFkNDgiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMjAgMjBjMC0xMS4wNDYtOC45NTQtMjAtMjAtMjB2MjBoMjB6bTAgMHYyMGgyMGMwLTExLjA0Ni04Ljk1NC0yMC0yMC0yMHoiLz48L2c+PC9nPjwvc3ZnPg==')] animate-pulse" />
      </div>

      {/* Hero Section */}
      <section className="relative z-10 py-20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-2">
                  <Zap className="h-4 w-4 mr-2" />
                  Latest Chapter Released
                </Badge>
                <h1 className="text-6xl font-bold leading-tight">
                  <span className="bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                    Digital
                  </span>
                  <br />
                  <span className="text-foreground">Rebellion</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-lg">
                  Enter a world where technology and humanity collide. Follow the journey through neon-lit streets and digital landscapes.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/80 hover:to-accent/80 text-white px-8 py-3">
                  Start Reading
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
                <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10">
                  View Trailer
                </Button>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">42</div>
                  <div className="text-sm text-muted-foreground">Chapters</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-accent">1.2M</div>
                  <div className="text-sm text-muted-foreground">Readers</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary">4.9</div>
                  <div className="text-sm text-muted-foreground">Rating</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/50 to-accent/50 rounded-2xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity duration-300" />
                <img 
                  src={heroBg} 
                  alt="Digital Rebellion Cover" 
                  className="relative w-full max-w-md mx-auto rounded-2xl border-2 border-primary/30 shadow-2xl transform group-hover:scale-105 transition-transform duration-300"
                />
                <div className="absolute top-4 right-4 bg-primary/90 text-white px-3 py-1 rounded-full text-sm font-medium">
                  NEW
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Latest Chapters */}
      <section className="relative z-10 py-20 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <h2 className="text-4xl font-bold text-foreground mb-2">Latest Chapters</h2>
              <p className="text-muted-foreground">Stay updated with the newest releases</p>
            </div>
            <Button variant="outline" className="border-primary/50 hover:bg-primary/10">
              View All
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((chapter) => (
              <Card key={chapter} className="bg-background/80 border-primary/20 hover:border-primary/50 transition-all duration-300 group cursor-pointer backdrop-blur-sm">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <Badge variant="outline" className="border-primary/50 text-primary">
                      Chapter {42 - chapter + 1}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      2 days ago
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold mb-2 group-hover:text-primary transition-colors">
                    The Digital Awakening
                  </h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    As the neon lights flicker in the digital rain, our hero discovers the truth behind the virtual reality that imprisons humanity.
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <TrendingUp className="h-4 w-4 mr-1" />
                      15.2k views
                    </div>
                    <ChevronRight className="h-5 w-5 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-primary/20 bg-background/90 backdrop-blur-md py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-md flex items-center justify-center">
                  <Zap className="h-4 w-4 text-white" />
                </div>
                <span className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  NEXUS
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                Experience the future of digital storytelling in our cyberpunk universe.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <Link to="/chapters" className="text-muted-foreground hover:text-primary transition-colors block">
                  All Chapters
                </Link>
                <Link to="/profile" className="text-muted-foreground hover:text-primary transition-colors block">
                  My Profile
                </Link>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Community</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  Discord
                </a>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  Twitter
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <div className="space-y-2 text-sm">
                <Link to="/support" className="text-muted-foreground hover:text-primary transition-colors block">
                  Contact Us
                </Link>
                <a href="#" className="text-muted-foreground hover:text-primary transition-colors block">
                  FAQ
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-primary/20 mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 NEXUS. All rights reserved. Powered by the future.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};