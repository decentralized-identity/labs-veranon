import { useAccount } from 'wagmi'
import { GroupOverview } from "./manager/GroupOverview"
import { QuickActions } from "./manager/QuickActions"
import { ActivityFeed } from "./manager/ActivityFeed"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card"
import { Skeleton } from "./ui/skeleton"

export function Manager() {
  const { status } = useAccount()

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

  // Show loading state while connecting
  if (status === 'connecting') {
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

  // Show manager dashboard if connected
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GroupOverview />
      <QuickActions />
      <ActivityFeed />
    </div>
  )
} 