import { GroupOverview } from "./manager/GroupOverview"
import { QuickActions } from "./manager/QuickActions"
import { ActivityFeed } from "./manager/ActivityFeed"

export function Manager() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <GroupOverview />
      <QuickActions />
      <ActivityFeed />
    </div>
  )
} 