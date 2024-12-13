import { useAccount, useReadContract } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { RegisterProvider } from "./provider/RegisterProvider"
import { ProviderOverview } from "./provider/ProviderOverview"
import { ManagerApproval } from "./provider/ManagerApproval"
import { VerificationSearch } from "./provider/VerificationSearch"
import { CONTRACT_ADDRESSES } from "../contracts/addresses"
import { abi } from "../contracts/artifacts/ServiceProvider.json"

export function Provider() {
  const { address, status } = useAccount()
  
  const { data: isRegistered, isLoading: isLoadingProvider } = useReadContract({
    address: CONTRACT_ADDRESSES.SERVICE_PROVIDER,
    abi,
    functionName: 'isRegistered',
    args: address ? [address] : undefined,
  })

  const { data: providerId } = useReadContract({
    address: CONTRACT_ADDRESSES.SERVICE_PROVIDER,
    abi,
    functionName: 'getServiceProviderId',
    args: address ? [address] : undefined,
    // enabled: isRegistered,
  })

  // Show connect wallet prompt if not connected
  if (status === 'disconnected') {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet using the button in the header to access the service provider dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Show loading state
  if (status === 'connecting' || isLoadingProvider) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <Skeleton className="h-[300px] w-full rounded-xl" />
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Show registration UI if not registered
  if (!isRegistered) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RegisterProvider />
      </div>
    )
  }

  // Show provider dashboard if connected and registered
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProviderOverview providerId={providerId ? Number(providerId) : 0} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ManagerApproval />
        <VerificationSearch />
      </div>
    </div>
  )
} 