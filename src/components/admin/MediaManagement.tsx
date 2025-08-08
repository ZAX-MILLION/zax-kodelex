import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Folder, 
  Upload, 
  ImageIcon, 
  Grid3X3,
  Clock,
  Users,
  BookOpen
} from "lucide-react";
import { SavedChaptersQueue } from "./SavedChaptersQueue";
import { UserUploadsManager } from "./UserUploadsManager";
import { CoverImagesManager } from "./CoverImagesManager";
import { AllMediaBrowser } from "./AllMediaBrowser";

export const MediaManagement = () => {
  const [activeTab, setActiveTab] = useState("chapters");

  const tabs = [
    {
      id: "chapters",
      label: "Saved Chapters",
      icon: Clock,
      description: "Manage unpublished chapters queue",
      component: SavedChaptersQueue
    },
    {
      id: "uploads",
      label: "User Uploads",
      icon: Users,
      description: "Moderate user-submitted content",
      component: UserUploadsManager
    },
    {
      id: "covers",
      label: "Cover Images",
      icon: BookOpen,
      description: "Manage series cover images",
      component: CoverImagesManager
    },
    {
      id: "browser",
      label: "All Media",
      icon: Grid3X3,
      description: "Browse all media files",
      component: AllMediaBrowser
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Media Management</h2>
          <p className="text-muted-foreground">
            Manage all media content, uploads, and publishing queue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="gap-1">
            <Folder className="h-4 w-4" />
            Media Hub
          </Badge>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 lg:w-[600px]">
          {tabs.map((tab) => (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className="flex items-center gap-2"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id} className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <tab.icon className="h-5 w-5" />
                  {tab.label}
                </CardTitle>
                <CardDescription>{tab.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <tab.component />
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};