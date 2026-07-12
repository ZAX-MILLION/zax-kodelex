import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  FileImage, 
  BookOpen, 
  Image as ImageIcon,
  CheckCircle,
  AlertCircle,
  Loader2
} from "lucide-react";
import { ChapterUploadModal } from "./ChapterUploadModal";
import { EnhancedUploadModal } from "./EnhancedUploadModal";

interface UploadStats {
  chaptersUploaded: number;
  imagesUploaded: number;
  totalSize: string;
  lastUpload: string;
}

export const ContentUpload = () => {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showChapterModal, setShowChapterModal] = useState(false);
  const [showEnhancedModal, setShowEnhancedModal] = useState(false);
  const [uploadStats] = useState<UploadStats>({
    chaptersUploaded: 0,
    imagesUploaded: 0,
    totalSize: "0 MB",
    lastUpload: "Never"
  });
  const { toast } = useToast();

  const handleBulkUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        setUploadProgress(i);
        await new Promise(resolve => setTimeout(resolve, 200));
      }

      toast({
        title: "Upload Complete",
        description: `Successfully uploaded ${files.length} files`,
      });
    } catch (error: any) {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <BookOpen className="h-4 w-4 mr-2" />
              Chapters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats.chaptersUploaded}</div>
            <div className="text-xs text-muted-foreground">Uploaded</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <ImageIcon className="h-4 w-4 mr-2" />
              Images
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats.imagesUploaded}</div>
            <div className="text-xs text-muted-foreground">Total images</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{uploadStats.totalSize}</div>
            <div className="text-xs text-muted-foreground">Of storage</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Last Upload</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">{uploadStats.lastUpload}</div>
            <div className="text-xs text-muted-foreground">Most recent</div>
          </CardContent>
        </Card>
      </div>

      {/* Upload Tabs */}
      <Tabs defaultValue="chapter" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="chapter">Chapter Upload</TabsTrigger>
          <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
          <TabsTrigger value="images">Image Management</TabsTrigger>
        </TabsList>

        <TabsContent value="chapter" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BookOpen className="h-5 w-5 mr-2" />
                Single Chapter Upload
              </CardTitle>
              <CardDescription>
                Upload a new chapter with images and metadata
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button 
                  onClick={() => setShowChapterModal(true)}
                  className="h-32 border-dashed border-2 border-muted-foreground/25 hover:border-muted-foreground/50"
                  variant="outline"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">Quick Chapter Upload</p>
                  </div>
                </Button>
                <Button 
                  onClick={() => setShowEnhancedModal(true)}
                  className="h-32 border-dashed border-2 border-primary/25 hover:border-primary/50"
                  variant="outline"
                >
                  <div className="text-center">
                    <Upload className="h-8 w-8 mx-auto mb-2 text-primary" />
                    <p className="text-sm text-primary">Enhanced Upload System</p>
                    <p className="text-xs text-muted-foreground">With validation & metadata</p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileImage className="h-5 w-5 mr-2" />
                Bulk Upload
              </CardTitle>
              <CardDescription>
                Upload multiple chapters at once from a structured folder
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-upload">Select Folder or ZIP File</Label>
                <Input
                  id="bulk-upload"
                  type="file"
                  multiple
                  {...({ webkitdirectory: "" } as any)}
                  onChange={(e) => handleBulkUpload(e.target.files)}
                  className="cursor-pointer"
                />
                <p className="text-sm text-muted-foreground">
                  Expected structure: /Chapter 1/page1.jpg, page2.jpg, etc.
                </p>
              </div>

              {isUploading && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Uploading files...</span>
                  </div>
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-xs text-muted-foreground">{uploadProgress}% complete</p>
                </div>
              )}

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Upload Guidelines:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Each chapter should be in its own folder</li>
                  <li>• Image files should be numbered sequentially (page1.jpg, page2.jpg)</li>
                  <li>• Supported formats: JPG, PNG, WebP</li>
                  <li>• Maximum file size: 10MB per image</li>
                  <li>• Folder name becomes the chapter title</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="images" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="h-5 w-5 mr-2" />
                Image Management
              </CardTitle>
              <CardDescription>
                Manage cover images, thumbnails, and assets
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="cover-upload">Series Cover Image</Label>
                  <Input
                    id="cover-upload"
                    type="file"
                    accept="image/*"
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 800x1200px, JPG/PNG
                  </p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="thumbnail-upload">Chapter Thumbnails</Label>
                  <Input
                    id="thumbnail-upload"
                    type="file"
                    accept="image/*"
                    multiple
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground">
                    Recommended: 300x400px, JPG/PNG
                  </p>
                </div>
              </div>

              <div className="flex space-x-2">
                <Button className="flex-1">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Upload Images
                </Button>
                <Button variant="outline" className="flex-1">
                  <AlertCircle className="h-4 w-4 mr-2" />
                  Compress Images
                </Button>
              </div>

              <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Image Optimization Tips:
                </h4>
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-1">
                  <li>• Use WebP format for better compression</li>
                  <li>• Optimize images before upload to reduce load times</li>
                  <li>• Consider generating multiple sizes for responsive design</li>
                  <li>• Use consistent aspect ratios for better layout</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Upload Modals */}
      <ChapterUploadModal
        isOpen={showChapterModal}
        onClose={() => setShowChapterModal(false)}
      />
      <EnhancedUploadModal
        isOpen={showEnhancedModal}
        onClose={() => setShowEnhancedModal(false)}
        onUploadComplete={() => {
          // Refresh any data if needed
        }}
      />
    </div>
  );
};