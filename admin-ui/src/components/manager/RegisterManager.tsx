import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { CONTRACT_ADDRESSES } from "../../constants/addresses"
import { CONTRACT_ABI } from "../../lib/contractABIs"
import { useEffect } from 'react'

type RegisterManagerProps = {
  onRegistrationComplete?: () => void;
}

export function RegisterManager({ onRegistrationComplete }: RegisterManagerProps) {
  const { writeContract, data: hash, isPending } = useWriteContract()
  
  // Watch for transaction confirmation
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({
    hash,
  })

  // Move this into a useEffect to handle the success case
  useEffect(() => {
    if (isSuccess && onRegistrationComplete) {
      onRegistrationComplete()
    }
  }, [isSuccess, onRegistrationComplete])

  const handleRegister = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.MANAGER,
      abi: CONTRACT_ABI.MANAGER,
      functionName: 'register',
      args: [],
      chain: null,
      account: undefined,
    } as const)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register as Manager</CardTitle>
        <CardDescription>
          Create your own group to manage member identities and control access to services
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={handleRegister} 
          disabled={isPending || isConfirming}
          size="lg"
        >
          {isPending ? 'Confirming Transaction...' : 
           isConfirming ? 'Registering...' : 
           'Register Now'}
        </Button>
      </CardContent>
    </Card>
  )
} 