import { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"
import { CONTRACT_ADDRESSES } from "../../../constants/addresses"
import { CONTRACT_ABI } from "../../../lib/contractABIs"
import { Loader2 } from "lucide-react"
import { parseEther } from 'viem'

interface DepositFundsProps {
  onSuccess: () => void
}

export function DepositFunds({ onSuccess }: DepositFundsProps) {
  const [depositAmount, setDepositAmount] = useState('')

  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  const handleDeposit = async () => {
    if (!depositAmount.trim()) return

    try {
      writeContract({
        address: CONTRACT_ADDRESSES.SERVICE_PROVIDER,
        abi: CONTRACT_ABI.SERVICE_PROVIDER,
        functionName: 'depositSponsorFunds',
        value: parseEther(depositAmount),
        chain: null,
        account: undefined,
      } as const)
    } catch (error) {
      console.error('Error in handleDeposit:', error)
    }
  }

  useEffect(() => {
    if (isSuccess) {
      setDepositAmount("")
      const timer = setTimeout(() => {
        onSuccess()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, onSuccess])

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Deposit Funds</h3>
      <div className="flex space-x-2">
        <Input
          type="number"
          placeholder="Amount in POL"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
          disabled={isPending || isConfirming}
        />
        <Button 
          onClick={handleDeposit} 
          disabled={isPending || isConfirming || !depositAmount.trim()}
        >
          {(isPending || isConfirming) && (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          )}
          {isPending ? 'Confirming...' : 
           isConfirming ? 'Depositing...' : 
           'Deposit'}
        </Button>
      </div>
    </div>
  )
} 