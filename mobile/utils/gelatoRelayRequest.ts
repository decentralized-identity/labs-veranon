import { GelatoRelay, CallWithSyncFeeRequest } from "@gelatonetwork/relay-sdk";
import { ethers } from 'ethers';
import { POLYGON_AMOY } from '../constants/networks';
import { abi as ServiceProviderABI } from './abis/ServiceProvider.json';
import { SERVICE_PROVIDER_ADDRESS, GELATO_FEE_TOKEN } from '../constants/addresses';

// Initialize Gelato Relay SDK
const relay = new GelatoRelay();

const gelatoApiKey = process.env.GELATO_API_KEY;

// const iface = new ethers.Interface(ServiceProviderABI);
// const verifyAccountFn = iface.getFunction('verifyAccount');
// if (!verifyAccountFn) throw new Error('verifyAccount function not found in ABI');
// console.log("Function selector:", verifyAccountFn.selector);

export interface VerifyAccountParams {
  groupId: number;
  proof: {
    points: string[];
    merkleTreeRoot: string;
    nullifier: string;
    message: string;
    scope: string;
    merkleTreeDepth: number;
  };
}

export async function sendVerifyAccountRequest(
  params: VerifyAccountParams
) {
  try {
    // Create contract interface
    const contract = new ethers.Contract(SERVICE_PROVIDER_ADDRESS, ServiceProviderABI);

    // Encode the function call
    const { data } = await contract.verifyAccount.populateTransaction(
      params.groupId,
      params.proof
    );

    // Prepare relay request
    const request: CallWithSyncFeeRequest = {
      chainId: BigInt(POLYGON_AMOY),
      target: SERVICE_PROVIDER_ADDRESS,
      data: data,
      feeToken: GELATO_FEE_TOKEN
    };

    // Send relay request
    const response = await relay.callWithSyncFee(
      request,
      undefined,
      gelatoApiKey
    );
    
    return {
      taskId: response.taskId
    };

  } catch (error) {
    console.error('Gelato relay request failed:', error);
    throw error;
  }
}

// Helper to check task status
export async function checkTaskStatus(taskId: string) {
  try {
    const status = await relay.getTaskStatus(taskId);
    return status;
  } catch (error) {
    console.error('Failed to check task status:', error);
    throw error;
  }
} 