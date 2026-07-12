import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, BookOpen, User, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import LazyImage from './LazyImage';

interface SearchResult {
  id: string;
  title: string;
  description?: string;
  author?: string;
  cover_image_url?: string;
  alt_names?: string[];
  genres?: string[];
}

interface InteractiveSearchProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InteractiveSearch: React.FC<InteractiveSearchProps> = ({
  isOpen,
  onClose
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Focus input when opened
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  // Handle clicks outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Search function
  const performSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('manga_meta')
        .select('id, title, description, author, cover_image_url, alt_names, genres')
        .or(`title.ilike.%${searchQuery}%, description.ilike.%${searchQuery}%, author.ilike.%${searchQuery}%`)
        .limit(10);

      if (error) throw error;

      // Also search in alt_names
      const altNameResults = await supabase
        .from('manga_meta')
        .select('id, title, description, author, cover_image_url, alt_names, genres')
        .contains('alt_names', [searchQuery])
        .limit(5);

      // Combine and deduplicate results
      const combinedResults = [...(data || [])];
      if (altNameResults.data) {
        altNameResults.data.forEach(result => {
          if (!combinedResults.find(r => r.id === result.id)) {
            combinedResults.push(result);
          }
        });
      }

      setResults(combinedResults);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleResultClick(results[selectedIndex]);
      } else if (query.trim()) {
        navigate(`/search?q=${encodeURIComponent(query.trim())}`);
        onClose();
      }
    }
  };

  const handleResultClick = (result: SearchResult) => {
    navigate(`/series/${result.id}`);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 backdrop-blur-sm">
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-auto px-4">
        <div ref={containerRef} className="bg-background/95 backdrop-blur-xl border border-border/30 rounded-2xl shadow-2xl">
          {/* Search Input */}
          <div className="p-6 pb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                ref={searchInputRef}
                type="text"
                placeholder="Search manga by title, author, or alternative names..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-12 pr-4 h-14 bg-muted/30 border-border/50 focus:border-primary/50 rounded-xl text-lg"
              />
            </div>
          </div>

          {/* Results */}
          {query.trim() && (
            <div className="max-h-96 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                  <p className="text-muted-foreground mt-4">Searching...</p>
                </div>
              ) : results.length > 0 ? (
                <div className="pb-4">
                  {results.map((result, index) => (
                    <div
                      key={result.id}
                      className={`mx-4 mb-2 p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                        selectedIndex === index
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50 border border-transparent'
                      }`}
                      onClick={() => handleResultClick(result)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Cover Image */}
                        <div className="flex-shrink-0">
                          {result.cover_image_url ? (
                            <LazyImage
                              src={result.cover_image_url}
                              alt={result.title}
                              className="w-12 h-16 object-cover rounded-lg"
                            />
                          ) : (
                            <div className="w-12 h-16 bg-muted rounded-lg flex items-center justify-center">
                              <BookOpen className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-foreground truncate">
                            {result.title}
                          </h4>
                          
                          {result.author && (
                            <div className="flex items-center gap-1 mt-1">
                              <User className="h-3 w-3 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground truncate">
                                {result.author}
                              </span>
                            </div>
                          )}

                          {result.alt_names && result.alt_names.length > 0 && (
                            <div className="flex items-center gap-1 mt-1">
                              <Tag className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground truncate">
                                Also known as: {result.alt_names.slice(0, 2).join(', ')}
                                {result.alt_names.length > 2 && '...'}
                              </span>
                            </div>
                          )}

                          {result.description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {result.description}
                            </p>
                          )}

                          {result.genres && result.genres.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {result.genres.slice(0, 3).map(genre => (
                                <span
                                  key={genre}
                                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full"
                                >
                                  {genre}
                                </span>
                              ))}
                              {result.genres.length > 3 && (
                                <span className="text-xs text-muted-foreground self-center">
                                  +{result.genres.length - 3} more
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {query.trim() && (
                    <div className="mx-4 mt-2 pt-2 border-t border-border/30">
                      <button
                        onClick={() => {
                          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
                          onClose();
                        }}
                        className="w-full p-3 text-center text-sm text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl transition-colors"
                      >
                        View all results for "{query}" →
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No results found for "{query}"</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Try searching for manga titles, authors, or alternative names
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Help text when empty */}
          {!query.trim() && (
            <div className="p-8 text-center text-muted-foreground">
              <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Start typing to search for manga...</p>
              <p className="text-sm mt-2">
                Search by title, author, or alternative names
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InteractiveSearch;