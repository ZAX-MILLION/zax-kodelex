import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Star, User, Palette, BookOpen, MessageSquare } from 'lucide-react';
import heroBg from '@/assets/hero-bg.jpg';

export const ShiranamiSakuraHomepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-foreground relative overflow-hidden">
      {/* Atmospheric Background */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: `url(${heroBg})`,
          filter: 'blur(2px)',
        }}
      />

      {/* Sakura Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-primary/10 to-transparent" />

      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-16">
          <div className="inline-flex gap-2 mb-4">
            <Badge variant="destructive" className="warrior-badge text-primary-foreground border-primary/50">
              Ongoing
            </Badge>
            <Badge variant="outline" className="border-primary/50 text-primary">
              4 Chapters
            </Badge>
          </div>

          <h1 className="shiranami-hero text-5xl md:text-7xl font-bold sakura-text mb-4 tracking-wide">
            Your Manga Title
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            An epic manga adventure awaits your discovery
          </p>
        </div>

        {/* Main Layout */}
        <div className="sakura-layout grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Cover & Progress */}
          <div className="lg:col-span-1 space-y-6">
            {/* Featured Cover */}
            <Card className="samurai-card shiranami-glow border-border/50">
              <CardContent className="p-6">
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-lg">
                    <img
                      src={heroBg}
                      alt="Manga Cover"
                      className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />

                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-background/80 rounded-full px-3 py-1">
                      <Star className="w-4 h-4 fill-manga-gold text-manga-gold" />
                      <span className="text-foreground font-semibold">9/10</span>
                    </div>

                    {/* Status Badge */}
                    <Badge className="absolute top-3 right-3 warrior-badge text-primary-foreground">
                      Ongoing
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="samurai-card border-border/50">
              <CardHeader>
                <CardTitle className="text-primary flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-chapter-progress">0</div>
                    <div className="text-sm text-muted-foreground">Read</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-manga-gold">0</div>
                    <div className="text-sm text-muted-foreground">Reading</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-primary">4</div>
                    <div className="text-sm text-muted-foreground">Total</div>
                  </div>
                </div>
                <Progress value={0} className="h-2 bg-muted" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 samurai-card border-border/50">
                <TabsTrigger
                  value="details"
                  className="text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Details
                </TabsTrigger>
                <TabsTrigger
                  value="chapters"
                  className="text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Chapters (4)
                </TabsTrigger>
                <TabsTrigger
                  value="comments"
                  className="text-primary data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                >
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card className="samurai-card border-border/50">
                  <CardContent className="p-6 space-y-6">
                    {/* Author & Artist */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg border border-border/30">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-primary uppercase tracking-wider">Author</div>
                          <div className="text-foreground font-semibold">Akira Sato</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-secondary/30 rounded-lg border border-border/30">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder.svg" />
                          <AvatarFallback className="bg-primary text-primary-foreground">
                            <Palette className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-primary uppercase tracking-wider">Artist</div>
                          <div className="text-foreground font-semibold">Yuki Tanaka</div>
                        </div>
                      </div>
                    </div>

                    {/* Genres */}
                    <div>
                      <div className="text-sm text-primary uppercase tracking-wider mb-3">Genres</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          Action
                        </Badge>
                        <Badge variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          Fantasy
                        </Badge>
                        <Badge variant="outline" className="border-primary text-primary hover:bg-primary hover:text-primary-foreground">
                          Supernatural
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="text-sm text-primary uppercase tracking-wider mb-3">Description</div>
                      <p className="text-muted-foreground leading-relaxed text-justify">
                        In a world where ancient spirits and modern technology collide, young warrior Akira must master the legendary Crimson Blade to save humanity from an otherworldly threat. Join him on an epic journey through mystical landscapes and intense battles, where honor, courage, and the bonds of friendship will determine the fate of all.
                      </p>
                    </div>

                    {/* Read Button */}
                    <Button className="w-full shiranami-glow font-semibold py-3 text-lg">
                      Start Reading Chapter 1
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chapters" className="mt-6">
                <Card className="samurai-card border-border/50">
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground py-8">
                      Chapter list would be displayed here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Card className="samurai-card border-border/50">
                  <CardContent className="p-6">
                    <div className="text-center text-muted-foreground py-8 flex items-center justify-center gap-2">
                      <MessageSquare className="w-5 h-5" />
                      Comments section would be displayed here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};
