import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { Identity } from "@semaphore-protocol/core"
import { expect } from "chai"
import { ethers } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Manager, ServiceProvider, SemaphoreVerifier } from "../typechain-types"
import { Group } from "@semaphore-protocol/group"
import { generateProof } from "@semaphore-protocol/proof"

describe("ServiceProvider", () => {
    async function deployServiceProviderFixture() {
        const [deployer, user1, user2] = await ethers.getSigners()
        
        // Deploy PoseidonT3 library first (needed for Manager)
        const poseidonT3Factory = await ethers.getContractFactory("PoseidonT3")
        const poseidonT3 = await poseidonT3Factory.deploy()
        
        // Deploy Manager with library linking
        const managerFactory = await ethers.getContractFactory("Manager", {
            libraries: {
                PoseidonT3: await poseidonT3.getAddress()
            }
        })
        const managerContract = await managerFactory.deploy()

        // Deploy SemaphoreVerifier
        const verifierFactory = await ethers.getContractFactory("SemaphoreVerifier")
        const verifierContract = await verifierFactory.deploy()

        // Deploy ServiceProvider
        const serviceProviderFactory = await ethers.getContractFactory("ServiceProvider")
        const serviceProviderContract = await serviceProviderFactory.deploy(
            await verifierContract.getAddress(),
            await managerContract.getAddress()
        )

        return { 
            serviceProviderContract, 
            managerContract,
            verifierContract,
            deployer, 
            user1, 
            user2 
        }
    }

    describe("# register", () => {
        let serviceProviderContract: ServiceProvider
        let user1: any

        beforeEach(async () => {
            const fixture = await loadFixture(deployServiceProviderFixture)
            serviceProviderContract = fixture.serviceProviderContract
            user1 = fixture.user1
        })

        it("Should allow a user to register and get a new serviceProviderId", async () => {
            // Initial counter should be 0
            expect(await serviceProviderContract.serviceProviderCounter()).to.equal(0)

            // Register first user
            const tx = await serviceProviderContract.connect(user1).register()

            // Counter should increment
            expect(await serviceProviderContract.serviceProviderCounter()).to.equal(1)

            // Verify the registration event
            await expect(tx)
                .to.emit(serviceProviderContract, "ServiceProviderRegistered")
                .withArgs(0, user1.address) // First ID should be 0

            // Check registration status
            expect(await serviceProviderContract.isRegistered(user1.address)).to.be.true
            expect(await serviceProviderContract.getServiceProviderId(user1.address)).to.equal(0)
        })

        it("Should not allow a user to register twice", async () => {
            // First registration should succeed
            await serviceProviderContract.connect(user1).register()

            // Second registration should fail
            await expect(serviceProviderContract.connect(user1).register())
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__AlreadyRegistered")
        })
    })

    describe("# manager approval", () => {
        let serviceProviderContract: ServiceProvider
        let user1: any
        let managerId: number

        beforeEach(async () => {
            const fixture = await loadFixture(deployServiceProviderFixture)
            serviceProviderContract = fixture.serviceProviderContract
            user1 = fixture.user1
            managerId = 1
        })

        it("Should allow registered service provider to set approved manager", async () => {
            // Register service provider
            await serviceProviderContract.connect(user1).register()

            // Set approved manager
            await serviceProviderContract.connect(user1).setApprovedManager(managerId)

            // Verify manager is approved
            expect(await serviceProviderContract.isApprovedManager(user1.address, managerId)).to.be.true
        })

        it("Should allow registered service provider to remove approved manager", async () => {
            // Register service provider
            await serviceProviderContract.connect(user1).register()

            // First approve manager
            await serviceProviderContract.connect(user1).setApprovedManager(managerId)

            // Then remove approval
            await serviceProviderContract.connect(user1).removeApprovedManager(managerId)

            // Verify manager is no longer approved
            expect(await serviceProviderContract.isApprovedManager(user1.address, managerId)).to.be.false
        })

        it("Should not allow unregistered service provider to set approved manager", async () => {
            await expect(serviceProviderContract.connect(user1).setApprovedManager(managerId))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__NotRegistered")
        })

        it("Should not allow unregistered service provider to remove approved manager", async () => {
            await expect(serviceProviderContract.connect(user1).removeApprovedManager(managerId))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__NotRegistered")
        })

        it("Should allow checking manager approval by service provider ID", async () => {
            // Register service provider
            await serviceProviderContract.connect(user1).register()
            const serviceProviderId = await serviceProviderContract.getServiceProviderId(user1.address)

            // Set approved manager
            await serviceProviderContract.connect(user1).setApprovedManager(managerId)

            // Verify manager is approved using service provider ID
            expect(await serviceProviderContract.isApprovedManagerById(serviceProviderId, managerId)).to.be.true
        })
    })

    describe("# checkProof", () => {
        let serviceProviderContract: ServiceProvider
        let managerContract: Manager
        let user1: any
        let identity: Identity
        let group: Group
        let groupId: bigint
        let validProof: any
        let serviceProviderId: bigint

        beforeEach(async () => {
            // Get fresh contracts and users for each test
            const fixture = await loadFixture(deployServiceProviderFixture)
            serviceProviderContract = fixture.serviceProviderContract
            managerContract = fixture.managerContract
            user1 = fixture.user1

            // Register service provider first
            await serviceProviderContract.connect(user1).register()
            serviceProviderId = await serviceProviderContract.getServiceProviderId(user1.address)

            // Create identity and register manager
            identity = new Identity()
            await managerContract.connect(user1).register()
            groupId = await managerContract.managers(user1.address).then(data => data.groupId)

            // Approve the manager
            await serviceProviderContract.connect(user1).setApprovedManager(groupId)

            // Add member to group
            await managerContract.connect(user1).addMember(groupId, identity.commitment)

            // Create group and generate proof
            group = new Group()
            group.addMember(identity.commitment)
            
            const message = 1
            validProof = await generateProof(
                identity,
                group,
                message,
                serviceProviderId // Use the service provider ID as scope
            )
        })

        it("Should reject proof with used nullifier", async () => {
            // First verification should work
            await serviceProviderContract.verifyAccount(groupId, validProof)

            // Second verification with same proof (same nullifier) should fail
            await expect(serviceProviderContract.checkProof(groupId, validProof))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__NullifierAlreadyUsed")
        })

        it("Should reject proof with invalid merkle tree root", async () => {
            const invalidProof = {
                ...validProof,
                merkleTreeRoot: "123456789"
            }

            await expect(serviceProviderContract.checkProof(groupId, invalidProof))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__InvalidTreeRoot")
        })

        it("Should validate a legitimate proof", async () => {
            const isValid = await serviceProviderContract.checkProof(groupId, validProof)
            expect(isValid).to.be.true
        })

        it("Should revert verifyAccount if proof verification fails", async () => {
            // Modify one of the proof points to make verification fail
            const invalidProof = {
                ...validProof,
                points: [...validProof.points]
            }
            invalidProof.points[0] = 123n

            await expect(serviceProviderContract.verifyAccount(groupId, invalidProof))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__InvalidProof")
        })

        it("Should successfully verify account and emit event", async () => {
            const tx = await serviceProviderContract.verifyAccount(groupId, validProof)

            // Check that account is marked as verified
            expect(await serviceProviderContract.verifiedAccounts(validProof.scope, validProof.message)).to.be.true

            // Check that nullifier is marked as used
            expect(await serviceProviderContract.nullifiers(groupId, validProof.nullifier)).to.be.true

            // Verify event emission
            await expect(tx)
                .to.emit(serviceProviderContract, "AccountVerified")
                .withArgs(
                    groupId,
                    validProof.merkleTreeDepth,
                    validProof.merkleTreeRoot,
                    validProof.nullifier,
                    validProof.message,
                    validProof.scope,
                    validProof.points
                )
        })

        // Keep the existing manager approval specific tests
        it("Should reject proof if manager is not approved by service provider", async () => {
            // Create new proof with different service provider
            await serviceProviderContract.connect(user1).removeApprovedManager(groupId)

            await expect(serviceProviderContract.checkProof(groupId, validProof))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__ManagerNotApproved")
        })

        it("Should accept proof if manager is approved by service provider", async () => {
            // The manager is already approved in beforeEach
            expect(await serviceProviderContract.checkProof(groupId, validProof)).to.be.true
        })

        it("Should reject proof with invalid merkle tree depth", async () => {
            // Test below MIN_DEPTH
            const invalidProofMin = {
                ...validProof,
                merkleTreeDepth: 0  // Below MIN_DEPTH (1)
            }

            await expect(serviceProviderContract.checkProof(groupId, invalidProofMin))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__InvalidMerkleTreeDepth")

            // Test above MAX_DEPTH
            const invalidProofMax = {
                ...validProof,
                merkleTreeDepth: 33  // Above MAX_DEPTH (32)
            }

            await expect(serviceProviderContract.checkProof(groupId, invalidProofMax))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__InvalidMerkleTreeDepth")
        })

        it("Should reject proof for non-existent group", async () => {
            const { serviceProviderContract, user1 } = await loadFixture(deployServiceProviderFixture)

            // Register service provider first
            await serviceProviderContract.connect(user1).register()
            const serviceProviderId = await serviceProviderContract.getServiceProviderId(user1.address)

            // Create a proof with non-existent group ID
            const nonExistentGroupId = 999n
            const identity = new Identity()
            const group = new Group()
            group.addMember(identity.commitment)
            
            const message = 1
            const proof = await generateProof(
                identity,
                group,
                message,
                serviceProviderId
            )

            // Attempt to check proof with non-existent group
            await expect(serviceProviderContract.checkProof(nonExistentGroupId, proof))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__GroupDoesNotExist")
        })
    })
}) 