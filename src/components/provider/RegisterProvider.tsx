import { useWriteContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { CONTRACT_ADDRESSES } from "../../contracts/addresses"
import { abi } from "../../contracts/artifacts/ServiceProvider.json"

export function RegisterProvider() {
  const { writeContract, isPending } = useWriteContract()

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
        <Button 
          onClick={handleRegister} 
          disabled={isPending}
          size="lg"
        >
          {isPending ? 'Registering...' : 'Register Now'}
        </Button>
      </CardContent>
    </Card>
  )
} 