import { useState } from "react";
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
import { Upload, X, Image, FileText } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAdminFunctions } from "@/hooks/useAdminFunctions";

interface ChapterUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChapterUploadModal = ({ isOpen, onClose }: ChapterUploadModalProps) => {
  const { toast } = useToast();
  const { uploadChapter, isUploading } = useAdminFunctions();
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    chapterNumber: "",
    description: "",
  });
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.chapterNumber || selectedFiles.length === 0) {
      toast({
        title: "Missing information",
        description: "Please fill in all required fields and select chapter images.",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const result = await uploadChapter({
        title: formData.title,
        chapter_number: parseInt(formData.chapterNumber),
        pages: selectedFiles,
      });

      if (result.success) {
        // Reset form
        setFormData({ title: "", chapterNumber: "", description: "" });
        setSelectedFiles([]);
        onClose();
      }
    } catch (error: any) {
      toast({
        title: "Upload failed",
        description: error.message || "There was an error uploading your chapter. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Quick Chapter Upload
          </DialogTitle>
          <DialogDescription>
            Upload a new chapter with images. You can drag and drop files or click to browse.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="chapterNumber">Chapter Number</Label>
              <Input
                id="chapterNumber"
                type="number"
                placeholder="1"
                value={formData.chapterNumber}
                onChange={(e) => setFormData(prev => ({ ...prev, chapterNumber: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="title">Chapter Title</Label>
              <Input
                id="title"
                placeholder="Enter chapter title..."
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Brief description of this chapter..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
            />
          </div>

          {/* File Upload */}
          <div className="space-y-4">
            <Label>Chapter Images</Label>
            <div 
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragOver 
                  ? 'border-manga-red bg-manga-red/5' 
                  : 'border-muted-foreground/25 hover:border-muted-foreground/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <input
                type="file"
                multiple
                accept="image/*,.zip"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer">
                <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <p className="text-sm text-muted-foreground mb-2">
                  Click to browse or drag and drop images here
                </p>
                <p className="text-xs text-muted-foreground">
                  Supports JPG, PNG, WebP, ZIP files (Max 10MB each)
                </p>
              </label>
            </div>

            {/* Selected Files */}
            {selectedFiles.length > 0 && (
              <div className="space-y-2">
                <Label>Selected Files ({selectedFiles.length})</Label>
                <div className="max-h-32 overflow-y-auto space-y-1">
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 p-2 rounded">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        <span className="text-sm truncate">{file.name}</span>
                        <span className="text-xs text-muted-foreground">
                          ({(file.size / 1024 / 1024).toFixed(1)}MB)
                        </span>
                      </div>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={uploading || isUploading || !formData.title || !formData.chapterNumber || selectedFiles.length === 0}
            >
              {(uploading || isUploading) ? "Uploading..." : "Upload Chapter"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};