import { ArrowLeft } from "lucide-react"
import { Button } from "../ui/button"
import { Link } from "react-router-dom"
import { AddMembers } from "./members/AddMembers"
import { UpdateMembers } from "./members/UpdateMembers"
import { RemoveMembers } from "./members/RemoveMembers"

export function MembersManagement() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/manager" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Link>
        </Button>
      </div>

      <div className="space-y-8">
        <AddMembers />
        <UpdateMembers />
        <RemoveMembers />
      </div>
    </div>
  )
} 