import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";

export default function AccountSettings() {
  // TODO: Get actual verification status from backend
  const isVerified = false;

  return (
    <div className="max-w-7xl mx-auto p-4">
      <Card>
        <CardHeader>
          <CardTitle>Identity Verification</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium">Account Status:</span>
              <span className={`text-sm ${isVerified ? 'text-green-500' : 'text-yellow-500'}`}>
                {isVerified ? 'Verified' : 'Not Verified'}
              </span>
            </div>
            <Button className="" disabled={isVerified}>
              Verify with VerAnon
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