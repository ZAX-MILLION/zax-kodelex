// Example theme component overrides for homepage
// This file demonstrates the structure for theme-specific components

import React from 'react';

// Heroic theme homepage component
export const HeroicHomepage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
      <div className="text-center space-y-8 max-w-4xl px-6">
        <h1 className="text-6xl font-bold text-foreground mb-4">
          Epic Manga Adventures
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Immerse yourself in legendary stories and unforgettable characters.
          Your next great adventure awaits.
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-8 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90 transition-colors">
            Start Reading
          </button>
          <button className="px-8 py-3 border border-border text-foreground rounded-lg font-semibold hover:bg-accent transition-colors">
            Browse Library
          </button>
        </div>
      </div>
    </div>
  );
};

// Minimal theme homepage component
export const MinimalHomepage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-light text-foreground">
          Manga Reader
        </h1>
        <p className="text-muted-foreground">
          Simple. Clean. Focused.
        </p>
        <button className="px-6 py-2 text-primary border-b border-primary hover:bg-primary/5 transition-colors">
          Enter Library
        </button>
      </div>
    </div>
  );
};

// Community theme homepage component
export const CommunityHomepage: React.FC = () => {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto py-16 px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h1 className="text-5xl font-bold text-foreground">
              Join Our<br />
              <span className="text-primary">Manga Community</span>
            </h1>
            <p className="text-lg text-muted-foreground">
              Connect with fellow readers, discover new series, and share your passion for manga.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Weekly reading discussions</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Exclusive early releases</span>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span>Creator interviews & insights</span>
              </div>
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-semibold mb-4">Featured This Week</h3>
            <div className="space-y-2 text-muted-foreground">
              <p>Latest chapter releases</p>
              <p>Community favorites</p>
              <p>New artist spotlights</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};