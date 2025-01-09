import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Textarea } from "../../ui/textarea"
import { CONTRACT_ADDRESSES } from "../../../contracts/addresses"
import { abi } from "../../../contracts/artifacts/Manager.json"
import { Check, Loader2 } from "lucide-react"
import { GroupUtils } from "../../../lib/groupUtils"

export function UpdateMembers() {
  const { address } = useAccount()
  const [oldCommitment, setOldCommitment] = useState("")
  const [newCommitment, setNewCommitment] = useState("")
  const [groupId, setGroupId] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    async function loadManagerData() {
      if (!address) return
      
      try {
        const { isManager, groupId } = await GroupUtils.isManager(address)
        if (isManager && groupId) {
          setGroupId(groupId)
        }
      } catch (error) {
        console.error('Error loading manager data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadManagerData()
  }, [address])

  const handleUpdateMember = async () => {
    if (!groupId || !oldCommitment.trim() || !newCommitment.trim()) return

    try {
      const merkleProof = await GroupUtils.getMerkleProof(
        Number(groupId),
        oldCommitment
      )

      writeContract({
        address: CONTRACT_ADDRESSES.MANAGER,
        abi,
        functionName: 'updateMember',
        args: [
          BigInt(groupId),
          BigInt(oldCommitment),
          BigInt(newCommitment),
          merkleProof.siblings
        ],
        chain: null,
        account: undefined,
      } as const)
    } catch (error) {
      console.error('Error in handleUpdateMember:', error)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setOldCommitment("")
      setNewCommitment("")
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  useEffect(() => {
    if (isError) {
      setShowError(true)
      const timer = setTimeout(() => {
        setShowError(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isError])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        </CardContent>
      </Card>
    )
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
          disabled={isPending || isConfirming}
        />
        <Textarea
          placeholder="Enter new identity commitment..."
          className="font-mono"
          value={newCommitment}
          onChange={(e) => setNewCommitment(e.target.value)}
          disabled={isPending || isConfirming}
        />
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleUpdateMember} 
            disabled={isPending || isConfirming || !oldCommitment.trim() || !newCommitment.trim()}
          >
            {(isPending || isConfirming) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isPending ? 'Confirming Transaction...' : 
             isConfirming ? 'Updating Member...' : 
             'Update Member'}
          </Button>
          
          <div className={`flex items-center text-sm text-green-500 whitespace-nowrap ${showSuccess ? 'opacity-100' : 'opacity-0'} transition-all duration-1000`}>
            <Check className="mr-1 h-4 w-4" />
            Member updated successfully
          </div>

          <div className={`flex items-center text-sm text-red-500 whitespace-nowrap ${showError ? 'opacity-100' : 'opacity-0'} transition-all duration-1000`}>
            Failed to update member
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 