import {
  assert,
  describe,
  test,
  clearStore,
  beforeAll,
  afterAll
} from "matchstick-as/assembly/index"
import { BigInt, Address } from "@graphprotocol/graph-ts"
import { GroupAdminPending } from "../generated/schema"
import { GroupAdminPending as GroupAdminPendingEvent } from "../generated/Manager/Manager"
import { handleGroupAdminPending } from "../src/manager"
import { createGroupAdminPendingEvent } from "./manager-utils"

// Tests structure (matchstick-as >=0.5.0)
// https://thegraph.com/docs/en/developer/matchstick/#tests-structure-0-5-0

describe("Describe entity assertions", () => {
  beforeAll(() => {
    let groupId = BigInt.fromI32(234)
    let oldAdmin = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newAdmin = Address.fromString(
      "0x0000000000000000000000000000000000000001"
    )
    let newGroupAdminPendingEvent = createGroupAdminPendingEvent(
      groupId,
      oldAdmin,
      newAdmin
    )
    handleGroupAdminPending(newGroupAdminPendingEvent)
  })

  afterAll(() => {
    clearStore()
  })

  // For more test scenarios, see:
  // https://thegraph.com/docs/en/developer/matchstick/#write-a-unit-test

  test("GroupAdminPending created and stored", () => {
    assert.entityCount("GroupAdminPending", 1)

    // 0xa16081f360e3847006db660bae1c6d1b2e17ec2a is the default address used in newMockEvent() function
    assert.fieldEquals(
      "GroupAdminPending",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "groupId",
      "234"
    )
    assert.fieldEquals(
      "GroupAdminPending",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "oldAdmin",
      "0x0000000000000000000000000000000000000001"
    )
    assert.fieldEquals(
      "GroupAdminPending",
      "0xa16081f360e3847006db660bae1c6d1b2e17ec2a-1",
      "newAdmin",
      "0x0000000000000000000000000000000000000001"
    )

    // More assert options:
    // https://thegraph.com/docs/en/developer/matchstick/#asserts
  })
})
