import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  FileImage, 
  CheckCircle, 
  AlertCircle,
  X,
  Plus
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

interface UploadFile {
  id: string;
  file: File;
  preview: string;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  progress: number;
}

export const AuthorUpload = () => {
  const { user } = useAuth();
  const [chapterInfo, setChapterInfo] = useState({
    title: '',
    chapter_number: '',
    description: '',
  });
  const [uploadedFiles, setUploadedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    
    const newFiles = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      preview: URL.createObjectURL(file),
      status: 'pending' as const,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => {
      const file = prev.find(f => f.id === fileId);
      if (file) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter(f => f.id !== fileId);
    });
  };

  const simulateUpload = (fileId: string) => {
    setUploadedFiles(prev => prev.map(file => 
      file.id === fileId ? { ...file, status: 'uploading' } : file
    ));

    // Simulate progress
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, status: 'complete', progress: 100 } : file
        ));
      } else {
        setUploadedFiles(prev => prev.map(file => 
          file.id === fileId ? { ...file, progress } : file
        ));
      }
    }, 200);
  };

  const uploadChapter = async () => {
    try {
      setIsUploading(true);

      // Validate inputs
      if (!chapterInfo.title.trim()) {
        toast({
          title: "Validation Error",
          description: "Chapter title is required",
          variant: "destructive",
        });
        return;
      }

      if (uploadedFiles.length === 0) {
        toast({
          title: "Validation Error",
          description: "At least one image is required",
          variant: "destructive",
        });
        return;
      }

      // Check for duplicates (mock)
      const duplicateCheck = uploadedFiles.some(file => 
        file.file.name.includes('duplicate')
      );

      if (duplicateCheck) {
        toast({
          title: "Duplicate Warning",
          description: "Some files appear to be duplicates. Please review.",
          variant: "destructive",
        });
        return;
      }

      // Simulate file uploads
      for (const file of uploadedFiles) {
        if (file.status === 'pending') {
          simulateUpload(file.id);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      // Mock chapter creation
      setTimeout(() => {
        toast({
          title: "Success",
          description: `Chapter "${chapterInfo.title}" uploaded successfully!`,
        });

        // Reset form
        setChapterInfo({ title: '', chapter_number: '', description: '' });
        setUploadedFiles([]);
      }, 3000);

    } catch (error) {
      console.error('Error uploading chapter:', error);
      toast({
        title: "Upload Error",
        description: "Failed to upload chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: UploadFile['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'uploading':
        return <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />;
      default:
        return <FileImage className="h-4 w-4 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Upload Chapter</h1>
        <p className="text-muted-foreground">Add a new chapter to your series</p>
      </div>

      {/* Chapter Information */}
      <Card>
        <CardHeader>
          <CardTitle>Chapter Information</CardTitle>
          <CardDescription>Fill in the details for your new chapter</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Chapter Title</Label>
              <Input
                id="title"
                value={chapterInfo.title}
                onChange={(e) => setChapterInfo(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter chapter title..."
              />
            </div>
            <div>
              <Label htmlFor="chapter_number">Chapter Number</Label>
              <Input
                id="chapter_number"
                type="number"
                value={chapterInfo.chapter_number}
                onChange={(e) => setChapterInfo(prev => ({ ...prev, chapter_number: e.target.value }))}
                placeholder="e.g., 1"
              />
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={chapterInfo.description}
              onChange={(e) => setChapterInfo(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the chapter..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* File Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Images</CardTitle>
          <CardDescription>Upload your chapter pages in order (JPG, PNG, WEBP)</CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
            onClick={() => document.getElementById('file-upload')?.click()}
          >
            <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-lg font-medium mb-2">Drop files here or click to browse</p>
            <p className="text-sm text-muted-foreground">
              Supports JPG, PNG, WEBP up to 10MB each
            </p>
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>

          {/* File List */}
          {uploadedFiles.length > 0 && (
            <div className="mt-6 space-y-3">
              <h4 className="font-medium">Uploaded Files ({uploadedFiles.length})</h4>
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <img 
                    src={file.preview} 
                    alt={file.file.name}
                    className="w-12 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <p className="font-medium">{file.file.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.status === 'uploading' && (
                      <Progress value={file.progress} className="mt-2" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.status)}
                    <Badge variant={
                      file.status === 'complete' ? 'default' :
                      file.status === 'error' ? 'destructive' : 'secondary'
                    }>
                      {file.status}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(file.id)}
                      disabled={file.status === 'uploading'}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Pre-publish Checks</CardTitle>
          <CardDescription>Automated validation before publishing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">Chapter title provided</span>
            </div>
            <div className="flex items-center gap-2">
              {uploadedFiles.length > 0 ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-500" />
              )}
              <span className="text-sm">Images uploaded ({uploadedFiles.length})</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm">No duplicate images detected</span>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button 
              onClick={uploadChapter}
              disabled={isUploading || !chapterInfo.title.trim() || uploadedFiles.length === 0}
              className="flex-1"
            >
              {isUploading ? 'Publishing...' : 'Publish Chapter'}
            </Button>
            <Button variant="outline" disabled={isUploading}>
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};