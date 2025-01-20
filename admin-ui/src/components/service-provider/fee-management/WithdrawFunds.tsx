import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { CONTRACT_ADDRESSES } from "../../../constants/addresses"
import { CONTRACT_ABI } from "../../../lib/contractABIs"
import { Loader2 } from "lucide-react"
import { parseEther } from 'viem'

interface WithdrawFundsProps {
  onSuccess: () => void
}

export function WithdrawFunds({ onSuccess }: WithdrawFundsProps) {
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleWithdraw = async () => {
    if (!withdrawAmount.trim()) return

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.SERVICE_PROVIDER,
        abi: CONTRACT_ABI.SERVICE_PROVIDER,
        functionName: 'withdrawSponsorFunds',
        args: [parseEther(withdrawAmount)],
        chain: null,
        account: undefined,
      } as const)
    } catch (error) {
      console.error('Error in handleWithdraw:', error)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setWithdrawAmount("")
      const timer = setTimeout(() => {
        onSuccess()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, onSuccess])

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Withdraw Funds</h3>
      <div className="flex space-x-2">
        <Input
          type="number"
          placeholder="Amount in POL"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
          disabled={isPending || isConfirming}
        />
        <Button 
          onClick={handleWithdraw} 
          disabled={isPending || isConfirming || !withdrawAmount.trim()}
        >
          {(isPending || isConfirming) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isPending ? 'Confirming...' : 
           isConfirming ? 'Withdrawing...' : 
           'Withdraw'}
        </Button>
      </div>
    </div>
  )
} 