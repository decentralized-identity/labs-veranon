import { useState, useEffect } from 'react'
import { useAccount } from 'wagmi'
import { SubgraphUtils } from '../../../lib/subgraphUtils'
import { formatEther } from 'viem'

interface BalanceDisplayProps {
  refreshTrigger: number
}

export function BalanceDisplay({ refreshTrigger }: BalanceDisplayProps) {
  const { address } = useAccount()
  const [currentBalance, setCurrentBalance] = useState('0')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBalance = async () => {
      if (!address) return

      try {
        const balance = await SubgraphUtils.getSponsorFeeBalance(address)
        if (balance !== null) {
          // Convert wei to POL and format for display
          setCurrentBalance(formatEther(balance))
        } else {
          setCurrentBalance('0')
        }
      } catch (error) {
        console.error('Error fetching sponsor fee balance:', error)
        setCurrentBalance('0')
      } finally {
        setIsLoading(false)
      }
    }

    fetchBalance()
  }, [address, refreshTrigger])

  return (
    <div className="p-4 bg-muted rounded-lg">
      <div className="text-sm font-medium">Current Balance</div>
      <div className="text-2xl font-bold">
        {isLoading ? 'Loading...' : `${currentBalance} POL`}
      </div>
    </div>
  )
} 