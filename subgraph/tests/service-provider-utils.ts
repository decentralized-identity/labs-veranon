import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
import {
  AccountVerified,
  ManagerApproved,
  ServiceProviderRegistered
} from "../generated/ServiceProvider/ServiceProvider"

export function createAccountVerifiedEvent(
  groupId: BigInt,
  merkleTreeDepth: BigInt,
  merkleTreeRoot: BigInt,
  nullifier: BigInt,
  message: BigInt,
  scope: BigInt,
  points: Array<BigInt>
): AccountVerified {
  let accountVerifiedEvent = changetype<AccountVerified>(newMockEvent())

  accountVerifiedEvent.parameters = new Array()

  accountVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )
  accountVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "merkleTreeDepth",
      ethereum.Value.fromUnsignedBigInt(merkleTreeDepth)
    )
  )
  accountVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "merkleTreeRoot",
      ethereum.Value.fromUnsignedBigInt(merkleTreeRoot)
    )
  )
  accountVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "nullifier",
      ethereum.Value.fromUnsignedBigInt(nullifier)
    )
  )
  accountVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "message",
      ethereum.Value.fromUnsignedBigInt(message)
    )
  )
  accountVerifiedEvent.parameters.push(
    new ethereum.EventParam("scope", ethereum.Value.fromUnsignedBigInt(scope))
  )
  accountVerifiedEvent.parameters.push(
    new ethereum.EventParam(
      "points",
      ethereum.Value.fromUnsignedBigIntArray(points)
    )
  )

  return accountVerifiedEvent
}

export function createManagerApprovedEvent(
  provider: Address,
  groupId: BigInt
): ManagerApproved {
  let managerApprovedEvent = changetype<ManagerApproved>(newMockEvent())

  managerApprovedEvent.parameters = new Array()

  managerApprovedEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )
  managerApprovedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )

  return managerApprovedEvent
}

export function createServiceProviderRegisteredEvent(
  serviceProviderId: BigInt,
  provider: Address
): ServiceProviderRegistered {
  let serviceProviderRegisteredEvent = changetype<ServiceProviderRegistered>(
    newMockEvent()
  )

  serviceProviderRegisteredEvent.parameters = new Array()

  serviceProviderRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "serviceProviderId",
      ethereum.Value.fromUnsignedBigInt(serviceProviderId)
    )
  )
  serviceProviderRegisteredEvent.parameters.push(
    new ethereum.EventParam("provider", ethereum.Value.fromAddress(provider))
  )

  return serviceProviderRegisteredEvent
}
