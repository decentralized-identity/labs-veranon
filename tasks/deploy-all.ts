/**
 * Deploy all contracts (Manager and ServiceProvider with dependencies)
 * 
 * Basic usage:
 * ```bash
 * npx hardhat deploy:all --network <network_name>
 * ```
 * 
 * With existing contract addresses:
 * ```bash
 * npx hardhat deploy:all \
 *   --network <network_name> \
 *   --semaphore-verifier <verifier_address> \
 *   --poseidon <poseidon_address>
 * ```
 * 
 * Example:
 * ```bash
 * # Deploy all contracts from scratch
 * npx hardhat deploy:all --network localhost
 * 
 * # Deploy with existing verifier and poseidon contracts
 * npx hardhat deploy:all \
 *   --network goerli \
 *   --semaphore-verifier 0x1234... \
 *   --poseidon 0x5678...
 * ```
 */

import { task, types } from "hardhat/config"

task("deploy:all", "Deploy Manager and ServiceProvider contracts")
    .addOptionalParam("semaphoreVerifier", "SemaphoreVerifier contract address", undefined, types.string)
    .addOptionalParam("poseidon", "Poseidon library address", undefined, types.string)
    .addOptionalParam("logs", "Print the logs", true, types.boolean)
    .setAction(async ({ logs, semaphoreVerifier: semaphoreVerifierAddress, poseidon: poseidonAddress }, { ethers }) => {
        // Deploy PoseidonT3 if not provided
        if (!poseidonAddress) {
            const PoseidonT3Factory = await ethers.getContractFactory("PoseidonT3")
            const poseidonT3 = await PoseidonT3Factory.deploy()

            poseidonAddress = await poseidonT3.getAddress()

            if (logs) {
                console.info(`Poseidon library has been deployed to: ${poseidonAddress}`)
            }
        }

        // Deploy SemaphoreVerifier if not provided
        if (!semaphoreVerifierAddress) {
            const SemaphoreVerifierFactory = await ethers.getContractFactory("SemaphoreVerifier")
            const semaphoreVerifier = await SemaphoreVerifierFactory.deploy()

            semaphoreVerifierAddress = await semaphoreVerifier.getAddress()

            if (logs) {
                console.info(`SemaphoreVerifier contract has been deployed to: ${semaphoreVerifierAddress}`)
            }
        }

        // Deploy Manager with PoseidonT3
        const ManagerFactory = await ethers.getContractFactory("Manager", {
            libraries: {
                PoseidonT3: poseidonAddress
            }
        })
        const managerContract = await ManagerFactory.deploy()
        const managerAddress = await managerContract.getAddress()

        if (logs) {
            console.info(`Manager contract has been deployed to: ${managerAddress}`)
        }

        // Deploy ServiceProvider with SemaphoreVerifier and Manager
        const ServiceProviderFactory = await ethers.getContractFactory("ServiceProvider")
        const serviceProviderContract = await ServiceProviderFactory.deploy(
            semaphoreVerifierAddress,
            managerAddress
        )
        const serviceProviderAddress = await serviceProviderContract.getAddress()

        if (logs) {
            console.info(`ServiceProvider contract has been deployed to: ${serviceProviderAddress}`)
        }

        return {
            poseidonAddress,
            semaphoreVerifierAddress,
            managerAddress,
            serviceProviderAddress,
            contracts: {
                manager: managerContract,
                serviceProvider: serviceProviderContract
            }
        }
    }) 