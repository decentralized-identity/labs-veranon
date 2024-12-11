import { useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Users, Shield, ArrowLeftRight } from "lucide-react"
import { CONTRACT_ADDRESSES } from "../../contracts/addresses"
import { abi } from "../../contracts/artifacts/Manager.json"

type GroupOverviewProps = {
  groupId: number;
}

export function GroupOverview({ groupId }: GroupOverviewProps) {
  // Get total members using getMerkleTreeSize
  const { data: totalMembers } = useReadContract({
    address: CONTRACT_ADDRESSES.MANAGER,
    abi,
    functionName: 'getMerkleTreeSize',
    args: [BigInt(groupId)],
  }) as { data: bigint | undefined }

  // Convert BigInt to number for display
  const memberCount = totalMembers ? Number(totalMembers) : 0

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Group Overview</CardTitle>
        <CardDescription>Group ID: {groupId}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-4 p-4 border rounded-lg">
            <Users className="h-8 w-8 text-muted-foreground" />
            <div>
              <p className="text-2xl font-bold">{memberCount}</p>
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
              <p className="text-2xl font-bold">N/A</p>
              <p className="text-sm text-muted-foreground">Pending Actions</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 