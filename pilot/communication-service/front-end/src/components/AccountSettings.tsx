import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import { BACKEND_URL } from "@/constants/urls";
import { SERVICE_PROVIDER_ID } from "@/constants/ids";

export default function AccountSettings() {
  const isVerified = false;
  const [accountId, setAccountId] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchAccountId = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No authentication token found');
        }

        const response = await fetch(`${BACKEND_URL}/protected`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch account data');
        }

        const data = await response.json();
        setAccountId(data.user.userId.toString());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch account ID');
        console.error('Error fetching account ID:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAccountId();
  }, []);

  const handleVerifyClick = () => {
    const deepLink = `com.anonymous.veranonmobile://verify?serviceProviderId=${encodeURIComponent(SERVICE_PROVIDER_ID)}&accountId=${encodeURIComponent(accountId)}`;
    window.location.href = deepLink;
  };

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Account Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            {error && (
              <p className="text-red-500 text-sm">
                {error}
              </p>
            )}
            
            <Button 
              className="" 
              disabled={isVerified || isLoading || !accountId}
              onClick={handleVerifyClick}
            >
              {isLoading ? 'Loading...' : 'Verify with VerAnon'}
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Be sure to install the VerAnon mobile app and access this page from your mobile browser
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 