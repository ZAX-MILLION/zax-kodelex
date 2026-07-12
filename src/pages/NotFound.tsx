import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, Search, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/10 flex items-center justify-center p-4">
      {/* Anime-style decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 border-2 border-primary/20 rounded-full animate-pulse" />
        <div className="absolute bottom-20 right-10 w-24 h-24 border-2 border-secondary/20 rounded-full animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/4 w-16 h-16 border border-accent/30 rotate-45 animate-bounce" />
      </div>

      <div className="relative max-w-2xl w-full text-center">
        {/* Main 404 Display */}
        <div className="mb-8">
          <h1 className="text-8xl md:text-9xl font-bold bg-gradient-to-br from-primary via-primary/80 to-secondary bg-clip-text text-transparent animate-pulse">
            404
          </h1>
          <div className="h-1 w-32 bg-gradient-to-r from-primary to-secondary mx-auto rounded-full mt-4" />
        </div>

        {/* Error Message */}
        <div className="mb-8 space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Oops! Page not found
          </h2>
          <p className="text-muted-foreground text-lg leading-relaxed">
            The page you're looking for seems to have vanished into another dimension. 
            <br className="hidden md:block" />
            Let's get you back to the manga world!
          </p>
          {location.pathname && (
            <div className="mt-4 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-sm text-destructive font-mono">
                Missing path: <span className="font-bold">{location.pathname}</span>
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Button 
            asChild 
            className="w-full sm:w-auto bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 text-primary-foreground font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
          >
            <Link to="/">
              <Home className="w-4 h-4 mr-2" />
              Return Home
            </Link>
          </Button>
          
          <Button 
            asChild 
            variant="outline" 
            className="w-full sm:w-auto border-primary/30 hover:border-primary hover:bg-primary/5 transition-all duration-300"
          >
            <Link to="/search">
              <Search className="w-4 h-4 mr-2" />
              Search Manga
            </Link>
          </Button>
          
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="w-full sm:w-auto hover:bg-secondary/20 transition-all duration-300"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>

        {/* Decorative Bottom Element */}
        <div className="mt-12 flex justify-center">
          <div className="flex space-x-2">
            {[...Array(5)].map((_, i) => (
              <div 
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.1}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;