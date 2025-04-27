import React, { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Info, Check, AlertTriangle } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

export default function PaymentSettingsPage() {
  const { toast } = useToast();
  const [liveMode, setLiveMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [liveKeys, setLiveKeys] = useState({
    secretKey: '',
    publicKey: ''
  });
  const [testKeys, setTestKeys] = useState({
    secretKey: '',
    publicKey: ''
  });
  const [savedKeys, setSavedKeys] = useState({
    liveSecretKey: false,
    livePublicKey: false,
    testSecretKey: false,
    testPublicKey: false
  });

  // Load current settings
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await apiRequest('GET', '/api/admin/payment-settings');
        const data = await response.json();
        
        setLiveMode(data.liveMode || false);
        
        // Don't show actual keys, just whether they exist
        setSavedKeys({
          liveSecretKey: !!data.liveSecretKey,
          livePublicKey: !!data.livePublicKey,
          testSecretKey: !!data.testSecretKey,
          testPublicKey: !!data.testPublicKey
        });
        
        // Display placeholder for security
        if (data.livePublicKey) {
          setLiveKeys(prev => ({
            ...prev,
            publicKey: data.livePublicKey
          }));
        }
        
        if (data.testPublicKey) {
          setTestKeys(prev => ({
            ...prev,
            publicKey: data.testPublicKey
          }));
        }
      } catch (error) {
        console.error('Error fetching payment settings', error);
      }
    };
    
    fetchSettings();
  }, []);

  const handleSaveKeys = async (keyType: 'live' | 'test') => {
    setIsLoading(true);
    
    try {
      const payload = keyType === 'live' 
        ? { 
            liveSecretKey: liveKeys.secretKey || undefined,
            livePublicKey: liveKeys.publicKey || undefined
          }
        : {
            testSecretKey: testKeys.secretKey || undefined,
            testPublicKey: testKeys.publicKey || undefined
          };
      
      const response = await apiRequest('POST', '/api/admin/payment-settings', payload);
      
      if (response.ok) {
        toast({
          title: "Keys saved",
          description: `Paystack ${keyType} keys have been updated.`,
          variant: "default",
        });
        
        // Update saved status
        if (keyType === 'live') {
          setSavedKeys(prev => ({
            ...prev,
            liveSecretKey: !!liveKeys.secretKey,
            livePublicKey: !!liveKeys.publicKey
          }));
          
          // Clear secret key field for security
          setLiveKeys(prev => ({
            ...prev,
            secretKey: ''
          }));
        } else {
          setSavedKeys(prev => ({
            ...prev,
            testSecretKey: !!testKeys.secretKey,
            testPublicKey: !!testKeys.publicKey
          }));
          
          // Clear secret key field for security
          setTestKeys(prev => ({
            ...prev,
            secretKey: ''
          }));
        }
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save keys');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not save Paystack keys",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleLiveMode = async () => {
    setIsLoading(true);
    
    try {
      const newMode = !liveMode;
      const response = await apiRequest('POST', '/api/admin/payment-settings', {
        liveMode: newMode
      });
      
      if (response.ok) {
        setLiveMode(newMode);
        toast({
          title: newMode ? "Live Mode Activated" : "Test Mode Activated",
          description: newMode 
            ? "Payment system is now using live keys. Real transactions will be processed."
            : "Payment system is now in test mode. No real transactions will be processed.",
          variant: "default",
        });
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to change mode');
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Could not change payment mode",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-8">Payment Settings</h1>
      
      <div className="mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Payment Mode</CardTitle>
            <CardDescription>
              Toggle between test and live payment processing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="font-medium">{liveMode ? 'Live Mode' : 'Test Mode'}</div>
                <div className="text-sm text-muted-foreground">
                  {liveMode 
                    ? 'Real transactions are being processed. Charges will be made to customer cards.' 
                    : 'Test mode is active. No real payments will be processed.'}
                </div>
              </div>
              <Switch 
                checked={liveMode}
                onCheckedChange={handleToggleLiveMode}
                disabled={isLoading}
              />
            </div>
          </CardContent>
          <CardFooter>
            <div className="flex items-start gap-2 text-sm text-amber-600">
              <AlertTriangle className="h-4 w-4 mt-0.5" />
              <span>
                Make sure you have the correct API keys configured before enabling live mode.
              </span>
            </div>
          </CardFooter>
        </Card>
      </div>
      
      <Tabs defaultValue="live" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="live">Live Keys</TabsTrigger>
          <TabsTrigger value="test">Test Keys</TabsTrigger>
        </TabsList>
        
        <TabsContent value="live">
          <Card>
            <CardHeader>
              <CardTitle>Live API Keys</CardTitle>
              <CardDescription>
                Enter your Paystack live API keys for production use
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="liveSecretKey" className="flex items-center gap-2">
                  Secret Key
                  {savedKeys.liveSecretKey && (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Saved
                    </span>
                  )}
                </Label>
                <Input 
                  id="liveSecretKey"
                  type="password" 
                  placeholder="sk_live_..." 
                  value={liveKeys.secretKey}
                  onChange={e => setLiveKeys(prev => ({ ...prev, secretKey: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Never share your secret key. It should start with sk_live_</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="livePublicKey" className="flex items-center gap-2">
                  Public Key
                  {savedKeys.livePublicKey && (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Saved
                    </span>
                  )}
                </Label>
                <Input 
                  id="livePublicKey"
                  placeholder="pk_live_..." 
                  value={liveKeys.publicKey}
                  onChange={e => setLiveKeys(prev => ({ ...prev, publicKey: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Your public key should start with pk_live_</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-start gap-2 text-sm text-blue-600">
                <Info className="h-4 w-4 mt-0.5" />
                <span>Get your API keys from your Paystack dashboard</span>
              </div>
              <Button 
                onClick={() => handleSaveKeys('live')}
                disabled={isLoading}
              >
                Save Live Keys
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle>Test API Keys</CardTitle>
              <CardDescription>
                Enter your Paystack test API keys for development and testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="testSecretKey" className="flex items-center gap-2">
                  Test Secret Key
                  {savedKeys.testSecretKey && (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Saved
                    </span>
                  )}
                </Label>
                <Input 
                  id="testSecretKey"
                  type="password" 
                  placeholder="sk_test_..." 
                  value={testKeys.secretKey}
                  onChange={e => setTestKeys(prev => ({ ...prev, secretKey: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Never share your secret key. It should start with sk_test_</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="testPublicKey" className="flex items-center gap-2">
                  Test Public Key
                  {savedKeys.testPublicKey && (
                    <span className="inline-flex items-center text-xs text-green-600">
                      <Check className="h-3 w-3 mr-1" /> Saved
                    </span>
                  )}
                </Label>
                <Input 
                  id="testPublicKey"
                  placeholder="pk_test_..." 
                  value={testKeys.publicKey}
                  onChange={e => setTestKeys(prev => ({ ...prev, publicKey: e.target.value }))}
                />
                <p className="text-xs text-muted-foreground">Your public key should start with pk_test_</p>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between items-center">
              <div className="flex items-start gap-2 text-sm text-blue-600">
                <Info className="h-4 w-4 mt-0.5" />
                <span>Get your API keys from your Paystack dashboard</span>
              </div>
              <Button 
                onClick={() => handleSaveKeys('test')}
                disabled={isLoading}
              >
                Save Test Keys
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}