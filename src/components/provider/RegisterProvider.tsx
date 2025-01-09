import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { CONTRACT_ADDRESSES } from "../../contracts/addresses"
import { abi } from "../../contracts/artifacts/ServiceProvider.json"
import { Check, Loader2 } from "lucide-react"
import { useState, useEffect } from "react"

type RegisterProviderProps = {
  onRegistrationComplete?: () => void;
}

export function RegisterProvider({ onRegistrationComplete }: RegisterProviderProps) {
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  
  const { writeContract, data: hash, isPending } = useWriteContract()
  
  const { isLoading: isConfirming, isSuccess, isError } = useWaitForTransactionReceipt({
    hash,
  })

  useEffect(() => {
    if (isSuccess) {
      setShowSuccess(true)
      if (onRegistrationComplete) {
        onRegistrationComplete()
      }
      const timer = setTimeout(() => {
        setShowSuccess(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, onRegistrationComplete])

  useEffect(() => {
    if (isError) {
      setShowError(true)
      const timer = setTimeout(() => {
        setShowError(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isError])

  const handleRegister = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.SERVICE_PROVIDER,
      abi,
      functionName: 'register',
      args: [],
      chain: null,
      account: undefined,
    } as const)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Register as Service Provider</CardTitle>
        <CardDescription>
          Create your service provider account to manage verifications and approve managers
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <Button 
            onClick={handleRegister} 
            disabled={isPending || isConfirming}
            size="lg"
          >
            {(isPending || isConfirming) && (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {isPending ? 'Confirming Transaction...' : 
             isConfirming ? 'Registering...' : 
             'Register Now'}
          </Button>

          <div className={`flex items-center text-sm text-green-500 whitespace-nowrap ${showSuccess ? 'opacity-100' : 'opacity-0'} transition-all duration-1000`}>
            <Check className="mr-1 h-4 w-4" />
            Registration successful
          </div>

          <div className={`flex items-center text-sm text-red-500 whitespace-nowrap ${showError ? 'opacity-100' : 'opacity-0'} transition-all duration-1000`}>
            Registration failed
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 