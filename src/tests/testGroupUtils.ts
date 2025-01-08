import { GroupUtils } from '../lib/groupUtils'
import { createPublicClient, http } from 'viem'
import { polygonAmoy } from 'viem/chains'
import { CONTRACT_ADDRESSES } from '../contracts/addresses'
import { abi } from '../contracts/artifacts/Manager.json'

// Create a public client
const publicClient = createPublicClient({
  chain: polygonAmoy,
  transport: http()
})

async function testCreateGroup() {
  const groupId = '1'

  try {
    const group = await GroupUtils.createGroup(groupId)
    console.log('Group successfully assembled.')
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

  } catch (error) {
    console.error('Error:', error)
  }
}

testCreateGroup() 