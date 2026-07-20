import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, Mail, Phone, MapPin, Send, Shield, Clock, CheckCircle2, Zap, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
  category: string;
  honeypot: string; // Hidden field for spam detection
  mathAnswer: string;
}

const Contact = () => {
  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    subject: '',
    message: '',
    category: 'general',
    honeypot: '',
    mathAnswer: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mathQuestion, setMathQuestion] = useState({ question: '', answer: 0 });
  const [formStartTime, setFormStartTime] = useState<number>(0);
  const { toast } = useToast();

  // Generate random math question for spam protection
  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1;
    const num2 = Math.floor(Math.random() * 10) + 1;
    const answer = num1 + num2;
    setMathQuestion({
      question: `What is ${num1} + ${num2}?`,
      answer
    });
    setFormStartTime(Date.now());
  }, []);

  const validateForm = (): string | null => {
    // Check honeypot field (should be empty)
    if (formData.honeypot.trim() !== '') {
      return 'Spam detected';
    }

    // Check math answer
    if (parseInt(formData.mathAnswer) !== mathQuestion.answer) {
      return 'Please solve the math question correctly';
    }

    // Check form submission speed (too fast = bot)
    const timeTaken = Date.now() - formStartTime;
    if (timeTaken < 5000) { // Less than 5 seconds
      return 'Please take more time to fill out the form';
    }

    // Basic field validation
    if (!formData.name.trim() || formData.name.length < 2) {
      return 'Please enter a valid name';
    }

    if (!formData.email.trim() || !formData.email.includes('@')) {
      return 'Please enter a valid email address';
    }

    if (!formData.subject.trim() || formData.subject.length < 5) {
      return 'Please enter a meaningful subject';
    }

    if (!formData.message.trim() || formData.message.length < 20) {
      return 'Please enter a detailed message (at least 20 characters)';
    }

    // Check for spam keywords
    const spamKeywords = ['seo', 'ranking', 'traffic', 'backlinks', 'promote', 'advertisement', 'marketing services', 'buy', 'sale', 'offer'];
    const messageText = formData.message.toLowerCase();
    const hasSpamKeywords = spamKeywords.some(keyword => messageText.includes(keyword));
    
    if (hasSpamKeywords) {
      return 'Your message appears to be promotional. Please contact us for business inquiries through our official channels.';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const validationError = validateForm();
    if (validationError) {
      toast({
        title: "Form Validation Error",
        description: validationError,
        variant: "destructive"
      });
      setIsSubmitting(false);
      return;
    }

    try {
      // Here you would normally send to your backend
      // For now, simulate submission
      await new Promise(resolve => setTimeout(resolve, 1500));

      setSubmitted(true);
      toast({
        title: "Message Sent Successfully!",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Submission Error",
        description: "There was an issue sending your message. Please try again or email us directly.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateFormData = (field: keyof ContactFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full text-center shadow-2xl border-0 bg-background/95 backdrop-blur">
          <CardContent className="pt-12 pb-12">
            <div className="mb-6">
              <CheckCircle2 className="h-20 w-20 text-green-500 mx-auto mb-4 animate-scale-in" />
              <h2 className="text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Message Sent Successfully!
              </h2>
            </div>
            
            <p className="text-muted-foreground mb-8 text-lg">
              Thank you for reaching out to us. Your message has been received and we'll respond within 24 hours.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="flex flex-col items-center p-4 rounded-lg bg-green-50 dark:bg-green-950/20">
                <CheckCircle2 className="h-8 w-8 text-green-500 mb-2" />
                <span className="text-sm font-medium">Verified</span>
                <span className="text-xs text-muted-foreground">Anti-spam passed</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20">
                <Clock className="h-8 w-8 text-blue-500 mb-2" />
                <span className="text-sm font-medium">Processing</span>
                <span className="text-xs text-muted-foreground">Review in progress</span>
              </div>
              <div className="flex flex-col items-center p-4 rounded-lg bg-purple-50 dark:bg-purple-950/20">
                <Mail className="h-8 w-8 text-purple-500 mb-2" />
                <span className="text-sm font-medium">Response</span>
                <span className="text-xs text-muted-foreground">Within 24 hours</span>
              </div>
            </div>

            <Button 
              onClick={() => window.location.href = '/'}
              className="bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300"
              size="lg"
            >
              Return to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
      {/* Animated Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-32 h-32 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-accent/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full text-primary text-sm font-medium mb-4">
            <Zap className="h-4 w-4" />
            Get In Touch
          </div>
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Contact Us
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Have questions, suggestions, or need support? We'd love to hear from you. 
            Our team is here to help make your manga reading experience amazing.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Information Cards */}
          <div className="space-y-6">
            {/* Quick Contact */}
            <Card className="border-0 shadow-xl bg-background/95 backdrop-blur hover:shadow-2xl transition-all duration-300 animate-fade-in delay-100">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                  </div>
                  Email Us
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-3">
                  Send us an email and we'll respond within 24 hours
                </p>
                <a 
                  href="mailto:ZAXMIllion@proton.me" 
                  className="text-primary hover:text-primary/80 font-medium transition-colors"
                >
                  ZAXMIllion@proton.me
                </a>
              </CardContent>
            </Card>

            {/* Response Time */}
            <Card className="border-0 shadow-xl bg-background/95 backdrop-blur hover:shadow-2xl transition-all duration-300 animate-fade-in delay-200">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <Clock className="h-5 w-5 text-secondary" />
                  </div>
                  Response Time
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">General Inquiries</span>
                    <Badge variant="secondary">24 hours</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Technical Support</span>
                    <Badge variant="secondary">12 hours</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Bug Reports</span>
                    <Badge variant="secondary">6 hours</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="border-0 shadow-xl bg-background/95 backdrop-blur hover:shadow-2xl transition-all duration-300 animate-fade-in delay-300">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-xl">
                  <div className="p-2 bg-green-500/10 rounded-lg">
                    <Shield className="h-5 w-5 text-green-500" />
                  </div>
                  Spam Protection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground text-sm">
                  This form is protected by advanced anti-spam measures to ensure only genuine messages reach us.
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-2xl bg-background/95 backdrop-blur animate-fade-in delay-400">
              <CardHeader className="pb-6">
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Send className="h-6 w-6 text-primary" />
                  </div>
                  Send us a Message
                </CardTitle>
                <CardDescription className="text-base">
                  Fill out the form below and we'll get back to you as soon as possible
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                      <Input
                        id="name"
                        required
                        value={formData.name}
                        onChange={(e) => updateFormData('name', e.target.value)}
                        placeholder="Your full name"
                        className="mt-1 h-11"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                      <Input
                        id="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => updateFormData('email', e.target.value)}
                        placeholder="your@email.com"
                        className="mt-1 h-11"
                      />
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="category" className="text-sm font-medium">Category</Label>
                      <Select 
                        value={formData.category} 
                        onValueChange={(value) => updateFormData('category', value)}
                      >
                        <SelectTrigger className="mt-1 h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general">General Inquiry</SelectItem>
                          <SelectItem value="support">Technical Support</SelectItem>
                          <SelectItem value="bug">Bug Report</SelectItem>
                          <SelectItem value="feature">Feature Request</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label htmlFor="subject" className="text-sm font-medium">Subject *</Label>
                      <Input
                        id="subject"
                        required
                        value={formData.subject}
                        onChange={(e) => updateFormData('subject', e.target.value)}
                        placeholder="Brief description of your inquiry"
                        className="mt-1 h-11"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="message" className="text-sm font-medium">Message *</Label>
                    <Textarea
                      id="message"
                      required
                      value={formData.message}
                      onChange={(e) => updateFormData('message', e.target.value)}
                      placeholder="Please provide details about your inquiry. The more information you provide, the better we can help you."
                      rows={6}
                      className="mt-1 resize-none"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Minimum 20 characters required
                    </p>
                  </div>

                  {/* Math Question for Spam Protection */}
                  <div className="bg-muted/50 p-4 rounded-lg border">
                    <Label htmlFor="mathAnswer" className="text-sm font-medium flex items-center gap-2">
                      <Shield className="h-4 w-4 text-green-500" />
                      Security Question *
                    </Label>
                    <p className="text-sm text-muted-foreground mb-2">
                      {mathQuestion.question}
                    </p>
                    <Input
                      id="mathAnswer"
                      type="number"
                      required
                      value={formData.mathAnswer}
                      onChange={(e) => updateFormData('mathAnswer', e.target.value)}
                      placeholder="Enter the answer"
                      className="w-32"
                    />
                  </div>

                  {/* Honeypot field - hidden from users */}
                  <div style={{ display: 'none' }}>
                    <Label htmlFor="honeypot">Leave this field empty</Label>
                    <Input
                      id="honeypot"
                      value={formData.honeypot}
                      onChange={(e) => updateFormData('honeypot', e.target.value)}
                      tabIndex={-1}
                      autoComplete="off"
                    />
                  </div>

                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <AlertCircle className="h-4 w-4" />
                    <span>
                      By submitting this form, you agree that we may contact you regarding your inquiry. 
                      We respect your privacy and will never share your information.
                    </span>
                  </div>

                  <Button 
                    type="submit" 
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full md:w-auto bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Sending Message...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Message
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center animate-fade-in delay-500">
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 rounded-2xl p-8 border">
            <Globe className="h-12 w-12 text-primary mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Need Immediate Help?</h3>
            <p className="text-muted-foreground mb-4">
              Check out our FAQ section or browse our help documentation for quick answers to common questions.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Button variant="outline" asChild>
                <a href="/help">Browse FAQ</a>
              </Button>
              <Button variant="outline" asChild>
                <a href="/support">Support Center</a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;