// import {
//   assert,
//   describe,
//   test,
//   clearStore,
//   beforeAll,
//   afterAll
// } from "matchstick-as/assembly/index"
// import { BigInt, Address } from "@graphprotocol/graph-ts"
// import { AccountVerified } from "../generated/schema"
// import { AccountVerified as AccountVerifiedEvent } from "../generated/ServiceProvider/ServiceProvider"
// import { handleAccountVerified } from "../src/service-provider"
// import { createAccountVerifiedEvent } from "./service-provider-utils"

// // Tests structure (matchstick-as >=0.5.0)
// // https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

// describe("Describe entity assertions", () => {
//   beforeAll(() => {
//     let groupId = BigInt.fromI32(234)
//     let merkleTreeDepth = BigInt.fromI32(234)
//     let merkleTreeRoot = BigInt.fromI32(234)
//     let nullifier = BigInt.fromI32(234)
//     let message = BigInt.fromI32(234)
//     let scope = BigInt.fromI32(234)
//     let points = [BigInt.fromI32(234)]
//     let newAccountVerifiedEvent = createAccountVerifiedEvent(
//       groupId,
//       merkleTreeDepth,
//       merkleTreeRoot,
//       nullifier,
//       message,
//       scope,
//       points
//     )
//     handleAccountVerified(newAccountVerifiedEvent)
//   })

//   afterAll(() => {
//     clearStore()
//   })

//   // For more test scenarios, see:
//   // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

//   test("AccountVerified created and stored", () => {
//     assert.entityCount("AccountVerified", 1)

//     // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
//     assert.fieldEquals(
//       "AccountVerified",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "groupId",
//       "234"
//     )
//     assert.fieldEquals(
//       "AccountVerified",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "merkleTreeDepth",
//       "234"
//     )
//     assert.fieldEquals(
//       "AccountVerified",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "merkleTreeRoot",
//       "234"
//     )
//     assert.fieldEquals(
//       "AccountVerified",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "nullifier",
//       "234"
//     )
//     assert.fieldEquals(
//       "AccountVerified",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "message",
//       "234"
//     )
//     assert.fieldEquals(
//       "AccountVerified",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "scope",
//       "234"
//     )
//     assert.fieldEquals(
//       "AccountVerified",
//       "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
//       "points",
//       "[234]"
//     )

//     // More assert options:
//     // https://thegraph.com/docs/en/developer/matchstick/#asserts
//   })
// })
