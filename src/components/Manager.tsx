import { useAccount } from 'wagmi'
import { GroupOverview } from "./manager/GroupOverview"
import { QuickActions } from "./manager/QuickActions"
import { ActivityFeed } from "./manager/ActivityFeed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { RegisterManager } from "./manager/RegisterManager"
import { GroupUtils } from "../lib/groupUtils"
import { useEffect, useState, useCallback } from 'react'

type ManagerData = {
  isRegistered: boolean;
  groupId: string | undefined;
}

export function Manager() {
  const { address, status } = useAccount()
  const [managerData, setManagerData] = useState<ManagerData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkManagerStatus = useCallback(async () => {
    if (!address) {
      setManagerData(null)
      setIsLoading(false)
      return
    }

    try {
      const { isManager, groupId } = await GroupUtils.isManager(address)
      setManagerData({
        isRegistered: isManager,
        groupId: groupId
      })
    } catch (error) {
      console.error('Error checking manager status:', error)
      setManagerData(null)
    } finally {
      setIsLoading(false)
    }
  }, [address])

  useEffect(() => {
    setIsLoading(true)
    checkManagerStatus()
  }, [checkManagerStatus])

  const handleRegistrationComplete = useCallback(() => {
    // Immediately check the subgraph when transaction is confirmed
    checkManagerStatus()
    
    // If we need the timeout later, we can uncomment this:
    // await new Promise(resolve => setTimeout(resolve, 5000))
    // checkManagerStatus()
  }, [checkManagerStatus])

  // Show connect wallet prompt if not connected
  if (status === 'disconnected') {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card>
          <CardHeader>
            <CardTitle>Connect Wallet</CardTitle>
            <CardDescription>
              Please connect your wallet using the button in the header to access the manager dashboard
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  // Show loading state while connecting or fetching manager data
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
  if (!managerData?.isRegistered) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <RegisterManager onRegistrationComplete={handleRegistrationComplete} />
      </div>
    )
  }

  // Show manager dashboard if connected and registered
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GroupOverview groupId={managerData.groupId ? Number(managerData.groupId) : 0} />
      <QuickActions />
      <ActivityFeed />
    </div>
  )
} 