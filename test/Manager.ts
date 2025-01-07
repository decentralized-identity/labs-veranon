import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { Identity, Group } from "@semaphore-protocol/core"
import { expect } from "chai"
import { ethers } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Manager } from "../typechain-types"

describe("Manager", () => {
    async function deployManagerFixture() {
        const [deployer, user1, user2] = await ethers.getSigners()
        
        // Deploy PoseidonT3 library first
        const poseidonT3Factory = await ethers.getContractFactory("PoseidonT3")
        const poseidonT3 = await poseidonT3Factory.deploy()
        
        // Deploy Manager with library linking
        const managerFactory = await ethers.getContractFactory("Manager", {
            libraries: {
                PoseidonT3: await poseidonT3.getAddress()
            }
        })
        const managerContract = await managerFactory.deploy()

        return { managerContract, deployer, user1, user2 }
    }

    describe("# register", () => {
        it("Should allow a user to register and get a new groupId", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Initial group counter should be 0
            expect(await managerContract.groupCounter()).to.equal(0)

            // Register first user
            const tx = await managerContract.connect(user1).register()

            // Group counter should increment
            expect(await managerContract.groupCounter()).to.equal(1)

            // Verify the registration event
            await expect(tx)
                .to.emit(managerContract, "ManagerRegistered")
                .withArgs(user1.address, 0) // First group ID should be 0

            // Check manager data
            const managerData = await managerContract.managers(user1.address)
            expect(managerData.isRegistered).to.be.true
            expect(managerData.groupId).to.equal(0)
        })

        it("Should not allow a user to register twice", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // First registration should succeed
            await managerContract.connect(user1).register()

            // Second registration should fail
            await expect(managerContract.connect(user1).register())
                .to.be.revertedWithCustomError(managerContract, "Manager__AlreadyRegistered")
        })
    })

    describe("# group manager transfer", () => {
        it("Should allow transfer of group management", async () => {
            const { managerContract, user1, user2 } = await loadFixture(deployManagerFixture)

            // First register user1 as a manager
            await managerContract.connect(user1).register()
            
            // Get the groupId from the manager's data
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Verify initial group manager is user1
            expect(await managerContract.getGroupManager(groupId)).to.equal(user1.address)

            // user1 initiates transfer to user2
            await managerContract.connect(user1).updateGroupManager(groupId, user2.address)

            // Verify manager hasn't changed yet (pending acceptance)
            expect(await managerContract.getGroupManager(groupId)).to.equal(user1.address)

            // user2 accepts the transfer
            await managerContract.connect(user2).acceptGroupManager(groupId)

            // Verify user2 is now the group manager
            expect(await managerContract.getGroupManager(groupId)).to.equal(user2.address)
        })

        it("Should not allow unauthorized transfers", async () => {
            const { managerContract, user1, user2 } = await loadFixture(deployManagerFixture)

            // First register user1 as a manager
            await managerContract.connect(user1).register()
            
            // Get the groupId from the manager's data
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // user2 tries to transfer user1's group (should fail)
            await expect(
                managerContract.connect(user2).updateGroupManager(groupId, user2.address)
            ).to.be.revertedWithCustomError(managerContract, "Semaphore__CallerIsNotTheGroupAdmin")
        })
    })

    describe("# member management", () => {
        it("Should allow group manager to add a single member", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Create a new identity commitment
            const identity = new Identity()

            // Initial group size should be 0
            expect(await managerContract.getMerkleTreeSize(groupId)).to.equal(0)

            // Add member to the group
            await managerContract.connect(user1).addMember(groupId, identity.commitment)

            // Group size should be 1
            expect(await managerContract.getMerkleTreeSize(groupId)).to.equal(1)
        })

        it("Should allow group manager to add multiple members", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Create multiple identity commitments
            const identities = [new Identity(), new Identity(), new Identity()]
            const identityCommitments = identities.map(identity => identity.commitment)

            // Initial group size should be 0
            expect(await managerContract.getMerkleTreeSize(groupId)).to.equal(0)

            // Add members to the group
            await managerContract.connect(user1).addMembers(groupId, identityCommitments)

            // Group size should equal number of added members
            expect(await managerContract.getMerkleTreeSize(groupId)).to.equal(identityCommitments.length)
        })

        it("Should not allow non-manager to add members", async () => {
            const { managerContract, user1, user2 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Create a new identity commitment
            const identity = new Identity()

            // user2 tries to add member to user1's group (should fail)
            await expect(
                managerContract.connect(user2).addMember(groupId, identity.commitment)
            ).to.be.revertedWithCustomError(managerContract, "Semaphore__CallerIsNotTheGroupAdmin")
        })

        it("Should not allow adding members to non-existent group", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            const identity = new Identity()
            const nonExistentGroupId = 999

            await expect(
                managerContract.connect(user1).addMember(nonExistentGroupId, identity.commitment)
            ).to.be.revertedWithCustomError(managerContract, "Semaphore__CallerIsNotTheGroupAdmin")
        })
    })

    describe("# member updates and removals", () => {
        it("Should allow group manager to update a member", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Create identities and a group
            const oldIdentity = new Identity()
            const newIdentity = new Identity()
            const group = new Group()

            // Add the member to both the contract and our local group
            await managerContract.connect(user1).addMember(groupId, oldIdentity.commitment)
            group.addMember(oldIdentity.commitment)

            // Generate merkle proof for the update
            const merkleProof = group.generateMerkleProof(0)

            // Update the member
            await managerContract.connect(user1).updateMember(
                groupId,
                oldIdentity.commitment,
                newIdentity.commitment,
                merkleProof.siblings
            )

            // Verify the group size remains the same
            expect(await managerContract.getMerkleTreeSize(groupId)).to.equal(1)
        })

        it("Should allow group manager to remove a member", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Create identity and group
            const identity = new Identity()
            const group = new Group()

            // Add the member to both contract and local group
            await managerContract.connect(user1).addMember(groupId, identity.commitment)
            group.addMember(identity.commitment)

            // Get initial root
            const initialRoot = await managerContract.getMerkleTreeRoot(groupId)

            // Generate merkle proof for removal
            const merkleProof = group.generateMerkleProof(0)

            // Remove the member
            const tx = await managerContract.connect(user1).removeMember(
                groupId,
                identity.commitment,
                merkleProof.siblings
            )

            // Wait for transaction
            await tx.wait()

            // Get new root
            const newRoot = await managerContract.getMerkleTreeRoot(groupId)

            // Verify roots are different (member was actually removed)
            expect(newRoot).to.not.equal(initialRoot)

            // Group size should still be 1 (removed members are replaced with zeros)
            expect(await managerContract.getMerkleTreeSize(groupId)).to.equal(1)

            // Try to remove the same member again - should fail
            await expect(
                managerContract.connect(user1).removeMember(
                    groupId,
                    identity.commitment,
                    merkleProof.siblings
                )
            ).to.be.revertedWithCustomError(managerContract, "LeafDoesNotExist")
        })

        it("Should not allow updates with invalid merkle proof", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Create multiple identities
            const identities = [
                new Identity(),  // this will be the one we try to update
                new Identity(),
                new Identity(),
                new Identity()
            ]
            const newIdentity = new Identity()
            const group = new Group()

            // Add all members to both contract and local group
            const commitments = identities.map(id => id.commitment)
            await managerContract.connect(user1).addMembers(groupId, commitments)
            group.addMembers(commitments)

            // Generate proof for the first identity but modify it to make it invalid
            const merkleProof = group.generateMerkleProof(0)
            merkleProof.siblings[0] = BigInt(123456) // corrupt the proof

            // Attempt update with invalid proof
            await expect(
                managerContract.connect(user1).updateMember(
                    groupId,
                    identities[0].commitment,
                    newIdentity.commitment,
                    merkleProof.siblings
                )
            ).to.be.revertedWithCustomError(managerContract, "WrongSiblingNodes")
        })

        it("Should not allow non-managers to update or remove members", async () => {
            const { managerContract, user1, user2 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            const oldIdentity = new Identity()
            const newIdentity = new Identity()
            const group = new Group()

            // Add member
            await managerContract.connect(user1).addMember(groupId, oldIdentity.commitment)
            group.addMember(oldIdentity.commitment)

            const merkleProof = group.generateMerkleProof(0)

            // Attempt update as non-manager
            await expect(
                managerContract.connect(user2).updateMember(
                    groupId,
                    oldIdentity.commitment,
                    newIdentity.commitment,
                    merkleProof.siblings
                )
            ).to.be.revertedWithCustomError(managerContract, "Semaphore__CallerIsNotTheGroupAdmin")

            // Attempt removal as non-manager
            await expect(
                managerContract.connect(user2).removeMember(
                    groupId,
                    oldIdentity.commitment,
                    merkleProof.siblings
                )
            ).to.be.revertedWithCustomError(managerContract, "Semaphore__CallerIsNotTheGroupAdmin")
        })

        it("Should not allow operations on non-existent members", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            const existingIdentity = new Identity()
            const nonExistentIdentity = new Identity()
            const newIdentity = new Identity()
            const group = new Group()

            // Add one member
            await managerContract.connect(user1).addMember(groupId, existingIdentity.commitment)
            group.addMember(existingIdentity.commitment)

            const merkleProof = group.generateMerkleProof(0)

            // Attempt to update non-existent member
            await expect(
                managerContract.connect(user1).updateMember(
                    groupId,
                    nonExistentIdentity.commitment,
                    newIdentity.commitment,
                    merkleProof.siblings
                )
            ).to.be.revertedWithCustomError(managerContract, "LeafDoesNotExist")

            // Attempt to remove non-existent member
            await expect(
                managerContract.connect(user1).removeMember(
                    groupId,
                    nonExistentIdentity.commitment,
                    merkleProof.siblings
                )
            ).to.be.revertedWithCustomError(managerContract, "LeafDoesNotExist")
        })
    })

    describe("# merkle root verification", () => {
        it("Should return the correct merkle root", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Create multiple identities
            const identities = [
                new Identity(),
                new Identity(),
                new Identity(),
                new Identity()
            ]
            const commitments = identities.map(id => id.commitment)

            // Create local group and add members
            const group = new Group()
            group.addMembers(commitments)

            // Add members to contract
            await managerContract.connect(user1).addMembers(groupId, commitments)

            // Get roots from both sources
            const contractRoot = await managerContract.getMerkleTreeRoot(groupId)
            const localRoot = group.root

            // Verify roots match
            expect(contractRoot).to.equal(localRoot)
        })

        it("Should return zero for non-existent group", async () => {
            const { managerContract } = await loadFixture(deployManagerFixture)
            
            const nonExistentGroupId = 999
            
            // Root should be zero for non-existent group
            expect(await managerContract.getMerkleTreeRoot(nonExistentGroupId)).to.equal(0n)
        })
    })

    describe("# view functions", () => {
        it("Should correctly return group manager", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Verify getGroupManager returns correct address
            expect(await managerContract.getGroupManager(groupId)).to.equal(user1.address)
        })

        it("Should correctly return manager data", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()

            // Get manager data
            const managerData = await managerContract.managers(user1.address)

            // Verify data is correct
            expect(managerData.isRegistered).to.be.true
            expect(managerData.groupId).to.equal(0)
        })

        it("Should correctly return merkle tree root", async () => {
            const { managerContract, user1 } = await loadFixture(deployManagerFixture)

            // Register user1 as manager
            await managerContract.connect(user1).register()
            const managerData = await managerContract.managers(user1.address)
            const groupId = managerData.groupId

            // Get initial root
            const initialRoot = await managerContract.getMerkleTreeRoot(groupId)

            // Add a member
            const identity = new Identity()
            await managerContract.connect(user1).addMember(groupId, identity.commitment)

            // Get new root
            const newRoot = await managerContract.getMerkleTreeRoot(groupId)

            // Verify roots are different
            expect(newRoot).to.not.equal(initialRoot)
        })
    })
}) 