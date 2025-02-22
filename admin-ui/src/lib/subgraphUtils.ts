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

const SPONSOR_FEE_BALANCE_QUERY = gql`
  query GetSponsorFeeBalance($serviceProviderId: ID!) {
    serviceProvider(id: $serviceProviderId) {
      id
      sponsorFeeBalance
    }
  }
`

const VERIFIED_ACCOUNTS_COUNT_QUERY = gql`
  query GetVerifiedAccountsCount($serviceProviderId: BigInt!) {
    userAccounts(where: { serviceProviderId: $serviceProviderId }) {
      id
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

type SponsorFeeBalanceResponse = {
  serviceProvider: {
    id: string
    sponsorFeeBalance: string
  } | null
}

type VerifiedAccountsCountResponse = {
  userAccounts: { id: string }[]
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

  /**
   * Fetches the current sponsor fee balance for a service provider
   * @param address Ethereum address of the service provider
   * @returns The current balance in wei as a BigInt, or null if provider not found
   */
  static async getSponsorFeeBalance(address: string): Promise<bigint | null> {
    try {
      if (!address) {
        return null
      }

      const data = await request<SponsorFeeBalanceResponse>(
        SUBGRAPH_URL,
        SPONSOR_FEE_BALANCE_QUERY,
        { serviceProviderId: address.toLowerCase() }
      )
      
      if (!data.serviceProvider) {
        return null
      }

      return BigInt(data.serviceProvider.sponsorFeeBalance)
    } catch (error) {
      console.error('Error fetching sponsor fee balance:', error)
      return null
    }
  }

  /**
   * Gets the total number of verified accounts for a service provider
   * @param serviceProviderId Numeric ID of the service provider
   * @returns The number of verified accounts, or 0 if provider not found
   */
  static async getVerifiedAccountsCount(serviceProviderId: number): Promise<number> {
    try {
      if (!serviceProviderId) {
        return 0
      }

      const data = await request<VerifiedAccountsCountResponse>(
        SUBGRAPH_URL,
        VERIFIED_ACCOUNTS_COUNT_QUERY,
        { serviceProviderId }
      )
      
      return data.userAccounts.length
    } catch (error) {
      console.error('Error fetching verified accounts count:', error)
      return 0
    }
  }
} 