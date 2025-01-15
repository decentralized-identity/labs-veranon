import { log } from "@graphprotocol/graph-ts"
import {
  AccountVerified as AccountVerifiedEvent,
  ManagerApproved as ManagerApprovedEvent,
  ServiceProviderRegistered as ServiceProviderRegisteredEvent,
} from "../generated/ServiceProvider/ServiceProvider"
import {
  AccountVerified,
  ManagerApproved,
  ServiceProviderRegistered,
  ServiceProvider,
} from "../generated/schema"

export function handleAccountVerified(event: AccountVerifiedEvent): void {
  let entity = new AccountVerified(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.groupId = event.params.groupId
  entity.merkleTreeDepth = event.params.merkleTreeDepth
  entity.merkleTreeRoot = event.params.merkleTreeRoot
  entity.nullifier = event.params.nullifier
  entity.message = event.params.message
  entity.scope = event.params.scope
  entity.points = event.params.points

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleManagerApproved(event: ManagerApprovedEvent): void {
  let entity = new ManagerApproved(
    event.transaction.hash.concatI32(event.logIndex.toI32()),
  )
  entity.provider = event.params.provider
  entity.groupId = event.params.groupId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleServiceProviderRegistered(
  event: ServiceProviderRegisteredEvent,
): void {
  log.debug(`ServiceProviderRegistered event block: {}`, [event.block.number.toString()])

  const serviceProvider = new ServiceProvider(event.params.provider.toHexString())

  log.info("Creating service provider '{}' with ID '{}'", [
    event.params.provider.toHexString(),
    event.params.serviceProviderId.toString()
  ])

  // Set up ServiceProvider
  serviceProvider.timestamp = event.block.timestamp
  serviceProvider.serviceProviderId = event.params.serviceProviderId

  serviceProvider.save()

  log.info("ServiceProvider '{}' has been created", [
    event.params.provider.toHexString()
  ])
}
