import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { BACKEND_URL } from "@/constants/urls";
import { SERVICE_PROVIDER_ID } from "@/constants/ids";
import { useAuth } from "@/contexts/AuthContext";

export default function AccountSettings() {
  const { isVerified, token } = useAuth();
  const [error, setError] = useState<string | null>(null);
  
  const handleVerifyClick = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/protected`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      const data = await response.json();
      const userId = data.user.userId;
      
      const deepLink = `com.anonymous.veranonmobile://verify?serviceProviderId=${encodeURIComponent(SERVICE_PROVIDER_ID)}&accountId=${encodeURIComponent(userId)}`;
      window.location.href = deepLink;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get account ID');
      console.error('Error getting account ID:', err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className={`h-2 w-2 rounded-full ${isVerified ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm">
                {isVerified ? 'Account Verified' : 'Account Not Verified'}
              </span>
            </div>

            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}
            
            <Button 
              disabled={isVerified}
              onClick={handleVerifyClick}
            >
              Verify with VerAnon
            </Button>
            
            {!isVerified && (
              <p className="text-sm text-muted-foreground">
                Be sure to install the VerAnon mobile app and access this page from your mobile browser
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 