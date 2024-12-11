import { useAccount, useReadContract } from 'wagmi'
import { GroupOverview } from "./manager/GroupOverview"
import { QuickActions } from "./manager/QuickActions"
import { ActivityFeed } from "./manager/ActivityFeed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"
import { RegisterManager } from "./manager/RegisterManager"
import { CONTRACT_ADDRESSES } from "../contracts/addresses"
import { abi } from "../contracts/artifacts/Manager.json"

type ManagerData = {
  isRegistered: boolean;
  groupId: bigint;
}

export function Manager() {
  const { address, status } = useAccount()
  
  const { data: managerData, isLoading: isLoadingManager } = useReadContract({
    address: CONTRACT_ADDRESSES.MANAGER,
    abi,
    functionName: 'managers',
    args: address ? [address] : undefined,
  }) as { data: ManagerData | undefined, isLoading: boolean }

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
  if (status === 'connecting' || isLoadingManager) {
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
        <RegisterManager />
      </div>
    )
  }

  // Show manager dashboard if connected and registered
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GroupOverview groupId={managerData ? Number(managerData.groupId) : 0} />
      <QuickActions />
      <ActivityFeed />
    </div>
  )
} 