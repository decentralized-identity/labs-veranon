import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"

export function RemoveMembers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Remove Members</CardTitle>
        <CardDescription>
          Remove members from your group
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button variant="destructive">
          Remove Selected Member
        </Button>
      </CardContent>
    </Card>
  )
} 