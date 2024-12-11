import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { UserPlus } from "lucide-react"
import { Link } from "react-router-dom"

export function QuickActions() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
      <Card>
        <CardHeader>
          <CardTitle>Member Management</CardTitle>
          <CardDescription>Add or remove members from your group</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button asChild>
            <Link to="/manager/members">
              <UserPlus className="mr-2 h-4 w-4" />
              Update Members
            </Link>
          </Button>
          {/* <Button variant="outline">View All Members</Button> */}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Group Management</CardTitle>
          <CardDescription>Transfer or update group settings</CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="outline">Transfer Management</Button>
        </CardContent>
      </Card>
    </div>
  )
} 