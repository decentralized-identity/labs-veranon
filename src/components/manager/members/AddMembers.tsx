import { useState, useEffect } from "react"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from "../../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../ui/card"
import { Textarea } from "../../ui/textarea"
import { CONTRACT_ADDRESSES } from "../../../contracts/addresses"
import { abi } from "../../../contracts/artifacts/Manager.json"
import { Check, Loader2 } from "lucide-react"
import { GroupUtils } from "../../../lib/groupUtils"

export function AddMembers() {
  const { address } = useAccount()
  const [commitments, setCommitments] = useState("")
  const [groupId, setGroupId] = useState<string>()
  const [isLoading, setIsLoading] = useState(true)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  // Load manager data when component mounts
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

  const handleAddMembers = async () => {
    if (!groupId || !commitments.trim()) return

    try {
      const commitmentsList = commitments
        .split('\n')
        .map(c => c.trim())
        .filter(Boolean)
        .map(c => BigInt(c))

      if (commitmentsList.length === 1) {
        writeContract({
          address: CONTRACT_ADDRESSES.MANAGER,
          abi,
          functionName: 'addMember',
          args: [BigInt(groupId), commitmentsList[0]],
          chain: null,
          account: undefined,
        } as const)
      } else if (commitmentsList.length > 1) {
        writeContract({
          address: CONTRACT_ADDRESSES.MANAGER,
          abi,
          functionName: 'addMembers',
          args: [BigInt(groupId), commitmentsList],
          chain: null,
          account: undefined,
        } as const)
      }
    } catch (error) {
      console.error('Error in handleAddMembers:', error)
    }
  }

  // Move the success handler into a useEffect
  useEffect(() => {
    if (isSuccess) {
      setCommitments("")
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  // Handle success/error states
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
          disabled={isPending || isConfirming}
        />
        <div className="mt-4 flex items-center gap-4">
          <Button 
            onClick={handleAddMembers} 
            disabled={isPending || isConfirming || !commitments.trim()}
          >
            {(isPending || isConfirming) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isPending ? 'Confirming Transaction...' : 
             isConfirming ? 'Adding Members...' : 
             'Add Members'}
          </Button>
          
          <div className={`flex items-center text-sm text-green-500 whitespace-nowrap ${showSuccess ? 'opacity-100' : 'opacity-0'} transition-all duration-1000`}>
            <Check className="mr-1 h-4 w-4" />
            Members added successfully
          </div>

          <div className={`flex items-center text-sm text-red-500 whitespace-nowrap ${showError ? 'opacity-100' : 'opacity-0'} transition-all duration-1000`}>
            Failed to add members
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 