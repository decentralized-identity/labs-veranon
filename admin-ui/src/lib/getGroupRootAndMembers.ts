import { SubgraphUtils } from './subgraphUtils'
import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { CONTRACT_ADDRESSES } from '../constants/addresses'
import { abi } from '../../../contracts/artifacts/contracts/Manager.sol/Manager.json'

// Create a public client
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http()
})

async function getGroupRootAndMembers() {
  // Get group ID from command line arguments
  const groupId = process.argv[2] || '1' // Default to '1' if no argument provided
  
  if (!groupId.match(/^\d+$/)) {
    console.error('Please provide a valid numeric group ID')
    process.exit(1)
  }

  try {
    const group = await SubgraphUtils.createGroup(groupId)
    console.log('Group ID:', groupId)
    console.log('Computed Merkle Root:', group.root.toString())

    // Get on-chain merkle root, size, and member status
    const [onChainRoot, onChainSize] = await Promise.all([
      publicClient.readContract({
        address: CONTRACT_ADDRESSES.MANAGER,
        abi,
        functionName: 'getMerkleTreeRoot',
        args: [BigInt(groupId)]
      }),
      publicClient.readContract({
        address: CONTRACT_ADDRESSES.MANAGER,
        abi,
        functionName: 'getMerkleTreeSize',
        args: [BigInt(groupId)]
      })
    ])

    console.log('On-chain Merkle Root:', onChainRoot.toString())
    console.log('On-chain Merkle Tree Size:', onChainSize.toString())
    
    // Validate roots match
    if (group.root === onChainRoot) {
      console.log('✅ Merkle roots match!')
    } else {
      console.log('❌ Merkle roots do not match!')
    }

    // Log all identity commitments
    console.log('\nIdentity Commitments:')
    group.members.forEach((commitment, index) => {
      console.log(`Member ${index + 1}: ${commitment.toString()}`)
    })

  } catch (error) {
    console.error('Error:', error)
  }
}

getGroupRootAndMembers() 