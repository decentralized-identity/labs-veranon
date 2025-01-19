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

const GROUP_MEMBER_COUNT_QUERY = gql`
  query GetGroupMemberCount($groupId: ID!) {
    group(id: $groupId) {
      merkleTree {
        size
      }
    }
  }
`

const CHECK_MANAGER_QUERY = gql`
  query CheckManager($address: ID!) {
    manager(id: $address) {
      id
      groupId
      group {
        id
      }
    }
  }
`

const CHECK_SERVICE_PROVIDER_QUERY = gql`
  query CheckServiceProvider($address: ID!) {
    serviceProvider(id: $address) {
      id
      serviceProviderId
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

type GroupMemberCountResponse = {
  group: {
    merkleTree: {
      size: number
    }
  }
}

type ManagerQueryResponse = {
  manager: {
    id: string
    groupId: string
    group: {
      id: string
    }
  } | null
}

type ServiceProviderQueryResponse = {
  serviceProvider: {
    id: string
    serviceProviderId: string
  } | null
}

export class SubgraphUtils {
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
   * Gets the active member count for a group by filtering out zero commitments
   */
  static async getActiveMemberCount(groupId: string | number): Promise<number> {
    try {
      const members = await this.fetchGroupMembers(groupId)
      // Filter out members with zero identity commitments and count remaining
      return members.filter(member => 
        BigInt(member.identityCommitment) !== BigInt(0)
      ).length
    } catch (error) {
      console.error('Error fetching member count:', error)
      return 0
    }
  }

  /**
   * Checks if an address is a registered manager and returns their group details
   * @param address Ethereum address to check
   * @returns Object containing isManager status, groupId, and memberCount if they are a manager
   */
  static async isManager(address: string): Promise<{
    isManager: boolean
    groupId?: string
  }> {
    try {
      if (!address) {
        return { isManager: false }
      }

      const data = await request<ManagerQueryResponse>(
        SUBGRAPH_URL,
        CHECK_MANAGER_QUERY,
        { address: address.toLowerCase() }
      )
      
      if (!data.manager) {
        return { isManager: false }
      }

      return {
        isManager: true,
        groupId: data.manager.groupId
      }
    } catch (error) {
      console.error('Error checking manager status:', error)
      return { isManager: false }
    }
  }

  /**
   * Checks if an address is a registered service provider
   * @param address Ethereum address to check
   * @returns Object containing isProvider status and providerId if they are registered
   */
  static async isServiceProvider(address: string): Promise<{
    isServiceProvider: boolean
    serviceProviderId?: string
  }> {
    try {
      if (!address) {
        return { isServiceProvider: false }
      }

      const data = await request<ServiceProviderQueryResponse>(
        SUBGRAPH_URL,
        CHECK_SERVICE_PROVIDER_QUERY,
        { address: address.toLowerCase() }
      )
      
      if (!data.serviceProvider) {
        return { isServiceProvider: false }
      }

      return {
        isServiceProvider: true,
        serviceProviderId: data.serviceProvider.serviceProviderId
      }
    } catch (error) {
      console.error('Error checking service provider status:', error)
      return { isServiceProvider: false }
    }
  }
} 