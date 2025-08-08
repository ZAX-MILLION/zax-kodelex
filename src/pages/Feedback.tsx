import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Star, Bug, Lightbulb, Heart } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const FeedbackPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: '',
    subject: '',
    message: '',
    rating: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const feedbackTypes = [
    { value: 'bug', label: 'Bug Report', icon: Bug, color: 'text-red-500' },
    { value: 'feature', label: 'Feature Request', icon: Lightbulb, color: 'text-yellow-500' },
    { value: 'general', label: 'General Feedback', icon: MessageSquare, color: 'text-blue-500' },
    { value: 'compliment', label: 'Compliment', icon: Heart, color: 'text-pink-500' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      toast({
        title: "Feedback Submitted",
        description: "Thank you for your feedback! We'll review it and get back to you if needed.",
      });
      setFormData({
        name: '',
        email: '',
        type: '',
        subject: '',
        message: '',
        rating: 0
      });
      setIsSubmitting(false);
    }, 1000);
  };

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold">Send Feedback</h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              We value your feedback! Help us improve KODELEX by sharing your thoughts, 
              reporting bugs, or suggesting new features.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feedback Form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Feedback Form</CardTitle>
                  <CardDescription>
                    Please fill out the form below to submit your feedback
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                          placeholder="Your name"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                          placeholder="your@email.com"
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="type">Feedback Type</Label>
                      <Select value={formData.type} onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select feedback type" />
                        </SelectTrigger>
                        <SelectContent>
                          {feedbackTypes.map((type) => (
                            <SelectItem key={type.value} value={type.value}>
                              <div className="flex items-center gap-2">
                                <type.icon className={`h-4 w-4 ${type.color}`} />
                                {type.label}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        value={formData.subject}
                        onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                        placeholder="Brief description of your feedback"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                        placeholder="Please provide detailed feedback..."
                        rows={6}
                        required
                      />
                    </div>

                    {/* Rating */}
                    <div className="space-y-2">
                      <Label>Overall Rating (optional)</Label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`h-6 w-6 cursor-pointer transition-colors ${
                              star <= formData.rating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-gray-300'
                            }`}
                            onClick={() => handleRatingClick(star)}
                          />
                        ))}
                        {formData.rating > 0 && (
                          <span className="text-sm text-muted-foreground ml-2">
                            {formData.rating} out of 5 stars
                          </span>
                        )}
                      </div>
                    </div>

                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Feedback Types */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Feedback Types</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {feedbackTypes.map((type) => (
                    <div key={type.value} className="flex items-start gap-3">
                      <type.icon className={`h-5 w-5 mt-0.5 ${type.color}`} />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-sm text-muted-foreground">
                          {type.value === 'bug' && 'Report technical issues or errors'}
                          {type.value === 'feature' && 'Suggest new features or improvements'}
                          {type.value === 'general' && 'Share your thoughts and opinions'}
                          {type.value === 'compliment' && 'Tell us what you love about KODELEX'}
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Contact Info */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Other Ways to Reach Us</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div>
                    <div className="font-medium">Email Support</div>
                    <div className="text-sm text-muted-foreground">
                      <a href="mailto:support@kodelex.com" className="text-primary hover:underline">
                        support@kodelex.com
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Discord Community</div>
                    <div className="text-sm text-muted-foreground">
                      <a href="https://discord.gg/kodelex" className="text-primary hover:underline">
                        Join our Discord server
                      </a>
                    </div>
                  </div>
                  <div>
                    <div className="font-medium">Response Time</div>
                    <div className="text-sm text-muted-foreground">
                      We typically respond within 24-48 hours
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Guidelines */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="text-sm text-muted-foreground space-y-2">
                    <li>• Be specific and detailed in your feedback</li>
                    <li>• Include steps to reproduce if reporting a bug</li>
                    <li>• Keep feedback constructive and respectful</li>
                    <li>• Check existing feedback to avoid duplicates</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeedbackPage;