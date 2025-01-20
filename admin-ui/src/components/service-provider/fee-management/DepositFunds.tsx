import { useState } from 'react'
import { Input } from "../../ui/input"
import { Button } from "../../ui/button"

export function DepositFunds() {
  const [depositAmount, setDepositAmount] = useState('')

  const handleDeposit = async () => {
    // TODO: Implement deposit logic
    console.log('Depositing:', depositAmount)
  }

  return (
    <div>
      <h3 className="text-sm font-medium mb-2">Deposit Funds</h3>
      <div className="flex space-x-2">
        <Input
          type="number"
          placeholder="Amount in ETH"
          value={depositAmount}
          onChange={(e) => setDepositAmount(e.target.value)}
        />
        <Button onClick={handleDeposit}>Deposit</Button>
      </div>
    </div>
  )
} 