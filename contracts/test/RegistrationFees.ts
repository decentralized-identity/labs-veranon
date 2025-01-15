import { loadFixture } from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai"
import { ethers } from "hardhat"
// @ts-ignore: typechain folder will be generated after contracts compilation
import { Manager, ServiceProvider, SemaphoreVerifier } from "../typechain-types"

describe("Registration Fees", () => {
    async function deployContractsFixture() {
        const [deployer, manager, serviceProvider, otherAccount] = await ethers.getSigners()
        
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
            managerContract, 
            serviceProviderContract,
            deployer,
            manager,
            serviceProvider,
            otherAccount
        }
    }

    describe("# setting registration fees", () => {
        it("Should allow registered manager to set a registration fee", async () => {
            const { managerContract, manager } = await loadFixture(deployContractsFixture)
            
            // Register manager first
            await managerContract.connect(manager).register()
            const groupId = await managerContract.getManagerGroupId(manager.address)
            
            // Set registration fee
            const fee = ethers.parseEther("0.1") // 0.1 ETH
            await expect(managerContract.connect(manager).setRegistrationFee(fee))
                .to.emit(managerContract, "RegistrationFeeUpdated")
                .withArgs(groupId, fee)

            // Verify fee was set correctly
            expect(await managerContract.getRegistrationFee(groupId)).to.equal(fee)
        })

        it("Should not allow unregistered manager to set a registration fee", async () => {
            const { managerContract, otherAccount } = await loadFixture(deployContractsFixture)
            
            const fee = ethers.parseEther("0.1")
            await expect(managerContract.connect(otherAccount).setRegistrationFee(fee))
                .to.be.revertedWithCustomError(managerContract, "Manager__NotRegistered")
        })
    })

    describe("# paying registration fees", () => {
        it("Should allow service provider to approve manager after paying required fee", async () => {
            const { managerContract, serviceProviderContract, manager, serviceProvider } = await loadFixture(deployContractsFixture)
            
            // Register manager and set fee
            await managerContract.connect(manager).register()
            const groupId = await managerContract.getManagerGroupId(manager.address)
            const fee = ethers.parseEther("0.1")
            await managerContract.connect(manager).setRegistrationFee(fee)

            // Register service provider
            await serviceProviderContract.connect(serviceProvider).register()

            // Approve manager with fee payment
            await expect(serviceProviderContract.connect(serviceProvider).setApprovedManager(groupId, { value: fee }))
                .to.emit(serviceProviderContract, "ManagerApproved")
                .withArgs(serviceProvider.address, groupId)

            // Verify manager is approved
            expect(await serviceProviderContract.isApprovedManager(serviceProvider.address, groupId)).to.be.true
        })
    })

    describe("# fee payment tests", () => {
        let managerContract: Manager
        let serviceProviderContract: ServiceProvider
        let manager: any
        let serviceProvider: any
        let groupId: bigint
        let fee: bigint

        beforeEach(async () => {
            // Get fresh contracts and accounts
            const fixture = await loadFixture(deployContractsFixture)
            managerContract = fixture.managerContract
            serviceProviderContract = fixture.serviceProviderContract
            manager = fixture.manager
            serviceProvider = fixture.serviceProvider

            // Register manager and get groupId
            await managerContract.connect(manager).register()
            groupId = await managerContract.getManagerGroupId(manager.address)

            // Set standard fee
            fee = ethers.parseEther("0.1")
            await managerContract.connect(manager).setRegistrationFee(fee)

            // Register service provider
            await serviceProviderContract.connect(serviceProvider).register()
        })

        it("Should revert if service provider tries to pay insufficient fee", async () => {
            // Try to approve manager with insufficient fee
            const insufficientFee = ethers.parseEther("0.05") // Only half the required fee
            await expect(serviceProviderContract.connect(serviceProvider).setApprovedManager(groupId, { value: insufficientFee }))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__InsufficientFee")
        })

        it("Should transfer fee correctly to manager's address", async () => {
            // Get manager's initial balance
            const initialBalance = await ethers.provider.getBalance(manager.address)

            // Approve manager with fee payment
            await serviceProviderContract.connect(serviceProvider).setApprovedManager(groupId, { value: fee })

            // Check manager's final balance
            const finalBalance = await ethers.provider.getBalance(manager.address)
            expect(finalBalance - initialBalance).to.equal(fee)
        })

        it("Should allow approval with zero fee if manager hasn't set a fee", async () => {
            // Set fee to zero
            await managerContract.connect(manager).setRegistrationFee(0n)

            // Approve manager without any fee payment
            await expect(serviceProviderContract.connect(serviceProvider).setApprovedManager(groupId))
                .to.emit(serviceProviderContract, "ManagerApproved")
                .withArgs(serviceProvider.address, groupId)

            // Verify manager is approved
            expect(await serviceProviderContract.isApprovedManager(serviceProvider.address, groupId)).to.be.true
        })

        it("Should prevent double payment for already approved manager", async () => {
            // First approval should succeed
            await serviceProviderContract.connect(serviceProvider).setApprovedManager(groupId, { value: fee })

            // Second approval should fail
            await expect(serviceProviderContract.connect(serviceProvider).setApprovedManager(groupId, { value: fee }))
                .to.be.revertedWithCustomError(serviceProviderContract, "ServiceProvider__ManagerAlreadyApproved")
        })
    })
})
