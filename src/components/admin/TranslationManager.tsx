import React, { useState, useEffect } from 'react';
import { useI18n } from '@/contexts/I18nContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Search, Plus, Edit, Trash2, Copy, Globe } from 'lucide-react';

interface Translation {
  id: string;
  key: string;
  language_code: string;
  value: string;
  context?: string;
  created_at: string;
  updated_at: string;
}

interface Language {
  id: string;
  code: string;
  name: string;
  native_name: string;
  direction: 'ltr' | 'rtl';
  font_family?: string;
  is_active: boolean;
  display_order: number;
}

export const TranslationManager = () => {
  const { languages, currentLanguage, refreshTranslations } = useI18n();
  const { toast } = useToast();
  
  const [translations, setTranslations] = useState<Translation[]>([]);
  const [selectedLanguage, setSelectedLanguage] = useState(currentLanguage.code);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [editingTranslation, setEditingTranslation] = useState<Translation | null>(null);
  const [deletingTranslation, setDeletingTranslation] = useState<Translation | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  
  // Form states
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newContext, setNewContext] = useState('');

  // Load translations for selected language
  const loadTranslations = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('translations')
        .select('*')
        .eq('language_code', selectedLanguage)
        .order('key');

      if (error) throw error;
      setTranslations(data || []);
    } catch (error) {
      console.error('Error loading translations:', error);
      toast({
        title: "Error",
        description: "Failed to load translations.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Add new translation
  const addTranslation = async () => {
    if (!newKey.trim() || !newValue.trim()) {
      toast({
        title: "Error",
        description: "Key and value are required.",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('translations')
        .insert({
          key: newKey.trim(),
          language_code: selectedLanguage,
          value: newValue.trim(),
          context: newContext.trim() || null
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation added successfully."
      });

      setNewKey('');
      setNewValue('');
      setNewContext('');
      setShowAddForm(false);
      loadTranslations();
      refreshTranslations();
    } catch (error: any) {
      console.error('Error adding translation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to add translation.",
        variant: "destructive"
      });
    }
  };

  // Update translation
  const updateTranslation = async () => {
    if (!editingTranslation) return;

    try {
      const { error } = await supabase
        .from('translations')
        .update({
          value: editingTranslation.value,
          context: editingTranslation.context || null
        })
        .eq('id', editingTranslation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation updated successfully."
      });

      setEditingTranslation(null);
      loadTranslations();
      refreshTranslations();
    } catch (error: any) {
      console.error('Error updating translation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update translation.",
        variant: "destructive"
      });
    }
  };

  // Delete translation
  const deleteTranslation = async () => {
    if (!deletingTranslation) return;

    try {
      const { error } = await supabase
        .from('translations')
        .delete()
        .eq('id', deletingTranslation.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Translation deleted successfully."
      });

      setDeletingTranslation(null);
      loadTranslations();
      refreshTranslations();
    } catch (error: any) {
      console.error('Error deleting translation:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete translation.",
        variant: "destructive"
      });
    }
  };

  // Copy translation to other languages
  const copyTranslationToLanguages = async (translation: Translation) => {
    try {
      const otherLanguages = languages.filter(lang => lang.code !== selectedLanguage);
      
      for (const lang of otherLanguages) {
        await supabase
          .from('translations')
          .upsert({
            key: translation.key,
            language_code: lang.code,
            value: translation.value, // Admin will need to translate this manually
            context: translation.context
          });
      }

      toast({
        title: "Success",
        description: `Translation copied to ${otherLanguages.length} languages. Please update the values manually.`
      });
    } catch (error) {
      console.error('Error copying translation:', error);
      toast({
        title: "Error",
        description: "Failed to copy translation.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    loadTranslations();
  }, [selectedLanguage]);

  const filteredTranslations = translations.filter(t =>
    t.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.value.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (t.context && t.context.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Translation Manager
          </CardTitle>
          <CardDescription>
            Manage translations for all supported languages. Add, edit, or delete translation strings.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Language and Search Controls */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Label htmlFor="language-select">Language</Label>
              <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.code} value={lang.code}>
                      <div className="flex items-center gap-2">
                        <span>{lang.native_name}</span>
                        <Badge variant="outline" className="text-xs">
                          {lang.direction.toUpperCase()}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1">
              <Label htmlFor="search">Search Translations</Label>
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Search by key, value, or context..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            
            <div className="flex items-end">
              <Button onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Translation
              </Button>
            </div>
          </div>

          {/* Add Translation Form */}
          {showAddForm && (
            <Card>
              <CardHeader>
                <CardTitle>Add New Translation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="new-key">Translation Key</Label>
                  <Input
                    id="new-key"
                    placeholder="e.g., header.navigation.home"
                    value={newKey}
                    onChange={(e) => setNewKey(e.target.value)}
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-value">Translation Value</Label>
                  <Textarea
                    id="new-value"
                    placeholder="Enter the translated text..."
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="new-context">Context (Optional)</Label>
                  <Input
                    id="new-context"
                    placeholder="Provide context for translators..."
                    value={newContext}
                    onChange={(e) => setNewContext(e.target.value)}
                  />
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={addTranslation}>Add Translation</Button>
                  <Button variant="outline" onClick={() => setShowAddForm(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Translations List */}
          <Card>
            <CardHeader>
              <CardTitle>
                Translations ({filteredTranslations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {isLoading ? (
                    <div className="text-center py-8">Loading translations...</div>
                  ) : filteredTranslations.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      No translations found for this language.
                    </div>
                  ) : (
                    filteredTranslations.map((translation) => (
                      <Card key={translation.id} className="p-4">
                        <div className="space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="font-mono text-sm text-muted-foreground">
                                {translation.key}
                              </div>
                              <div className="mt-1 text-base">
                                {translation.value}
                              </div>
                              {translation.context && (
                                <div className="mt-1 text-sm text-muted-foreground italic">
                                  Context: {translation.context}
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2 ml-4">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => copyTranslationToLanguages(translation)}
                                title="Copy to other languages"
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setEditingTranslation(translation)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => setDeletingTranslation(translation)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </CardContent>
      </Card>

      {/* Edit Translation Dialog */}
      {editingTranslation && (
        <AlertDialog open={!!editingTranslation} onOpenChange={() => setEditingTranslation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Edit Translation</AlertDialogTitle>
              <AlertDialogDescription>
                Update the translation value and context.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Key (Read-only)</Label>
                <Input value={editingTranslation.key} disabled />
              </div>
              
              <div>
                <Label htmlFor="edit-value">Value</Label>
                <Textarea
                  id="edit-value"
                  value={editingTranslation.value}
                  onChange={(e) => setEditingTranslation({
                    ...editingTranslation,
                    value: e.target.value
                  })}
                  rows={3}
                />
              </div>
              
              <div>
                <Label htmlFor="edit-context">Context</Label>
                <Input
                  id="edit-context"
                  value={editingTranslation.context || ''}
                  onChange={(e) => setEditingTranslation({
                    ...editingTranslation,
                    context: e.target.value
                  })}
                />
              </div>
            </div>
            
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={updateTranslation}>
                Update Translation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}

      {/* Delete Confirmation Dialog */}
      {deletingTranslation && (
        <AlertDialog open={!!deletingTranslation} onOpenChange={() => setDeletingTranslation(null)}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Translation</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this translation? This action cannot be undone.
                <div className="mt-2 p-2 bg-muted rounded">
                  <div className="font-mono text-sm">{deletingTranslation.key}</div>
                  <div className="text-sm">{deletingTranslation.value}</div>
                </div>
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={deleteTranslation} className="bg-destructive text-destructive-foreground">
                Delete Translation
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};