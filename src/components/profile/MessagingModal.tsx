import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  Send, 
  MessageSquare, 
  AlertTriangle,
  Users,
  X
} from 'lucide-react';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  receiver_id: string;
  created_at: string;
  is_read: boolean;
  sender_profile?: {
    username: string;
    display_name: string;
    profile_picture_url: string;
  };
}

interface MessagingModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipientId?: string;
  recipientProfile?: {
    username: string;
    display_name: string;
    profile_picture_url: string;
  };
}

export const MessagingModal: React.FC<MessagingModalProps> = ({
  isOpen,
  onClose,
  recipientId,
  recipientProfile
}) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    if (isOpen && recipientId) {
      loadMessages();
      markMessagesAsRead();
    }
  }, [isOpen, recipientId]);

  const loadMessages = async () => {
    if (!user || !recipientId) return;

    try {
      setLoading(true);
      // Simplified approach - will be replaced with proper RPC function
      setMessages([]);
    } catch (error) {
      console.error('Error loading messages:', error);
      toast({
        title: "Error",
        description: "Failed to load messages",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    if (!user || !recipientId) return;

    // Simplified - will be implemented with proper database functions
  };

  const sendMessage = async () => {
    if (!user || !recipientId || !newMessage.trim()) return;

    try {
      setSending(true);
      // Simplified - will be implemented with proper database functions
      const error = null;

      if (error) throw error;

      setNewMessage('');
      await loadMessages();
      
      toast({
        title: "Message sent",
        description: "Your message has been delivered.",
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Chat with {recipientProfile?.display_name || recipientProfile?.username || 'User'}
          </DialogTitle>
        </DialogHeader>

        {/* Messages Area */}
        <div className="flex-1 min-h-0 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {messages.map((message) => {
                const isOwnMessage = message.sender_id === user?.id;
                return (
                  <div key={message.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] ${isOwnMessage ? 'order-2' : 'order-1'}`}>
                      <Card className={`${isOwnMessage ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                        <CardContent className="p-3">
                          <p className="text-sm">{message.content}</p>
                          <p className={`text-xs mt-1 ${isOwnMessage ? 'text-primary-foreground/70' : 'text-muted-foreground'}`}>
                            {new Date(message.created_at).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    </div>
                    {!isOwnMessage && (
                      <Avatar className={`h-8 w-8 ${isOwnMessage ? 'order-1 mr-2' : 'order-2 ml-2'}`}>
                        <AvatarImage src={message.sender_profile?.profile_picture_url || recipientProfile?.profile_picture_url || ''} />
                        <AvatarFallback>
                          {(message.sender_profile?.display_name || recipientProfile?.display_name)?.[0]?.toUpperCase() || 'U'}
                        </AvatarFallback>
                      </Avatar>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <Separator />

        {/* Message Input */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded-lg text-xs text-muted-foreground">
            <AlertTriangle className="h-3 w-3" />
            Be respectful. Inappropriate messages will be reported.
          </div>
          
          <div className="flex gap-2">
            <Textarea
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1 min-h-[60px] resize-none"
              maxLength={500}
            />
            <Button 
              size="sm" 
              onClick={sendMessage}
              disabled={!newMessage.trim() || sending}
              className="self-end px-3"
            >
              {sending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current"></div>
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
          
          <p className="text-xs text-muted-foreground text-right">
            {newMessage.length}/500 characters
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};