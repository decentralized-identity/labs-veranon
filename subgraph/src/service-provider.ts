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
  const serviceProvider = ServiceProvider.load(event.params.scope.toString())
  
  if (serviceProvider) {
    // Create unique ID by combining serviceProviderId and message (account ID with service)
    const accountId = event.params.scope.toString().concat("-").concat(event.params.message.toString())
    const userAccount = new UserAccount(accountId)
    
    userAccount.timestamp = event.block.timestamp
    userAccount.nullifier = event.params.nullifier
    userAccount.accountId = event.params.message
    userAccount.serviceProvider = serviceProvider.id
    
    userAccount.save()
  }
}

export function handleSponsorFeeBalanceChanged(
  event: SponsorFeeBalanceChangedEvent,
): void {
  const serviceProvider = ServiceProvider.load(event.params.serviceProvider.toHexString())
  
  if (serviceProvider) {
    // Update service provider balance
    serviceProvider.sponsorFeeBalance = event.params.newBalance
    serviceProvider.save()
  }
}
