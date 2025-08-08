import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Circle, BookOpen, Clock } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export const ZenMinimalistHomepage = () => {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Clean Header */}
      <header className="border-b border-border/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Circle className="h-8 w-8 text-primary" />
              <span className="text-2xl font-light tracking-wide">ZEN</span>
            </div>
            
            <nav className="hidden md:flex items-center space-x-12">
              <Link to="/chapters" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                CHAPTERS
              </Link>
              <Link to="/profile" className="text-muted-foreground hover:text-foreground transition-colors text-sm font-medium">
                PROFILE
              </Link>
              <Button variant="ghost" size="sm" className="font-medium">
                SIGN IN
              </Button>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-12">
            <div className="space-y-8">
              <Badge variant="outline" className="px-6 py-2 rounded-full border-primary/30 text-primary">
                New Chapter Available
              </Badge>
              
              <h1 className="text-6xl md:text-8xl font-extralight tracking-tight leading-none">
                <span className="text-primary">Silent</span>
                <br />
                <span className="text-muted-foreground">Wisdom</span>
              </h1>
              
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto font-light leading-relaxed">
                A contemplative journey through ancient philosophy and modern mindfulness. 
                Discover inner peace through timeless wisdom.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-full px-12 py-4">
                Begin Reading
                <ArrowRight className="ml-3 h-5 w-5" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full px-12 py-4">
                Learn More
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="py-24 bg-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <div className="space-y-6">
                <h2 className="text-4xl font-light text-foreground">
                  Chapter 23
                  <br />
                  <span className="text-muted-foreground">The Path of Acceptance</span>
                </h2>
                <p className="text-lg text-muted-foreground font-light leading-relaxed">
                  In this chapter, we explore the delicate balance between effort and surrender, 
                  learning to find peace in the present moment while remaining open to growth.
                </p>
              </div>
              
              <div className="flex items-center space-x-8 text-sm text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>15 min read</span>
                </div>
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-4 w-4" />
                  <span>Philosophy</span>
                </div>
              </div>
              
              <Button variant="ghost" className="text-primary hover:text-primary/80 p-0 h-auto font-medium">
                Read Chapter
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            <div className="relative">
              <div className="aspect-[4/5] relative">
                <img 
                  src={heroBg} 
                  alt="Silent Wisdom" 
                  className="w-full h-full object-cover rounded-2xl shadow-xl"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent rounded-2xl" />
                <div className="absolute bottom-8 left-8 right-8">
                  <Badge className="bg-background/90 text-foreground border-0 mb-3">
                    Latest
                  </Badge>
                  <h3 className="text-2xl font-light text-white mb-2">The Art of Letting Go</h3>
                  <p className="text-white/80 text-sm font-light">
                    Embracing impermanence as a path to freedom
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Chapter Grid */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-light text-foreground mb-4">Recent Chapters</h2>
            <p className="text-muted-foreground font-light">Explore the latest wisdom</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { number: 22, title: 'Mindful Breathing', time: '12 min' },
              { number: 21, title: 'Present Moment Awareness', time: '18 min' },
              { number: 20, title: 'Compassionate Living', time: '15 min' }
            ].map((chapter) => (
              <Card key={chapter.number} className="border-0 shadow-none bg-transparent hover:bg-muted/30 transition-colors duration-300 group cursor-pointer">
                <CardContent className="p-8 text-center space-y-6">
                  <div className="w-16 h-16 mx-auto rounded-full border border-primary/20 flex items-center justify-center text-primary font-light text-lg group-hover:border-primary/40 transition-colors">
                    {chapter.number}
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-xl font-light group-hover:text-primary transition-colors">
                      {chapter.title}
                    </h3>
                    <p className="text-muted-foreground text-sm font-light">
                      {chapter.time} read
                    </p>
                  </div>
                  
                  <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                    Read Now
                    <ArrowRight className="ml-2 h-3 w-3" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Clean Footer */}
      <footer className="border-t border-border/50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-12 max-w-4xl mx-auto">
            <div className="text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start space-x-2">
                <Circle className="h-6 w-6 text-primary" />
                <span className="text-lg font-light">ZEN</span>
              </div>
              <p className="text-muted-foreground text-sm font-light leading-relaxed">
                A space for contemplation and growth through mindful reading.
              </p>
            </div>
            
            <div className="text-center space-y-4">
              <h4 className="font-medium text-foreground">Navigation</h4>
              <div className="space-y-2 text-sm font-light">
                <Link to="/chapters" className="block text-muted-foreground hover:text-foreground transition-colors">
                  All Chapters
                </Link>
                <Link to="/profile" className="block text-muted-foreground hover:text-foreground transition-colors">
                  My Journey
                </Link>
              </div>
            </div>
            
            <div className="text-center md:text-right space-y-4">
              <h4 className="font-medium text-foreground">Connect</h4>
              <div className="space-y-2 text-sm font-light">
                <Link to="/support" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Support
                </Link>
                <a href="#" className="block text-muted-foreground hover:text-foreground transition-colors">
                  Community
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-border/50 mt-12 pt-8 text-center">
            <p className="text-muted-foreground text-sm font-light">
              © 2024 ZEN. Crafted with mindful intention.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};