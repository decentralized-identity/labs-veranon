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

export function UpdateMembers() {
  const [oldCommitment, setOldCommitment] = useState("")
  const [newCommitment, setNewCommitment] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const { address } = useAccount()
  
  const { data: managerData } = useReadContract({
    address: CONTRACT_ADDRESSES.MANAGER,
    abi,
    functionName: 'managers',
    args: address ? [address] : undefined,
  }) as { data: ManagerData | undefined }

  const { writeContract, isPending, isError } = useWriteContract()

  const handleUpdateMember = async () => {
    if (!address || !oldCommitment.trim() || !newCommitment.trim() || !managerData?.groupId) return

    try {
      const merkleProof = await GroupUtils.getMerkleProof(
        Number(managerData.groupId),
        oldCommitment
      )

      await writeContract({
        address: CONTRACT_ADDRESSES.MANAGER,
        abi,
        functionName: 'updateMember',
        args: [
          managerData.groupId,
          BigInt(oldCommitment),
          BigInt(newCommitment),
          merkleProof.siblings
        ],
        account: null,
        chain: undefined,
      } as const, {
        onSuccess: () => {
          setOldCommitment("")
          setNewCommitment("")
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
        },
        onError: (error) => {
          console.error('Failed to update member:', error)
        }
      })
    } catch (error) {
      console.error('Error in handleUpdateMember:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Update Members</CardTitle>
        <CardDescription>
          Update existing member identity commitments
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Enter old identity commitment..."
          className="font-mono"
          value={oldCommitment}
          onChange={(e) => setOldCommitment(e.target.value)}
          disabled={isPending}
        />
        <Textarea
          placeholder="Enter new identity commitment..."
          className="font-mono"
          value={newCommitment}
          onChange={(e) => setNewCommitment(e.target.value)}
          disabled={isPending}
        />
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleUpdateMember} 
            disabled={isPending || !oldCommitment.trim() || !newCommitment.trim()}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Update Member
          </Button>
          
          {showSuccess && (
            <div className="flex items-center text-sm text-green-500">
              <Check className="mr-1 h-4 w-4" />
              Member updated successfully
            </div>
          )}

          {isError && (
            <div className="flex items-center text-sm text-red-500">
              Failed to update member
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 