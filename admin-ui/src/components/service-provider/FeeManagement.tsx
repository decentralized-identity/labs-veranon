import { BalanceDisplay } from './fee-management/BalanceDisplay'
import { DepositFunds } from './fee-management/DepositFunds'
import { WithdrawFunds } from './fee-management/WithdrawFunds'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export function FeeManagement() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fee Management</CardTitle>
        <CardDescription>
          Manage your balance for covering user verification transaction fees
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <BalanceDisplay />
          <div className="space-y-4">
            <DepositFunds />
            <WithdrawFunds />
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 