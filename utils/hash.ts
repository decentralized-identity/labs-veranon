// import { keccak256 } from "ethers"
// import { toBeHex } from "ethers"
// import type { NumericString } from "snarkjs"
// import type { BigNumberish } from "ethers"

// export function hash(message: BigNumberish): NumericString {
//     return (BigInt(keccak256(toBeHex(message, 32))) >> BigInt(8)).toString()
// } 

import { keccak256, toUtf8Bytes } from "ethers"
import type { NumericString } from "snarkjs"
import type { BigNumberish } from "ethers"

export function hash(message: BigNumberish): NumericString {
    const messageBytes = typeof message === 'string' ? toUtf8Bytes(message) : toUtf8Bytes(message.toString());
    return (BigInt(keccak256(messageBytes)) >> BigInt(8)).toString()
}