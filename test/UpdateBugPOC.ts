import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { Identity, Group } from "@semaphore-protocol/core"
import { expect } from "chai"
import { ethers } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Manager } from "../typechain-types"

describe("UpdateBugPOC", () => {
    async function deployManagerFixture() {
        const [deployer, manager, user2] = await ethers.getSigners()
        
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

        return { managerContract, deployer, manager, user2 }
    }

    describe("# checking update bug", () => {
        let managerContract: Manager
        let manager: any
        let groupId: bigint

        beforeEach(async () => {
            // Get fresh contract and users for each test
            const fixture = await loadFixture(deployManagerFixture)
            managerContract = fixture.managerContract
            manager = fixture.manager

            // Register manager and get their group
            await managerContract.connect(manager).register()
            groupId = await managerContract.getManagerGroupId(manager.address)
        })

        it("Should correctly add identity commitment and verify merkle root", async () => {
            // Create a new identity
            const identity = new Identity()
            const group = new Group()

            // Add member to both contract and local group
            await managerContract.connect(manager).addMember(groupId, identity.commitment)
            group.addMember(identity.commitment)

            // Get merkle root from contract and local group
            const contractRoot = await managerContract.getMerkleTreeRoot(groupId)
            const localRoot = group.root

            // Verify roots match
            expect(contractRoot).to.equal(localRoot)
        })

        it("Should correctly add multiple identity commitments and verify merkle root", async () => {
            const numIdentities = 10
            const identities = Array.from({ length: numIdentities }, () => new Identity())
            const group = new Group()

            // Add all members to both contract and local group
            const commitments = identities.map(id => id.commitment)
            await managerContract.connect(manager).addMembers(groupId, commitments)
            group.addMembers(commitments)

            // Get merkle root from contract and local group
            const contractRoot = await managerContract.getMerkleTreeRoot(groupId)
            const localRoot = group.root

            // Verify roots match
            expect(contractRoot).to.equal(localRoot)
        })

        it("Should correctly update a member using merkle proof", async () => {
            // Create initial identities
            const numIdentities = 10
            const identities = Array.from({ length: numIdentities }, () => new Identity())
            const group = new Group()

            // Add all members to both contract and local group
            const commitments = identities.map(id => id.commitment)
            await managerContract.connect(manager).addMembers(groupId, commitments)
            group.addMembers(commitments)

            // Create new identity for the update
            const newIdentity = new Identity()
            
            // Generate merkle proof for the second member (index 1)
            const merkleProof = group.generateMerkleProof(1)

            // Update the member in both contract and local group
            await managerContract.connect(manager).updateMember(
                groupId,
                identities[1].commitment, // old commitment
                newIdentity.commitment,   // new commitment
                merkleProof.siblings
            )
            
            // Update local group
            group.updateMember(1, newIdentity.commitment)

            // Get merkle root from contract and local group
            const contractRoot = await managerContract.getMerkleTreeRoot(groupId)
            const localRoot = group.root

            // Verify roots match
            expect(contractRoot).to.equal(localRoot)
        })

        // This test verifies that batch member addition followed by individual updates works correctly
        // by mirroring the exact same operations (batch add + updates) in both the contract and the 
        // in-memory group, then comparing their roots after each operation to ensure they match
        it("Should correctly update multiple members using merkle proofs", async () => {
            // Create initial identities
            const numIdentities = 10
            const identities = Array.from({ length: numIdentities }, () => new Identity())
            const group = new Group()

            // Add all members to both contract and local group
            const commitments = identities.map(id => id.commitment)
            await managerContract.connect(manager).addMembers(groupId, commitments)
            group.addMembers(commitments)

            // Update members at indices 1, 2, and 3
            for (const index of [1, 2, 3]) {
                // Create new identity for the update
                const newIdentity = new Identity()
                
                // Generate merkle proof for the member
                const merkleProof = group.generateMerkleProof(index)

                // Update the member in both contract and local group
                await managerContract.connect(manager).updateMember(
                    groupId,
                    identities[index].commitment, // old commitment
                    newIdentity.commitment,       // new commitment
                    merkleProof.siblings
                )
                
                // Update local group
                group.updateMember(index, newIdentity.commitment)

                // Get merkle root from contract and local group after each update
                const contractRoot = await managerContract.getMerkleTreeRoot(groupId)
                const localRoot = group.root

                // Verify roots match after each update
                expect(contractRoot).to.equal(localRoot)
            }
        })

        // This test verifies that the merkle tree root is consistent between:
        // 1. Adding members to contract, then updating them one-by-one
        // 2. Adding the final set of members (post-updates) to an in-memory group all at once
        // If the roots match, it confirms the contract's merkle tree matches what we'd expect
        // given the final set of members, regardless of how we arrived at that state
        it("Should maintain correct root after updates when reconstructing group", async () => {
            // Create initial identities
            const numIdentities = 10
            const identities = Array.from({ length: numIdentities }, () => new Identity())
            const group = new Group()

            // Add all members to both contract and local group
            const commitments = identities.map(id => id.commitment)
            await managerContract.connect(manager).addMembers(groupId, commitments)
            group.addMembers(commitments)

            // Store new identities and update members at indices 1, 2, and 3
            const newIdentities = []
            for (const index of [1, 2, 3]) {
                // Create and store new identity for the update
                const newIdentity = new Identity()
                newIdentities.push({ index, identity: newIdentity })
                
                // Generate merkle proof for the member
                const merkleProof = group.generateMerkleProof(index)

                // Update the member in contract
                await managerContract.connect(manager).updateMember(
                    groupId,
                    identities[index].commitment,
                    newIdentity.commitment,
                    merkleProof.siblings
                )

                // Update the local group to keep it in sync for next merkle proof generation
                group.updateMember(index, newIdentity.commitment)
            }

            // Create final identity array with updated members
            const finalIdentities = [...identities]
            newIdentities.forEach(({ index, identity }) => {
                finalIdentities[index] = identity
            })

            // Create new group with final state
            const reconstructedGroup = new Group()
            reconstructedGroup.addMembers(finalIdentities.map(id => id.commitment))

            // Get merkle root from contract and reconstructed group
            const contractRoot = await managerContract.getMerkleTreeRoot(groupId)
            const reconstructedRoot = reconstructedGroup.root

            // Verify roots match
            expect(contractRoot).to.equal(reconstructedRoot)
        })

        it("Should maintain correct root after updates and final member addition", async () => {
            // Create initial identities
            const numIdentities = 10
            const identities = Array.from({ length: numIdentities }, () => new Identity())
            const group = new Group()

            // Add all members to both contract and local group
            const commitments = identities.map(id => id.commitment)
            await managerContract.connect(manager).addMembers(groupId, commitments)
            group.addMembers(commitments)

            // Store new identities and update members at indices 1, 2, and 3
            const newIdentities = []
            for (const index of [1, 2, 3]) {
                // Create and store new identity for the update
                const newIdentity = new Identity()
                newIdentities.push({ index, identity: newIdentity })
                
                // Generate merkle proof for the member
                const merkleProof = group.generateMerkleProof(index)

                // Update the member in contract
                await managerContract.connect(manager).updateMember(
                    groupId,
                    identities[index].commitment,
                    newIdentity.commitment,
                    merkleProof.siblings
                )

                // Update the local group to keep it in sync for next merkle proof generation
                group.updateMember(index, newIdentity.commitment)
            }

            // Create and add one final identity after all updates
            const finalIdentity = new Identity()
            await managerContract.connect(manager).addMember(groupId, finalIdentity.commitment)
            
            // Add to the original group that we've been updating step by step
            group.addMember(finalIdentity.commitment)
            
            // Verify the step-by-step updated group matches the contract
            const stepByStepRoot = group.root
            const contractRoot = await managerContract.getMerkleTreeRoot(groupId)
            expect(contractRoot).to.equal(stepByStepRoot)

            // Create final identity array with updated members plus the final addition
            const finalIdentities = [...identities]
            newIdentities.forEach(({ index, identity }) => {
                finalIdentities[index] = identity
            })
            finalIdentities.push(finalIdentity)  // Add the final identity to the array

            // Create new group with final state
            const reconstructedGroup = new Group()
            reconstructedGroup.addMembers(finalIdentities.map(id => id.commitment))

            // Get merkle root from reconstructed group
            const reconstructedRoot = reconstructedGroup.root

            // Verify all roots match
            expect(contractRoot).to.equal(reconstructedRoot)
        })
    })
})
