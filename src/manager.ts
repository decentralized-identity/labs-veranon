import {
  GroupAdminPending as GroupAdminPendingEvent,
  GroupAdminUpdated as GroupAdminUpdatedEvent,
  GroupCreated as GroupCreatedEvent,
  ManagerRegistered as ManagerRegisteredEvent,
  MemberAdded as MemberAddedEvent,
  MemberRemoved as MemberRemovedEvent,
  MemberUpdated as MemberUpdatedEvent,
  MembersAdded as MembersAddedEvent,
  RegistrationFeeUpdated as RegistrationFeeUpdatedEvent
} from "../generated/Manager/Manager"
import {
  GroupAdminPending,
  GroupAdminUpdated,
  GroupCreated,
  ManagerRegistered,
  MemberAdded,
  MemberRemoved,
  MemberUpdated,
  MembersAdded,
  RegistrationFeeUpdated
} from "../generated/schema"

export function handleGroupAdminPending(event: GroupAdminPendingEvent): void {
  let entity = new GroupAdminPending(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.groupId = event.params.groupId
  entity.oldAdmin = event.params.oldAdmin
  entity.newAdmin = event.params.newAdmin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGroupAdminUpdated(event: GroupAdminUpdatedEvent): void {
  let entity = new GroupAdminUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.groupId = event.params.groupId
  entity.oldAdmin = event.params.oldAdmin
  entity.newAdmin = event.params.newAdmin

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleGroupCreated(event: GroupCreatedEvent): void {
  let entity = new GroupCreated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.groupId = event.params.groupId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleManagerRegistered(event: ManagerRegisteredEvent): void {
  let entity = new ManagerRegistered(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.manager = event.params.manager
  entity.groupId = event.params.groupId

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberAdded(event: MemberAddedEvent): void {
  let entity = new MemberAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.groupId = event.params.groupId
  entity.index = event.params.index
  entity.identityCommitment = event.params.identityCommitment
  entity.merkleTreeRoot = event.params.merkleTreeRoot

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberRemoved(event: MemberRemovedEvent): void {
  let entity = new MemberRemoved(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.groupId = event.params.groupId
  entity.index = event.params.index
  entity.identityCommitment = event.params.identityCommitment
  entity.merkleTreeRoot = event.params.merkleTreeRoot

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMemberUpdated(event: MemberUpdatedEvent): void {
  let entity = new MemberUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.groupId = event.params.groupId
  entity.index = event.params.index
  entity.identityCommitment = event.params.identityCommitment
  entity.newIdentityCommitment = event.params.newIdentityCommitment
  entity.merkleTreeRoot = event.params.merkleTreeRoot

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleMembersAdded(event: MembersAddedEvent): void {
  let entity = new MembersAdded(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.groupId = event.params.groupId
  entity.startIndex = event.params.startIndex
  entity.identityCommitments = event.params.identityCommitments
  entity.merkleTreeRoot = event.params.merkleTreeRoot

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}

export function handleRegistrationFeeUpdated(
  event: RegistrationFeeUpdatedEvent
): void {
  let entity = new RegistrationFeeUpdated(
    event.transaction.hash.concatI32(event.logIndex.toI32())
  )
  entity.groupId = event.params.groupId
  entity.fee = event.params.fee

  entity.blockNumber = event.block.number
  entity.blockTimestamp = event.block.timestamp
  entity.transactionHash = event.transaction.hash

  entity.save()
}
