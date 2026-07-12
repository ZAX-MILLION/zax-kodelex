import { useState } from "react";
import { useDropzone } from "react-dropzone";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Upload, 
  X, 
  FileImage, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from "lucide-react";
import { useUploadSystem } from "@/hooks/useUploadSystem";

interface EnhancedUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadComplete?: () => void;
}

export const EnhancedUploadModal = ({ 
  isOpen, 
  onClose, 
  onUploadComplete 
}: EnhancedUploadModalProps) => {
  const { 
    uploads, 
    isUploading, 
    addFiles, 
    removeFile, 
    uploadAll,
    clearAll,
    validateMetadata
  } = useUploadSystem();

  const [metadata, setMetadata] = useState({
    title: "",
    language: "en",
    tags: [] as string[],
    synopsis: "",
    chapterNumber: "",
    uploadContext: "chapter_page"
  });

  const [tagInput, setTagInput] = useState("");
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: addFiles,
    accept: {
      'image/*': ['.jpg', '.jpeg', '.png', '.webp'],
      'application/zip': ['.zip']
    },
    maxSize: 10 * 1024 * 1024, // 10MB
    multiple: true
  });

  const handleAddTag = () => {
    if (tagInput.trim() && !metadata.tags.includes(tagInput.trim())) {
      setMetadata(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setMetadata(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = async () => {
    const uploadMetadata = {
      ...metadata,
      chapterNumber: metadata.chapterNumber ? parseInt(metadata.chapterNumber) : undefined
    };

    const validation = validateMetadata(uploadMetadata);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }

    setValidationErrors([]);
    
    const success = await uploadAll(uploadMetadata);
    if (success) {
      setTimeout(() => {
        clearAll();
        setMetadata({
          title: "",
          language: "en",
          tags: [],
          synopsis: "",
          chapterNumber: "",
          uploadContext: "chapter_page"
        });
        onUploadComplete?.();
        onClose();
      }, 2000);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      clearAll();
      setValidationErrors([]);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Enhanced Upload System
          </DialogTitle>
          <DialogDescription>
            Upload manga content with proper metadata and real-time validation
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Metadata Form */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Content Details</h3>
            
            {validationErrors.length > 0 && (
              <div className="bg-destructive/10 border border-destructive/20 p-3 rounded-lg">
                <div className="flex items-center gap-2 text-destructive mb-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="font-medium">Validation Errors</span>
                </div>
                <ul className="text-sm text-destructive/80 space-y-1">
                  {validationErrors.map((error, index) => (
                    <li key={index}>• {error}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="uploadContext">Content Type</Label>
              <Select
                value={metadata.uploadContext}
                onValueChange={(value) => 
                  setMetadata(prev => ({ ...prev, uploadContext: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select content type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="chapter_page">Chapter Pages</SelectItem>
                  <SelectItem value="cover">Cover Image</SelectItem>
                  <SelectItem value="thumbnail">Thumbnail</SelectItem>
                  <SelectItem value="asset">General Asset</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                placeholder="Enter a descriptive title (no placeholder text)"
                value={metadata.title}
                onChange={(e) => 
                  setMetadata(prev => ({ ...prev, title: e.target.value }))
                }
                required
              />
            </div>

            {metadata.uploadContext === 'chapter_page' && (
              <div className="space-y-2">
                <Label htmlFor="chapterNumber">Chapter Number *</Label>
                <Input
                  id="chapterNumber"
                  type="number"
                  placeholder="1"
                  value={metadata.chapterNumber}
                  onChange={(e) => 
                    setMetadata(prev => ({ ...prev, chapterNumber: e.target.value }))
                  }
                  min="1"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="language">Language *</Label>
              <Select
                value={metadata.language}
                onValueChange={(value) => 
                  setMetadata(prev => ({ ...prev, language: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="en">English</SelectItem>
                  <SelectItem value="ja">Japanese</SelectItem>
                  <SelectItem value="ko">Korean</SelectItem>
                  <SelectItem value="zh">Chinese</SelectItem>
                  <SelectItem value="es">Spanish</SelectItem>
                  <SelectItem value="fr">French</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="tags">Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              {metadata.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {metadata.tags.map(tag => (
                    <Badge key={tag} variant="secondary" className="gap-1">
                      {tag}
                      <X 
                        className="h-3 w-3 cursor-pointer"
                        onClick={() => handleRemoveTag(tag)}
                      />
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="synopsis">Synopsis *</Label>
              <Textarea
                id="synopsis"
                placeholder="Provide a real description (no lorem ipsum or placeholder text)"
                value={metadata.synopsis}
                onChange={(e) => 
                  setMetadata(prev => ({ ...prev, synopsis: e.target.value }))
                }
                rows={4}
                required
              />
            </div>
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">File Upload</h3>
            
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragActive 
                  ? 'border-primary bg-primary/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
            >
              <input {...getInputProps()} />
              <FileImage className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {isDragActive
                  ? "Drop files here..."
                  : "Drag & drop files or click to browse"
                }
              </p>
              <p className="text-xs text-muted-foreground">
                Supports JPG, PNG, WebP, ZIP files (Max 10MB each)
              </p>
            </div>

            {/* Upload Progress */}
            {uploads.length > 0 && (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Files ({uploads.length})
                  </span>
                  {!isUploading && (
                    <Button 
                      onClick={clearAll} 
                      variant="ghost" 
                      size="sm"
                    >
                      Clear All
                    </Button>
                  )}
                </div>
                
                {uploads.map((upload) => (
                  <div key={upload.id} className="border rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-1">
                          {upload.status === 'completed' && (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          )}
                          {upload.status === 'error' && (
                            <AlertCircle className="h-4 w-4 text-red-500" />
                          )}
                          {upload.status === 'uploading' && (
                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                          )}
                        </div>
                        <span className="text-sm font-medium truncate">
                          {upload.file.name}
                        </span>
                      </div>
                      
                      {upload.status === 'pending' && (
                        <Button
                          onClick={() => removeFile(upload.id)}
                          variant="ghost"
                          size="sm"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>{(upload.file.size / 1024 / 1024).toFixed(1)} MB</span>
                        <span className="capitalize">{upload.status}</span>
                      </div>
                      
                      {upload.status === 'uploading' && (
                        <Progress value={upload.progress} className="h-2" />
                      )}
                      
                      {upload.error && (
                        <p className="text-xs text-red-500">{upload.error}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleClose}
            disabled={isUploading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isUploading || uploads.filter(u => u.status === 'pending').length === 0}
          >
            {isUploading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};