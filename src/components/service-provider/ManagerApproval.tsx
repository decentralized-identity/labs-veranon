import { useState, useEffect } from "react"
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { CONTRACT_ADDRESSES } from "../../contracts/addresses"
import { abi } from "../../contracts/artifacts/ServiceProvider.json"
import { Check, Loader2 } from "lucide-react"

export function ManagerApproval() {
  const [managerId, setManagerId] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)

  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  const handleApproveManager = async () => {
    if (!managerId.trim()) return

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.SERVICE_PROVIDER,
        abi,
        functionName: 'setApprovedManager',
        args: [BigInt(managerId)],
        chain: null,
        account: undefined,
      } as const)
    } catch (error) {
      console.error('Error in handleApproveManager:', error)
    }
  }

  // Handle success state
  useEffect(() => {
    if (isSuccess) {
      setManagerId("")
      setShowSuccess(true)
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess])

  // Handle error state
  useEffect(() => {
    if (isError) {
      setShowError(true)
      const timer = setTimeout(() => {
        setShowError(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isError])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Approve Manager</CardTitle>
        <CardDescription>
          Approve a manager's group by their Manager ID
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Enter manager ID..."
          value={managerId}
          onChange={(e) => {
            const value = e.target.value.replace(/[^0-9]/g, '')
            setManagerId(value)
          }}
          type="number"
          disabled={isPending || isConfirming}
        />
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleApproveManager} 
            disabled={isPending || isConfirming || !managerId.trim()}
          >
            {(isPending || isConfirming) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isPending ? 'Confirming Transaction...' : 
             isConfirming ? 'Approving Manager...' : 
             'Approve Manager'}
          </Button>
          
          <div className={`flex items-center text-sm text-green-500 whitespace-nowrap ${showSuccess ? 'opacity-100' : 'opacity-0'} transition-all duration-1000`}>
            <Check className="mr-1 h-4 w-4" />
            Manager approved successfully
          </div>

          <div className={`flex items-center text-sm text-red-500 whitespace-nowrap ${showError ? 'opacity-100' : 'opacity-0'} transition-all duration-1000`}>
            Failed to approve manager
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 