import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { EnhancedChapterUploader } from "@/components/upload/EnhancedChapterUploader";
import { ChapterManager } from "@/components/admin/ChapterManager";
import { Pencil } from "lucide-react";

interface MangaEditModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  seriesId: string | null;
  seriesTitle?: string;
}

interface MangaMeta {
  id: string;
  title: string;
  author?: string;
  description?: string;
  genres?: string[];
  tags?: string[];
  content_type?: "manga" | "novel" | string | null;
}

export const MangaEditModal = ({ open, onOpenChange, seriesId, seriesTitle }: MangaEditModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [meta, setMeta] = useState<MangaMeta | null>(null);
  const [newTag, setNewTag] = useState("");
  const [newGenre, setNewGenre] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!open || !seriesId) return;
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("manga_meta")
          .select("id, title, author, description, genres, tags, content_type")
          .eq("id", seriesId)
          .maybeSingle();
        if (error) throw error;
        if (data) {
          setMeta({
            id: data.id,
            title: data.title,
            author: data.author || "",
            description: data.description || "",
            genres: data.genres || [],
            tags: data.tags || [],
            content_type: (data as any).content_type || "manga",
          });
        }
      } catch (e) {
        console.error(e);
        toast({ title: "Failed to load series", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [open, seriesId, toast]);

  const handleSave = async () => {
    if (!meta) return;
    try {
      setSaving(true);
      const { error } = await supabase
        .from("manga_meta")
        .update({
          title: meta.title,
          author: meta.author,
          description: meta.description,
          genres: meta.genres,
          tags: meta.tags,
        })
        .eq("id", meta.id);
      if (error) throw error;
      toast({ title: "Saved", description: "Manga details updated" });
    } catch (e) {
      console.error(e);
      toast({ title: "Save failed", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const addTag = () => {
    if (!meta || !newTag.trim()) return;
    if (meta.tags?.includes(newTag)) return;
    setMeta({ ...meta, tags: [...(meta.tags || []), newTag.trim()] });
    setNewTag("");
  };
  const removeTag = (tag: string) => meta && setMeta({ ...meta, tags: (meta.tags || []).filter(t => t !== tag) });
  const addGenre = () => {
    if (!meta || !newGenre.trim()) return;
    if (meta.genres?.includes(newGenre)) return;
    setMeta({ ...meta, genres: [...(meta.genres || []), newGenre.trim()] });
    setNewGenre("");
  };
  const removeGenre = (g: string) => meta && setMeta({ ...meta, genres: (meta.genres || []).filter(t => t !== g) });

  const seriesType = (meta?.content_type === "novel" ? "novel" : "manga") as "manga" | "novel";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] sm:max-w-[95vw] md:max-w-4xl lg:max-w-6xl max-h-[85vh] overflow-y-auto overflow-x-hidden bg-card">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Pencil className="h-4 w-4" />
            Quick Edit: {seriesTitle || meta?.title || "Series"}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="details" className="mt-2">
          <TabsList className="grid grid-cols-3">
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="upload">Upload</TabsTrigger>
            <TabsTrigger value="manage">Manage</TabsTrigger>
          </TabsList>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            {loading ? (
              <div className="h-32 rounded bg-muted animate-pulse" />
            ) : meta ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input value={meta.title} onChange={e => setMeta({ ...meta, title: e.target.value })} />
                </div>
                <div className="space-y-2">
                  <Label>Author</Label>
                  <Input value={meta.author || ""} onChange={e => setMeta({ ...meta, author: e.target.value })} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <Label>Description</Label>
                  <Textarea rows={4} value={meta.description || ""} onChange={e => setMeta({ ...meta, description: e.target.value })} />
                </div>

                <div className="space-y-2">
                  <Label>Genres</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Add genre" value={newGenre} onChange={e => setNewGenre(e.target.value)} onKeyDown={e => e.key === 'Enter' && addGenre()} />
                    <Button type="button" onClick={addGenre} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(meta.genres || []).map((g) => (
                      <Badge key={g} variant="secondary" className="gap-1">
                        {g}
                        <button onClick={() => removeGenre(g)}>×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Tags</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Add tag" value={newTag} onChange={e => setNewTag(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTag()} />
                    <Button type="button" onClick={addTag} size="sm">Add</Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {(meta.tags || []).map((t) => (
                      <Badge key={t} variant="secondary" className="gap-1">
                        {t}
                        <button onClick={() => removeTag(t)}>×</button>
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end gap-2 pt-2">
                  <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
                  <Button onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</Button>
                </div>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No metadata found.</p>
            )}
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            {seriesId ? (
              <EnhancedChapterUploader 
                seriesId={seriesId}
                seriesType={seriesType}
                onSuccess={() => toast({ title: 'Chapter uploaded' })}
              />
            ) : (
              <p className="text-sm text-muted-foreground">Select a series first.</p>
            )}
          </TabsContent>

          {/* Manage Tab */}
          <TabsContent value="manage">
            {seriesId ? (
              <div className="-mx-2 sm:mx-0">
                <ChapterManager initialSeriesId={seriesId} />
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Select a series first.</p>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
