import { useState } from "react"
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Textarea } from "../../ui/textarea"
import { CONTRACT_ADDRESSES } from "../../../contracts/addresses"
import { abi } from "../../../contracts/artifacts/Manager.json"
import { Check, Loader2 } from "lucide-react"
import { GroupUtils } from "../../../lib/groupUtils"

type ManagerData = {
  isRegistered: boolean;
  groupId: bigint;
}

export function RemoveMembers() {
  const [commitment, setCommitment] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const { address } = useAccount()
  
  const { data: managerData } = useReadContract({
    address: CONTRACT_ADDRESSES.MANAGER,
    abi,
    functionName: 'managers',
    args: address ? [address] : undefined,
  }) as { data: ManagerData | undefined }

  const { writeContract, isPending, isError } = useWriteContract()

  const handleRemoveMember = async () => {
    if (!address || !commitment.trim() || !managerData?.groupId) return

    try {
      const merkleProof = await GroupUtils.getMerkleProof(
        Number(managerData.groupId),
        commitment
      )

      await writeContract({
        address: CONTRACT_ADDRESSES.MANAGER,
        abi,
        functionName: 'removeMember',
        args: [
          managerData.groupId,
          BigInt(commitment),
          merkleProof.siblings
        ],
        account: null,
        chain: undefined,
      } as const, {
        onSuccess: () => {
          setCommitment("")
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
        },
        onError: (error) => {
          console.error('Failed to remove member:', error)
        }
      })
    } catch (error) {
      console.error('Error in handleRemoveMember:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Remove Members</CardTitle>
        <CardDescription>
          Remove members from your group
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter identity commitment to remove..."
          className="font-mono"
          value={commitment}
          onChange={(e) => setCommitment(e.target.value)}
          disabled={isPending}
        />
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleRemoveMember} 
            disabled={isPending || !commitment.trim()}
            variant="destructive"
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Remove Member
          </Button>
          
          {showSuccess && (
            <div className="flex items-center text-sm text-green-500">
              <Check className="mr-1 h-4 w-4" />
              Member removed successfully
            </div>
          )}

          {isError && (
            <div className="flex items-center text-sm text-red-500">
              Failed to remove member
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 