import { useState } from "react"
import { useWriteContract } from 'wagmi'
import { Button } from "../ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Input } from "../ui/input"
import { CONTRACT_ADDRESSES } from "../../contracts/addresses"
import { abi } from "../../contracts/artifacts/ServiceProvider.json"
import { Check, Loader2 } from "lucide-react"

export function ManagerApproval() {
  const [managerId, setManagerId] = useState("")
  const [showSuccess, setShowSuccess] = useState(false)
  const { writeContract, isPending, isError } = useWriteContract()

  const handleApproveManager = async () => {
    if (!managerId.trim()) return

    try {
      await writeContract({
        address: CONTRACT_ADDRESSES.SERVICE_PROVIDER,
        abi,
        functionName: 'setApprovedManager',
        args: [BigInt(managerId)],
        chain: null,
        account: undefined,
      } as const, {
        onSuccess: () => {
          setManagerId("")
          setShowSuccess(true)
          setTimeout(() => setShowSuccess(false), 3000)
        },
        onError: (error) => {
          console.error('Failed to approve manager:', error)
        }
      })
    } catch (error) {
      console.error('Error in handleApproveManager:', error)
    }
  }

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
            // Only allow numbers
            const value = e.target.value.replace(/[^0-9]/g, '')
            setManagerId(value)
          }}
          type="number"
          disabled={isPending}
        />
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleApproveManager} 
            disabled={isPending || !managerId.trim()}
          >
            {isPending && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            Approve Manager
          </Button>
          
          {showSuccess && (
            <div className="flex items-center text-sm text-green-500">
              <Check className="mr-1 h-4 w-4" />
              Manager approved successfully
            </div>
          )}

          {isError && (
            <div className="flex items-center text-sm text-red-500">
              Failed to approve manager
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 