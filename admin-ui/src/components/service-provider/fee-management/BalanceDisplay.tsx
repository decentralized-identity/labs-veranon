import { useState, useEffect } from 'react'

export function BalanceDisplay() {
  const [currentBalance, setCurrentBalance] = useState('0')

  // TODO: Implement balance fetching logic
  useEffect(() => {
    // Fetch balance here
  }, [])

  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="text-sm font-medium">Current Balance</div>
      <div className="text-2xl font-bold">{currentBalance} ETH</div>
    </div>
  )
} 