import { request, gql } from 'graphql-request'
import { SUBGRAPH_URL } from '../constants/subgraph'

const VERIFY_USER_ACCOUNT_QUERY = gql`
  query VerifyUserAccount($serviceProviderId: BigInt!, $accountId: BigInt!) {
    userAccounts(
      where: {
        serviceProviderId: $serviceProviderId,
        accountId: $accountId
      }
    ) {
      id
      timestamp
      accountId
      serviceProviderId
    }
  }
`

type UserAccountResponse = {
  userAccounts: {
    id: string
    timestamp: string
    accountId: string
    serviceProviderId: string
  }[]
}

export class SubgraphService {
  /**
   * Checks if a user account exists for a given service provider and account ID
   * @param serviceProviderId The ID of the service provider
   * @param accountId The account ID to verify
   * @returns Object containing verification status and timestamp if verified
   */
  async isUserAccountVerified(serviceProviderId: number, accountId: number): Promise<{
    isVerified: boolean;
    verificationTime?: Date;
  }> {
    try {
      const data = await request<UserAccountResponse>(
        SUBGRAPH_URL,
        VERIFY_USER_ACCOUNT_QUERY,
        { 
          serviceProviderId: serviceProviderId,
          accountId: accountId
        }
      );

      if (data.userAccounts.length === 0) {
        return { isVerified: false };
      }

      return {
        isVerified: true,
        verificationTime: new Date(parseInt(data.userAccounts[0].timestamp) * 1000)
      };
    } catch (error) {
      console.error('Error checking user account verification:', error);
      return { isVerified: false };
    }
  }
}
