import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Users, Shield, ArrowLeftRight } from "lucide-react"

export function GroupOverview() {
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Group Overview</CardTitle>
        <CardDescription>Group ID: 12</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">554</p>
              <p className="text-sm text-muted-foreground">Total Members</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Shield className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">Active</p>
              <p className="text-sm text-muted-foreground">Group Status</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <ArrowLeftRight className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">15</p>
              <p className="text-sm text-muted-foreground">Pending Actions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 