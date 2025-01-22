import { BigInt, log } from "@graphprotocol/graph-ts"
import {
  AccountVerified as AccountVerifiedEvent,
  ServiceProviderRegistered as ServiceProviderRegisteredEvent,
  SponsorFeeBalanceChanged as SponsorFeeBalanceChangedEvent,
} from "../generated/ServiceProvider/ServiceProvider"
import {
  ServiceProvider,
  UserAccount,
} from "../generated/schema"

export function handleServiceProviderRegistered(
  event: ServiceProviderRegisteredEvent,
): void {
  log.debug(`ServiceProviderRegistered event block: {}`, [event.block.number.toString()])

  const serviceProvider = new ServiceProvider(event.params.serviceProvider.toHexString())

  log.info("Creating service provider '{}' with ID '{}'", [
    event.params.serviceProvider.toHexString(),
    event.params.serviceProviderId.toString()
  ])

  serviceProvider.timestamp = event.block.timestamp
  serviceProvider.serviceProviderId = event.params.serviceProviderId
  serviceProvider.sponsorFeeBalance = BigInt.fromI32(0)

  serviceProvider.save()

  log.info("ServiceProvider '{}' has been created", [
    event.params.serviceProviderId.toString()
  ])
}

export function handleAccountVerified(event: AccountVerifiedEvent): void {
  // Using nullifier as the ID for the user account
  const userAccount = new UserAccount(event.params.nullifier.toHexString())
  
  userAccount.timestamp = event.block.timestamp
  userAccount.nullifier = event.params.nullifier
  userAccount.accountId = event.params.message
  userAccount.serviceProviderId = event.params.scope
  
  userAccount.save()
}

export function handleSponsorFeeBalanceChanged(
  event: SponsorFeeBalanceChangedEvent,
): void {
  const serviceProvider = ServiceProvider.load(event.params.serviceProvider.toHexString())
  
  if (serviceProvider) {
    serviceProvider.sponsorFeeBalance = event.params.newBalance
    serviceProvider.save()
  }
}
