import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import { http } from 'wagmi'
import { polygonAmoy } from 'wagmi/chains'

export const config = getDefaultConfig({
  appName: 'VerAnon',
  projectId: 'NOT_NEEDED_FOR_LOCAL_HARDHAT', // You'll need this for WalletConnect
  chains: [polygonAmoy],
  transports: {
    [polygonAmoy.id]: http(),
  },
}) 