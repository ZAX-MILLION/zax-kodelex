import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Star, User, Palette, BookOpen, MessageSquare } from 'lucide-react';

export const ShiranamiSakuraHomepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-950/20 to-slate-800 relative overflow-hidden">
      {/* Atmospheric Background */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30"
        style={{
          backgroundImage: "url('/lovable-uploads/537fec86-cd2c-4480-809c-038fd0e611e2.png')",
          filter: 'blur(2px)'
        }}
      />
      
      {/* Sakura Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-red-950/30 to-transparent" />
      
      {/* Main Content */}
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12 pt-16">
          <div className="inline-flex gap-2 mb-4">
            <Badge variant="destructive" className="bg-red-600/80 text-white border-red-500">
              Ongoing
            </Badge>
            <Badge variant="outline" className="border-red-500/50 text-red-300">
              4 Chapters
            </Badge>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-4 tracking-wide">
            Your Manga Title
          </h1>
          <p className="text-xl text-red-200/80 max-w-2xl mx-auto leading-relaxed">
            An epic manga adventure awaits your discovery
          </p>
        </div>

        {/* Main Layout */}
        <div className="grid lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {/* Left Column - Cover & Progress */}
          <div className="lg:col-span-1 space-y-6">
            {/* Featured Cover */}
            <Card className="bg-black/60 border-red-900/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="relative group">
                  <div className="relative overflow-hidden rounded-lg">
                    <img 
                      src="/lovable-uploads/537fec86-cd2c-4480-809c-038fd0e611e2.png"
                      alt="Manga Cover"
                      className="w-full aspect-[3/4] object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-red-600/30 to-transparent" />
                    
                    {/* Rating Badge */}
                    <div className="absolute top-3 left-3 flex items-center gap-1 bg-black/80 rounded-full px-3 py-1">
                      <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                      <span className="text-white font-semibold">9/10</span>
                    </div>
                    
                    {/* Status Badge */}
                    <Badge className="absolute top-3 right-3 bg-red-600 text-white">
                      Ongoing
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progress Card */}
            <Card className="bg-black/60 border-red-900/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="text-red-300 flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Your Progress
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-green-400">0</div>
                    <div className="text-sm text-gray-400">Read</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-yellow-400">0</div>
                    <div className="text-sm text-gray-400">Reading</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-red-400">4</div>
                    <div className="text-sm text-gray-400">Total</div>
                  </div>
                </div>
                <Progress value={0} className="h-2 bg-gray-800" />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/60 border-red-900/50">
                <TabsTrigger value="details" className="text-red-300 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  Details
                </TabsTrigger>
                <TabsTrigger value="chapters" className="text-red-300 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  Chapters (4)
                </TabsTrigger>
                <TabsTrigger value="comments" className="text-red-300 data-[state=active]:bg-red-600 data-[state=active]:text-white">
                  Comments
                </TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="mt-6">
                <Card className="bg-black/60 border-red-900/50 backdrop-blur-sm">
                  <CardContent className="p-6 space-y-6">
                    {/* Author & Artist */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3 p-4 bg-red-950/30 rounded-lg border border-red-900/30">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback className="bg-red-600 text-white">
                            <User className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-red-300 uppercase tracking-wider">Author</div>
                          <div className="text-white font-semibold">Akira Sato</div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-red-950/30 rounded-lg border border-red-900/30">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src="/placeholder-avatar.jpg" />
                          <AvatarFallback className="bg-red-600 text-white">
                            <Palette className="w-5 h-5" />
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-red-300 uppercase tracking-wider">Artist</div>
                          <div className="text-white font-semibold">Yuki Tanaka</div>
                        </div>
                      </div>
                    </div>

                    {/* Genres */}
                    <div>
                      <div className="text-sm text-red-300 uppercase tracking-wider mb-3">Genres</div>
                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className="border-red-500 text-red-300 hover:bg-red-500 hover:text-white">
                          Action
                        </Badge>
                        <Badge variant="outline" className="border-red-500 text-red-300 hover:bg-red-500 hover:text-white">
                          Fantasy
                        </Badge>
                        <Badge variant="outline" className="border-red-500 text-red-300 hover:bg-red-500 hover:text-white">
                          Supernatural
                        </Badge>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <div className="text-sm text-red-300 uppercase tracking-wider mb-3">Description</div>
                      <p className="text-gray-300 leading-relaxed text-justify">
                        In a world where ancient spirits and modern technology collide, young warrior Akira must master the legendary Crimson Blade to save humanity from an otherworldly threat. Join him on an epic journey through mystical landscapes and intense battles, where honor, courage, and the bonds of friendship will determine the fate of all.
                      </p>
                    </div>

                    {/* Read Button */}
                    <Button className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg">
                      Start Reading Chapter 1
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="chapters" className="mt-6">
                <Card className="bg-black/60 border-red-900/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-center text-gray-400 py-8">
                      Chapter list would be displayed here
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="comments" className="mt-6">
                <Card className="bg-black/60 border-red-900/50 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-center text-gray-400 py-8 flex items-center justify-center gap-2">
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