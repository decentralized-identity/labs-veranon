import { request, gql } from 'graphql-request'
import { Group } from '@semaphore-protocol/group'

const SUBGRAPH_URL = 'https://api.studio.thegraph.com/query/97956/veranon-test-1/v0.3.0'

const GROUP_MEMBERS_QUERY = gql`
  query GetGroupMembers($groupId: ID!) {
    group(id: $groupId) {
      id
      memberCount
      merkleTreeRoot
      members(where: { active: true }, orderBy: index, orderDirection: asc) {
        id
        index
        identityCommitment
      }
    }
  }
`

const GROUP_MEMBER_COUNT_QUERY = gql`
  query GetGroupMemberCount($groupId: ID!) {
    group(id: $groupId) {
      memberCount
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
    memberCount: number
    merkleTreeRoot: string
    members: GroupMember[]
  }
}

type GroupMemberCountResponse = {
  group: {
    memberCount: number
  }
}

export class GroupUtils {
  /**
   * Fetches all active members for a given group ID
   */
  static async fetchGroupMembers(groupId: string | number): Promise<GroupMember[]> {
    try {
      const data = await request<GroupQueryResponse>(
        SUBGRAPH_URL, 
        GROUP_MEMBERS_QUERY, 
        { groupId: groupId.toString() }
      )
      return data.group.members
    } catch (error) {
      console.error('Error fetching group members:', error)
      throw error
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

  /**
   * Gets the active member count for a group
   */
  static async getActiveMemberCount(groupId: string | number): Promise<number> {
    try {
      const data = await request<GroupMemberCountResponse>(
        SUBGRAPH_URL,
        GROUP_MEMBER_COUNT_QUERY,
        { groupId: groupId.toString() }
      )
      return data.group.memberCount
    } catch (error) {
      console.error('Error fetching member count:', error)
      return 0
    }
  }
} 