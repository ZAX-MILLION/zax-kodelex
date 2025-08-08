import React from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface SeriesMetadata {
  title: string;
  description: string;
  author: string;
  artist?: string;
  type: 'manga' | 'novel';
  status: 'ongoing' | 'completed' | 'hiatus' | 'cancelled';
  genres: string[];
  tags: string[];
  alt_names: string[];
  mature_content: boolean;
}

interface SeriesMetadataFormProps {
  onSubmit: (data: SeriesMetadata) => void;
  initialData?: Partial<SeriesMetadata>;
  loading?: boolean;
}

export const SeriesMetadataForm: React.FC<SeriesMetadataFormProps> = ({
  onSubmit,
  initialData,
  loading = false
}) => {
  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<SeriesMetadata>({
    defaultValues: {
      title: '',
      description: '',
      author: '',
      artist: '',
      type: 'manga',
      status: 'ongoing',
      genres: [],
      tags: [],
      alt_names: [],
      mature_content: false,
      ...initialData
    }
  });

  const [genreInput, setGenreInput] = React.useState('');
  const [tagInput, setTagInput] = React.useState('');
  const [altNameInput, setAltNameInput] = React.useState('');
  const currentGenres = watch('genres') || [];
  const currentTags = watch('tags') || [];
  const currentAltNames = watch('alt_names') || [];
  const selectedType = watch('type');

  const commonGenres = [
    'Action', 'Adventure', 'Comedy', 'Drama', 'Fantasy', 'Horror', 
    'Mystery', 'Romance', 'Sci-Fi', 'Slice of Life', 'Sports', 'Thriller'
  ];

  const addGenre = (genre: string) => {
    if (genre && !currentGenres.includes(genre)) {
      setValue('genres', [...currentGenres, genre]);
      setGenreInput('');
    }
  };

  const removeGenre = (genre: string) => {
    setValue('genres', currentGenres.filter(g => g !== genre));
  };

  const addTag = () => {
    if (tagInput && !currentTags.includes(tagInput)) {
      setValue('tags', [...currentTags, tagInput]);
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setValue('tags', currentTags.filter(t => t !== tag));
  };

  const addAltName = () => {
    if (altNameInput && !currentAltNames.includes(altNameInput)) {
      setValue('alt_names', [...currentAltNames, altNameInput]);
      setAltNameInput('');
    }
  };

  const removeAltName = (altName: string) => {
    setValue('alt_names', currentAltNames.filter(n => n !== altName));
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Series Information</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter series title"
              />
              {errors.title && <p className="text-sm text-destructive">{errors.title.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="type">Type *</Label>
              <Select onValueChange={(value) => setValue('type', value as 'manga' | 'novel')}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="manga">Manga</SelectItem>
                  <SelectItem value="novel">Novel</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              {...register('description', { required: 'Description is required' })}
              placeholder="Enter series description"
              rows={4}
            />
            {errors.description && <p className="text-sm text-destructive">{errors.description.message}</p>}
          </div>

          {/* Creator Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                {...register('author', { required: 'Author is required' })}
                placeholder="Enter author name"
              />
              {errors.author && <p className="text-sm text-destructive">{errors.author.message}</p>}
            </div>

            {selectedType === 'manga' && (
              <div className="space-y-2">
                <Label htmlFor="artist">Artist</Label>
                <Input
                  id="artist"
                  {...register('artist')}
                  placeholder="Enter artist name (if different from author)"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select onValueChange={(value) => setValue('status', value as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="hiatus">On Hiatus</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Genres */}
          <div className="space-y-2">
            <Label>Genres</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentGenres.map(genre => (
                <Badge key={genre} variant="secondary" className="flex items-center gap-1">
                  {genre}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeGenre(genre)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Select onValueChange={addGenre}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Add genre" />
                </SelectTrigger>
                <SelectContent>
                  {commonGenres.filter(g => !currentGenres.includes(g)).map(genre => (
                    <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentTags.map(tag => (
                <Badge key={tag} variant="outline" className="flex items-center gap-1">
                  {tag}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeTag(tag)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom tag"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag} variant="outline">Add</Button>
            </div>
          </div>

          {/* Alternative Names */}
          <div className="space-y-2">
            <Label>Alternative Names</Label>
            <p className="text-sm text-muted-foreground">
              Add alternative titles to help users find this series when searching
            </p>
            <div className="flex flex-wrap gap-2 mb-2">
              {currentAltNames.map(altName => (
                <Badge key={altName} variant="outline" className="flex items-center gap-1">
                  {altName}
                  <X className="h-3 w-3 cursor-pointer" onClick={() => removeAltName(altName)} />
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add alternative name"
                value={altNameInput}
                onChange={(e) => setAltNameInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAltName())}
              />
              <Button type="button" onClick={addAltName} variant="outline">Add</Button>
            </div>
          </div>

          {/* Mature Content */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="mature_content"
              {...register('mature_content')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="mature_content">Contains mature content (18+)</Label>
          </div>

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Saving...' : initialData ? 'Update Series' : 'Create Series'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};