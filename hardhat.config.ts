import "@nomicfoundation/hardhat-toolbox"
import "@semaphore-protocol/hardhat"
import { getHardhatNetworks } from "@semaphore-protocol/utils"
import { config as dotenvConfig } from "dotenv"
import { HardhatUserConfig } from "hardhat/config"
import { resolve } from "path"

dotenvConfig({ path: resolve(__dirname, ".env") })

const config: HardhatUserConfig = {
    solidity: "0.8.28",
    defaultNetwork: process.env.DEFAULT_NETWORK || "hardhat",
    networks: {
        hardhat: {
            chainId: 1337
        },
        ...getHardhatNetworks(process.env.ETHEREUM_PRIVATE_KEY)
    },
    typechain: {
        target: "ethers-v6"
    }
}

export default config