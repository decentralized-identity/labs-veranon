import { keccak256, toBeHex } from "ethers"
import type { NumericString } from "snarkjs"
import type { BigNumberish } from "ethers"

export function hash(message: BigNumberish): NumericString {
    return (BigInt(keccak256(toBeHex(message, 32))) >> BigInt(8)).toString()
}