import { useState } from "react"
import { useAccount, useReadContract, useWriteContract } from 'wagmi'
import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Textarea } from "../../ui/textarea"
import { CONTRACT_ADDRESSES } from "../../../contracts/addresses"
import { abi } from "../../../contracts/artifacts/Manager.json"
import { Check, Loader2 } from "lucide-react"

type ManagerData = {
  isRegistered: boolean;
  groupId: bigint;
}

export function AddMembers() {
  const [commitments, setCommitments] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const { address } = useAccount()
  
  const { data: managerData } = useReadContract({
    address: CONTRACT_ADDRESSES.MANAGER,
    abi,
    functionName: 'managers',
    args: address ? [address] : undefined,
  }) as { data: ManagerData | undefined }

  const { writeContract, isPending, isError } = useWriteContract()

  const handleAddMembers = async () => {
    if (!address || !commitments.trim() || !managerData?.groupId) return

    try {
      const commitmentsList = commitments
        .split('\n')
        .map(c => c.trim())
        .filter(Boolean)
        .map(c => BigInt(c))

      if (commitmentsList.length === 1) {
        await writeContract({
          address: CONTRACT_ADDRESSES.MANAGER,
          abi,
          functionName: 'addMember',
          args: [managerData.groupId, BigInt(commitmentsList[0])],
          chain: null,
          account: undefined,
        } as const, {
          onSuccess: () => {
            setCommitments("")
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
          },
          onError: (error) => {
            console.error('Failed to add member:', error)
          }
        })
      } else if (commitmentsList.length > 1) {
        await writeContract({
          address: CONTRACT_ADDRESSES.MANAGER,
          abi,
          functionName: 'addMembers',
          args: [managerData.groupId, commitmentsList],
          chain: null,
          account: undefined,
        } as const, {
          onSuccess: () => {
            setCommitments("")
            setShowSuccess(true)
            setTimeout(() => setShowSuccess(false), 3000)
          },
          onError: (error) => {
            console.error('Failed to add members:', error)
          }
        })
      }
    } catch (error) {
      console.error('Error in handleAddMembers:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Members</CardTitle>
        <CardDescription>
          Add multiple identity commitments at once, one per line
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Textarea
          placeholder="Enter identity commitments..."
          className="min-h-[200px] font-mono"
          value={commitments}
          onChange={(e) => setCommitments(e.target.value)}
          disabled={isPending}
        />
        <div className="mt-4 flex items-center gap-4">
          <Button 
            onClick={handleAddMembers} 
            disabled={isPending || !commitments.trim()}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Add Members
          </Button>
          
          {/* Success indicator */}
          {showSuccess && (
            <div className="flex items-center text-sm text-green-500">
              <Check className="mr-1 h-4 w-4" />
              Members added successfully
            </div>
          )}

          {/* Error indicator */}
          {isError && (
            <div className="flex items-center text-sm text-red-500">
              Failed to add members
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 