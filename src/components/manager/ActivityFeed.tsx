import { Alert, AlertDescription, AlertTitle } from "../ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export function ActivityFeed() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>Latest changes to your group</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertTitle>No Recent Activity</AlertTitle>
          <AlertDescription>
            Member additions and removals will appear here
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
} 