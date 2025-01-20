import { useState } from 'react'
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"

export function WithdrawFunds() {
  const [withdrawAmount, setWithdrawAmount] = useState('')

  const handleWithdraw = async () => {
    // TODO: Implement withdraw logic
    console.log('Withdrawing:', withdrawAmount)
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Withdraw Funds</h3>
      <div className="flex space-x-2">
        <Input
          type="number"
          placeholder="Amount in ETH"
          value={withdrawAmount}
          onChange={(e) => setWithdrawAmount(e.target.value)}
        />
        <Button onClick={handleWithdraw}>Withdraw</Button>
      </div>
    </div>
  )
} 