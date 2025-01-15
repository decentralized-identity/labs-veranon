import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Shield, Users, CheckCircle } from "lucide-react"

type ServiceProviderOverviewProps = {
  serviceProviderId: number;
}

export function ServiceProviderOverview({ serviceProviderId }: ServiceProviderOverviewProps) {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Service Provider Overview</CardTitle>
        <CardDescription>Service Provider ID: {serviceProviderId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Shield className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">Active</p>
              <p className="text-sm text-muted-foreground">Service Provider Status</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Approved Managers</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <CheckCircle className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">0</p>
              <p className="text-sm text-muted-foreground">Total Verifications</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 