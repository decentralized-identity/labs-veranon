import { useAccount } from 'wagmi'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { RegisterProvider } from "./provider/RegisterProvider"
import { GroupUtils } from "../lib/groupUtils"
import { useEffect, useState } from 'react'
import { ProviderOverview } from "./provider/ProviderOverview"
import { ManagerApproval } from "./provider/ManagerApproval"
import { VerificationSearch } from "./provider/VerificationSearch"

type ProviderData = {
  isRegistered: boolean;
  providerId?: string;
}

export function Provider() {
  const { address, status } = useAccount()
  const [providerData, setProviderData] = useState<ProviderData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkProviderStatus = async () => {
    if (!address) {
      setProviderData(null)
      setIsLoading(false)
      return
    }

    try {
      const { isProvider, providerId } = await GroupUtils.isServiceProvider(address)
      setProviderData({
        isRegistered: isProvider,
        providerId: providerId
      })
    } catch (error) {
      console.error('Error checking provider status:', error)
      setProviderData(null)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    setIsLoading(true)
    checkProviderStatus()
  }, [address])

  const handleRegistrationComplete = () => {
    checkProviderStatus()
  }

  // Show connect wallet prompt if not connected
  if (status === 'disconnected') {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet using the button in the header to access the provider dashboard
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
  if (!providerData?.isRegistered) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RegisterProvider onRegistrationComplete={handleRegistrationComplete} />
      </div>
    )
  }

  // Show provider dashboard if connected and registered
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <ProviderOverview providerId={parseInt(providerData.providerId || '0')} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <ManagerApproval />
        <VerificationSearch />
      </div>
    </div>
  )
} 