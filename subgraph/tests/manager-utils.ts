import { newMockEvent } from "matchstick-as"
import { ethereum, BigInt, Address } from "@graphprotocol/graph-ts"
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
} from "../generated/Manager/Manager"

export function createGroupAdminPendingEvent(
  groupId: BigInt,
  oldAdmin: Address,
  newAdmin: Address
): GroupAdminPending {
  let groupAdminPendingEvent = changetype<GroupAdminPending>(newMockEvent())

  groupAdminPendingEvent.parameters = new Array()

  groupAdminPendingEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )
  groupAdminPendingEvent.parameters.push(
    new ethereum.EventParam("oldAdmin", ethereum.Value.fromAddress(oldAdmin))
  )
  groupAdminPendingEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )

  return groupAdminPendingEvent
}

export function createGroupAdminUpdatedEvent(
  groupId: BigInt,
  oldAdmin: Address,
  newAdmin: Address
): GroupAdminUpdated {
  let groupAdminUpdatedEvent = changetype<GroupAdminUpdated>(newMockEvent())

  groupAdminUpdatedEvent.parameters = new Array()

  groupAdminUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )
  groupAdminUpdatedEvent.parameters.push(
    new ethereum.EventParam("oldAdmin", ethereum.Value.fromAddress(oldAdmin))
  )
  groupAdminUpdatedEvent.parameters.push(
    new ethereum.EventParam("newAdmin", ethereum.Value.fromAddress(newAdmin))
  )

  return groupAdminUpdatedEvent
}

export function createGroupCreatedEvent(groupId: BigInt): GroupCreated {
  let groupCreatedEvent = changetype<GroupCreated>(newMockEvent())

  groupCreatedEvent.parameters = new Array()

  groupCreatedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )

  return groupCreatedEvent
}

export function createManagerRegisteredEvent(
  manager: Address,
  groupId: BigInt
): ManagerRegistered {
  let managerRegisteredEvent = changetype<ManagerRegistered>(newMockEvent())

  managerRegisteredEvent.parameters = new Array()

  managerRegisteredEvent.parameters.push(
    new ethereum.EventParam("manager", ethereum.Value.fromAddress(manager))
  )
  managerRegisteredEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )

  return managerRegisteredEvent
}

export function createMemberAddedEvent(
  groupId: BigInt,
  index: BigInt,
  identityCommitment: BigInt,
  merkleTreeRoot: BigInt
): MemberAdded {
  let memberAddedEvent = changetype<MemberAdded>(newMockEvent())

  memberAddedEvent.parameters = new Array()

  memberAddedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )
  memberAddedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  memberAddedEvent.parameters.push(
    new ethereum.EventParam(
      "identityCommitment",
      ethereum.Value.fromUnsignedBigInt(identityCommitment)
    )
  )
  memberAddedEvent.parameters.push(
    new ethereum.EventParam(
      "merkleTreeRoot",
      ethereum.Value.fromUnsignedBigInt(merkleTreeRoot)
    )
  )

  return memberAddedEvent
}

export function createMemberRemovedEvent(
  groupId: BigInt,
  index: BigInt,
  identityCommitment: BigInt,
  merkleTreeRoot: BigInt
): MemberRemoved {
  let memberRemovedEvent = changetype<MemberRemoved>(newMockEvent())

  memberRemovedEvent.parameters = new Array()

  memberRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )
  memberRemovedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  memberRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "identityCommitment",
      ethereum.Value.fromUnsignedBigInt(identityCommitment)
    )
  )
  memberRemovedEvent.parameters.push(
    new ethereum.EventParam(
      "merkleTreeRoot",
      ethereum.Value.fromUnsignedBigInt(merkleTreeRoot)
    )
  )

  return memberRemovedEvent
}

export function createMemberUpdatedEvent(
  groupId: BigInt,
  index: BigInt,
  identityCommitment: BigInt,
  newIdentityCommitment: BigInt,
  merkleTreeRoot: BigInt
): MemberUpdated {
  let memberUpdatedEvent = changetype<MemberUpdated>(newMockEvent())

  memberUpdatedEvent.parameters = new Array()

  memberUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )
  memberUpdatedEvent.parameters.push(
    new ethereum.EventParam("index", ethereum.Value.fromUnsignedBigInt(index))
  )
  memberUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "identityCommitment",
      ethereum.Value.fromUnsignedBigInt(identityCommitment)
    )
  )
  memberUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "newIdentityCommitment",
      ethereum.Value.fromUnsignedBigInt(newIdentityCommitment)
    )
  )
  memberUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "merkleTreeRoot",
      ethereum.Value.fromUnsignedBigInt(merkleTreeRoot)
    )
  )

  return memberUpdatedEvent
}

export function createMembersAddedEvent(
  groupId: BigInt,
  startIndex: BigInt,
  identityCommitments: Array<BigInt>,
  merkleTreeRoot: BigInt
): MembersAdded {
  let membersAddedEvent = changetype<MembersAdded>(newMockEvent())

  membersAddedEvent.parameters = new Array()

  membersAddedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )
  membersAddedEvent.parameters.push(
    new ethereum.EventParam(
      "startIndex",
      ethereum.Value.fromUnsignedBigInt(startIndex)
    )
  )
  membersAddedEvent.parameters.push(
    new ethereum.EventParam(
      "identityCommitments",
      ethereum.Value.fromUnsignedBigIntArray(identityCommitments)
    )
  )
  membersAddedEvent.parameters.push(
    new ethereum.EventParam(
      "merkleTreeRoot",
      ethereum.Value.fromUnsignedBigInt(merkleTreeRoot)
    )
  )

  return membersAddedEvent
}

export function createRegistrationFeeUpdatedEvent(
  groupId: BigInt,
  fee: BigInt
): RegistrationFeeUpdated {
  let registrationFeeUpdatedEvent = changetype<RegistrationFeeUpdated>(
    newMockEvent()
  )

  registrationFeeUpdatedEvent.parameters = new Array()

  registrationFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam(
      "groupId",
      ethereum.Value.fromUnsignedBigInt(groupId)
    )
  )
  registrationFeeUpdatedEvent.parameters.push(
    new ethereum.EventParam("fee", ethereum.Value.fromUnsignedBigInt(fee))
  )

  return registrationFeeUpdatedEvent
}
