import { useWriteContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Button } from "../ui/button"
import { CONTRACT_ADDRESSES } from "../../contracts/addresses"
import { abi } from "../../contracts/artifacts/Manager.json"

export function RegisterManager() {
  const { writeContract, isPending } = useWriteContract()

  const handleRegister = () => {
    writeContract({
      address: CONTRACT_ADDRESSES.MANAGER,
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
        <CardTitle>Register as Manager</CardTitle>
        <CardDescription>
          Create your own group to manage member identities and control access to services
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