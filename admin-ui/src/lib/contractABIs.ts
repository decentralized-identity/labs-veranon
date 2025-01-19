import { abi as serviceProviderAbi } from "../../../contracts/artifacts/contracts/ServiceProvider.sol/ServiceProvider.json"
import { abi as managerAbi } from "../../../contracts/artifacts/contracts/Manager.sol/Manager.json"

export const CONTRACT_ABI = {
  SERVICE_PROVIDER: serviceProviderAbi,
  MANAGER: managerAbi,
} as const
