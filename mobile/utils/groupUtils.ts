import { request, gql } from 'graphql-request'
import { Group } from '@semaphore-protocol/group'
import { SUBGRAPH_URL } from '../constants/subgraph'

const GROUP_MEMBERS_QUERY = gql`
  query GetGroupMembers($groupId: ID!) {
    group(id: $groupId) {
      id
      merkleTree {
        size
        root
        depth
      }
      members(orderBy: index) {
        id
        index
        identityCommitment
      }
    }
  }
`

type GroupMember = {
  id: string
  index: number
  identityCommitment: string
}

type GroupQueryResponse = {
  group: {
    id: string
    merkleTree: {
      size: number
      root: string
      depth: number
    }
    members: GroupMember[]
  }
}

export class GroupUtils {
  /**
   * Fetches all active members for a given group ID
   */
  static async fetchGroupMembers(groupId: string | number): Promise<GroupMember[]> {
    try {
        const variables = { groupId: groupId.toString() };

        const data = await request<GroupQueryResponse>(
            SUBGRAPH_URL, 
            GROUP_MEMBERS_QUERY, 
            variables
        );
        
        if (!data?.group) {
            return [];
        }

        return data.group.members || [];
    } catch (error) {
        console.error('Error fetching group members:', error);
        throw error;
    }
  }

  /**
   * Creates a Semaphore Group instance with the current members
   */
  static async createGroup(groupId: string | number): Promise<Group> {
    const members = await this.fetchGroupMembers(groupId)
    const group = new Group()
    
    // Add members in order of their indices
    members
      .sort((a, b) => a.index - b.index)
      .forEach(member => {
        group.addMember(BigInt(member.identityCommitment))
      })

    return group
  }

  /**
   * Gets merkle proof for a specific member
   */
  static async getMerkleProof(groupId: string | number, identityCommitment: string | bigint): Promise<{
    siblings: bigint[]
    index: number
  }> {
    const members = await this.fetchGroupMembers(groupId)
    const group = await this.createGroup(groupId)
    
    // Find member index
    const memberIndex = members.findIndex(
      m => BigInt(m.identityCommitment) === BigInt(identityCommitment)
    )
    
    if (memberIndex === -1) {
      throw new Error('Member not found in group')
    }

    return group.generateMerkleProof(memberIndex)
  }
} 