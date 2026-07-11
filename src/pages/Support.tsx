import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Heart, Coffee, DollarSign, Check, ExternalLink } from 'lucide-react';

const KOFI_SUPPORT_URL = 'https://ko-fi.com/zaxmi';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    paypal: any;
  }
}

const Support = () => {
  const [amount, setAmount] = useState('5.00');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [paypalLoaded, setPaypalLoaded] = useState(false);
  const [lastTransaction, setLastTransaction] = useState<any>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Load PayPal SDK
    const script = document.createElement('script');
    script.src = "https://www.paypal.com/sdk/js?client-id=sb&currency=USD&disable-funding=credit,card";
    script.async = true;
    script.onload = () => {
      setPaypalLoaded(true);
      initializePayPal();
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const initializePayPal = () => {
    if (window.paypal && paypalLoaded) {
      window.paypal.Buttons({
        createOrder: (data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount
              },
              description: message || 'Support for MangaReader'
            }]
          });
        },
        onApprove: async (data: any, actions: any) => {
          setIsLoading(true);
          try {
            const order = await actions.order.capture();
            await logTransaction(order);
            setLastTransaction(order);
            
            toast({
              title: "Thank you for your support! ❤️",
              description: `Your donation of $${amount} has been processed successfully.`,
            });
          } catch (error) {
            console.error('PayPal error:', error);
            toast({
              title: "Payment Error",
              description: "There was an issue processing your payment. Please try again.",
              variant: "destructive",
            });
          } finally {
            setIsLoading(false);
          }
        },
        onError: (err: any) => {
          console.error('PayPal error:', err);
          toast({
            title: "Payment Error",
            description: "There was an issue with PayPal. Please try again.",
            variant: "destructive",
          });
          setIsLoading(false);
        }
      }).render('#paypal-button-container');
    }
  };

  const logTransaction = async (order: any) => {
    try {
      const { error } = await supabase
        .from('donations')
        .insert({
          transaction_id: order.id,
          email: email || 'anonymous@supporter.com',
          amount: parseFloat(amount),
          message: message || null,
          paypal_order_data: order,
          status: 'completed'
        });

      if (error) {
        console.error('Error logging transaction:', error);
      }
    } catch (error) {
      console.error('Error logging transaction:', error);
    }
  };

  // Re-render PayPal button when amount changes
  useEffect(() => {
    if (paypalLoaded) {
      const container = document.getElementById('paypal-button-container');
      if (container) {
        container.innerHTML = '';
        initializePayPal();
      }
    }
  }, [amount, paypalLoaded]);

  const predefinedAmounts = ['3.00', '5.00', '10.00', '25.00'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="max-w-4xl mx-auto p-6 space-y-8">
        {/* Hero Section */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Heart className="h-8 w-8 text-manga-red animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-accent bg-clip-text text-transparent">
              Support Our Work
            </h1>
          </div>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Help us keep the lights on and continue providing the best manga reading experience. 
            Your support means everything to us!
          </p>
        </div>

        {lastTransaction && (
          <Card className="p-6 bg-gradient-to-r from-green-500/10 to-emerald-500/10 border-green-500/20">
            <div className="flex items-center gap-3">
              <Check className="h-6 w-6 text-green-500" />
              <div>
                <h3 className="font-semibold text-green-700 dark:text-green-400">
                  Donation Successful!
                </h3>
                <p className="text-sm text-green-600 dark:text-green-300">
                  Transaction ID: {lastTransaction.id}
                </p>
              </div>
            </div>
          </Card>
        )}

        <Card className="p-6 bg-gradient-to-r from-[#ff5f5f]/10 to-primary/10 border-[#ff5f5f]/30">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-center sm:text-left">
              <h2 className="text-xl font-semibold flex items-center justify-center sm:justify-start gap-2">
                <Coffee className="h-5 w-5 text-[#ff5f5f]" />
                Support on Ko-fi
              </h2>
              <p className="text-muted-foreground mt-1">
                Buy us a coffee and help keep Zax Million running.
              </p>
            </div>
            <Button
              asChild
              className="bg-[#ff5f5f] hover:bg-[#ff5f5f]/90 text-white shrink-0"
            >
              <a href={KOFI_SUPPORT_URL} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4 mr-2" />
                Support on Ko-fi
              </a>
            </Button>
          </div>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Donation Form */}
          <Card className="p-6 bg-gradient-card border-border/50">
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-4">
                <Coffee className="h-5 w-5 text-manga-red" />
                <h2 className="text-2xl font-semibold">Make a Donation</h2>
              </div>

              {/* Amount Selection */}
              <div className="space-y-3">
                <Label className="text-sm font-medium">Choose Amount (USD)</Label>
                <div className="grid grid-cols-2 gap-2">
                  {predefinedAmounts.map((preset) => (
                    <Button
                      key={preset}
                      variant={amount === preset ? "default" : "outline"}
                      onClick={() => setAmount(preset)}
                      className={amount === preset ? "bg-gradient-accent" : ""}
                    >
                      ${preset}
                    </Button>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    min="1"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="Custom amount"
                    className="flex-1"
                  />
                </div>
              </div>

              {/* Optional Fields */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-sm font-medium">
                    Email (Optional)
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    For donation receipt and updates
                  </p>
                </div>

                <div>
                  <Label htmlFor="message" className="text-sm font-medium">
                    Message (Optional)
                  </Label>
                  <Textarea
                    id="message"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Leave a message of support..."
                    className="mt-1 min-h-[80px]"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    {message.length}/500 characters
                  </p>
                </div>
              </div>

              {/* PayPal Button */}
              <div className="border-t pt-4">
                <div 
                  id="paypal-button-container" 
                  className={`min-h-[50px] ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}
                />
                {!paypalLoaded && (
                  <div className="text-center text-muted-foreground py-4">
                    Loading PayPal...
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Why Support Section */}
          <div className="space-y-6">
            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Heart className="h-5 w-5 text-manga-red" />
                Why Support Us?
              </h3>
              <div className="space-y-3 text-muted-foreground">
                <p>
                  • <strong>Server Costs:</strong> Keep our platform fast and reliable
                </p>
                <p>
                  • <strong>Development:</strong> New features and improvements
                </p>
                <p>
                  • <strong>Quality Content:</strong> Maintain high-quality manga library
                </p>
                <p>
                  • <strong>Ad-Free Experience:</strong> Reduce dependency on advertisements
                </p>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-xl font-semibold mb-4">
                What You Get
              </h3>
              <div className="space-y-2 text-muted-foreground">
                <p>✓ Our eternal gratitude</p>
                <p>✓ Better platform for everyone</p>
                <p>✓ Faster loading times</p>
                <p>✓ New features priority access</p>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-card border-border/50">
              <h3 className="text-xl font-semibold mb-4">
                Secure & Safe
              </h3>
              <p className="text-muted-foreground">
                Donations are processed securely through PayPal or Ko-fi.
                We never store your payment information.
              </p>
            </Card>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center text-sm text-muted-foreground mt-8">
          <p>
            Thank you for being part of our community! Every contribution, 
            no matter the size, helps us continue our mission.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Support;