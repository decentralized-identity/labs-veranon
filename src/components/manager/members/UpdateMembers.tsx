import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"

export function UpdateMembers() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Members</CardTitle>
        <CardDescription>
          Update existing member identity commitments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button>
          Update Selected Member
        </Button>
      </CardContent>
    </Card>
  )
} 