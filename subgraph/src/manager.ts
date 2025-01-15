import { BigInt, ByteArray, log } from "@graphprotocol/graph-ts"
import {
    GroupAdminUpdated,
    GroupCreated,
    MemberAdded,
    MemberRemoved,
    MemberUpdated,
    MembersAdded,
    ManagerRegistered
} from "../generated/Manager/Manager"
import { Group, Member, MerkleTree, Manager } from "../generated/schema"
import { concat, hash } from "./utils"

// /**
//  * Creates a new group.
//  * @param event Ethereum event emitted when a group is created.
//  */
// export function createGroup(event: GroupCreated): void {
//     log.debug(`GroupCreated event block: {}`, [event.block.number.toString()])

//     const group = new Group(event.params.groupId.toString())
//     const merkleTree = new MerkleTree(event.params.groupId.toString())

//     log.info("Creating group '{}'", [group.id])

//     merkleTree.depth = 0
//     merkleTree.size = 0
//     merkleTree.group = group.id

//     group.timestamp = event.block.timestamp
//     group.merkleTree = merkleTree.id

//     merkleTree.save()
//     group.save()

//     log.info("Group '{}' has been created", [group.id])
// }

/**
 * Updates the admin of a group.
 * @param event Ethereum event emitted when a group admin is updated.
 */
export function updateGroupAdmin(event: GroupAdminUpdated): void {
    log.debug(`GroupAdminUpdated event block: {}`, [event.block.number.toString()])

    const group = Group.load(event.params.groupId.toString())

    if (group) {
        log.info("Updating admin '{}' in the group '{}'", [event.params.newAdmin.toString(), group.id])

        group.admin = event.params.newAdmin

        group.save()

        log.info("Admin '{}' of the group '{}' has been updated ", [group.admin!.toString(), group.id])
    }
}

/**
 * Adds a member to a group.
 * @param event Ethereum event emitted when a member is added to a group.
 */
export function addMember(event: MemberAdded): void {
    log.debug(`MemberAdded event block {}`, [event.block.number.toString()])

    const merkleTree = MerkleTree.load(event.params.groupId.toString())

    if (merkleTree) {
        const memberId = hash(
            concat(ByteArray.fromI32(event.params.index.toI32()), ByteArray.fromBigInt(event.params.groupId))
        )
        const member = new Member(memberId)

        log.info("Adding member '{}' in the onchain group '{}'", [member.id, merkleTree.group])

        member.group = merkleTree.group
        member.identityCommitment = event.params.identityCommitment
        member.timestamp = event.block.timestamp
        member.index = merkleTree.size

        member.save()

        merkleTree.root = event.params.merkleTreeRoot
        merkleTree.size += 1

        merkleTree.save()

        log.info("Member '{}' of the onchain group '{}' has been added", [member.id, merkleTree.id])
    }
}

/**
 * Updates a member in a group.
 * @param event Ethereum event emitted when a member is removed from a group.
 */
export function updateMember(event: MemberUpdated): void {
    log.debug(`MemberUpdated event block {}`, [event.block.number.toString()])

    const merkleTree = MerkleTree.load(event.params.groupId.toString())

    if (merkleTree) {
        const memberId = hash(
            concat(ByteArray.fromI32(event.params.index.toI32()), ByteArray.fromBigInt(event.params.groupId))
        )
        
        const member = Member.load(memberId)

        if (member) {
            log.info("Updating member '{}' from the onchain group '{}'", [member.id, merkleTree.group])

            member.identityCommitment = event.params.newIdentityCommitment

            member.save()

            merkleTree.root = event.params.merkleTreeRoot

            merkleTree.save()

            log.info("Member '{}' of the onchain group '{}' has been removed", [member.id, merkleTree.group])
        }
    }
}

/**
 * Removes a member from a group.
 * @param event Ethereum event emitted when a member is removed from a group.
 */
export function removeMember(event: MemberRemoved): void {
    log.debug(`MemberRemoved event block {}`, [event.block.number.toString()])

    const merkleTree = MerkleTree.load(event.params.groupId.toString())

    if (merkleTree) {
        const memberId = hash(
            concat(ByteArray.fromI32(event.params.index.toI32()), ByteArray.fromBigInt(event.params.groupId))
        )
        const member = Member.load(memberId)

        if (member) {
            log.info("Removing member '{}' from the onchain group '{}'", [member.id, merkleTree.group])

            member.identityCommitment = BigInt.fromI32(0)

            member.save()

            merkleTree.root = event.params.merkleTreeRoot

            merkleTree.save()

            log.info("Member '{}' of the onchain group '{}' has been removed", [member.id, merkleTree.group])
        }
    }
}

/**
 * Adds N members to a group.
 * @param event Ethereum event emitted when many members are added to a group.
 */
export function addMembers(event: MembersAdded): void {
    log.debug(`MembersAdded event block {}`, [event.block.number.toString()])

    const merkleTree = MerkleTree.load(event.params.groupId.toString())

    // eslint-disable-next-line prefer-destructuring
    const identityCommitments = event.params.identityCommitments
    // eslint-disable-next-line prefer-destructuring
    const startIndex = event.params.startIndex

    if (merkleTree) {
        for (let i = 0; i < identityCommitments.length; i += 1) {
            const identityCommitment = identityCommitments[i]

            const memberId = hash(
                concat(ByteArray.fromI32(startIndex.toI32() + i), ByteArray.fromBigInt(event.params.groupId))
            )
            const member = new Member(memberId)

            log.info("Adding member '{}' in the onchain group '{}'", [member.id, merkleTree.group])

            member.group = merkleTree.group
            member.identityCommitment = identityCommitment
            member.timestamp = event.block.timestamp
            member.index = startIndex.toI32() + i

            member.save()

            log.info("Member '{}' of the onchain group '{}' has been added", [member.id, merkleTree.id])
        }

        merkleTree.root = event.params.merkleTreeRoot
        merkleTree.size += identityCommitments.length

        merkleTree.save()
    }
}

export function handleManagerRegistered(event: ManagerRegistered): void {
    log.debug(`ManagerRegistered event block: {}`, [event.block.number.toString()])

    const groupId = event.params.groupId.toString()
    const group = new Group(groupId)
    const merkleTree = new MerkleTree(groupId)
    const manager = new Manager(event.params.manager.toHexString())

    log.info("Creating group '{}' with manager '{}'", [
        groupId,
        event.params.manager.toHexString()
    ])

    // Set up MerkleTree
    merkleTree.depth = 0
    merkleTree.size = 0
    merkleTree.group = group.id

    // Set up Group
    group.timestamp = event.block.timestamp
    group.merkleTree = merkleTree.id
    group.admin = event.params.manager

    // Set up Manager
    manager.timestamp = event.block.timestamp
    manager.groupId = event.params.groupId
    manager.group = group.id

    merkleTree.save()
    group.save()
    manager.save()

    log.info("Group '{}' has been created with admin '{}' and manager entity created", [
        group.id, 
        event.params.manager.toHexString()
    ])
}