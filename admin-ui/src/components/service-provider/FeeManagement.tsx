import { useState } from 'react'
import { BalanceDisplay } from './fee-management/BalanceDisplay'
import { DepositFunds } from './fee-management/DepositFunds'
import { WithdrawFunds } from './fee-management/WithdrawFunds'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export function FeeManagement() {
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  const handleTransactionSuccess = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sponsor Fee Management</CardTitle>
        <CardDescription>
          Manage your balance for covering user verification transaction fees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <BalanceDisplay refreshTrigger={refreshTrigger} />
          <div className="space-y-4">
            <DepositFunds onSuccess={handleTransactionSuccess} />
            <WithdrawFunds onSuccess={handleTransactionSuccess} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 