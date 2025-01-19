import { useAccount } from 'wagmi'
import { Card, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { RegisterServiceProvider } from "./service-provider/RegisterServiceProvider"
import { SubgraphUtils } from "../lib/subgraphUtils"
import { useEffect, useState } from 'react'
import { ServiceProviderOverview } from "./service-provider/ServiceProviderOverview"
import { ManagerApproval } from "./service-provider/ManagerApproval"
import { VerificationSearch } from "./service-provider/VerificationSearch"

type ServiceProviderData = {
  isRegistered: boolean;
  serviceProviderId?: string;
}

export function ServiceProvider() {
  const { address, status } = useAccount()
  const [serviceProviderData, setServiceProviderData] = useState<ServiceProviderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkServiceProviderStatus = async () => {
    if (!address) {
      setServiceProviderData(null)
      setIsLoading(false)
      return
    }

    try {
      const { isServiceProvider, serviceProviderId } = await SubgraphUtils.isServiceProvider(address)
      setServiceProviderData({
        isRegistered: isServiceProvider,
        serviceProviderId: serviceProviderId
      })
    } catch (error) {
      console.error('Error checking service provider status:', error)
      setServiceProviderData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    checkServiceProviderStatus()
  }, [address])

  const handleRegistrationComplete = () => {
    checkServiceProviderStatus()
  }

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

  // Show loading state while connecting or fetching provider data
  if (status === 'connecting' || isLoading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          <Skeleton className="h-[200px] w-full rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[160px] w-full rounded-xl" />
            <Skeleton className="h-[160px] w-full rounded-xl" />
          </div>
          <Skeleton className="h-[200px] w-full rounded-xl" />
        </div>
      </div>
    )
  }

  // Show registration UI if not registered
  if (!serviceProviderData?.isRegistered) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RegisterServiceProvider onRegistrationComplete={handleRegistrationComplete} />
      </div>
    )
  }

  // Show provider dashboard if connected and registered
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ServiceProviderOverview serviceProviderId={parseInt(serviceProviderData.serviceProviderId || '0')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ManagerApproval />
        <VerificationSearch />
      </div>
    </div>
  )
} 