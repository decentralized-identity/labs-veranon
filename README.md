# Contracts

## Compile

```bash
yarn compile
```

## Deploy

```bash
yarn deploy:all \
  --network amoy \
  --semaphore-verifier 0x6C42599435B82121794D835263C846384869502d \
  --poseidon 0xB43122Ecb241DD50062641f089876679fd06599a
```

## Polygon Amoy Addresses

```
Manager: 0x921b2F47fC269c11430157A8899EF0e44eb17FC9
ServiceProvider: 0x45D3fB27548c6B1CC0b11782C0AbB3395d11Ec41
```

## Test

```bash
yarn test
```

```bash
yarn test:coverage
```

## Temporary Fix for `InternalLeanIMT.sol`

in the `_update` function, the following needs to be added in both path flows to address the update bug:

```solidity
...previous code...

if (siblingNodes[i] >= SNARK_SCALAR_FIELD) {
    revert LeafGreaterThanSnarkScalarField();
}

// Add this below the snark scalar field check
if (self.sideNodes[level] == oldRoot) {
    self.sideNodes[level] = node;
}

...rest of the code...
```

For now, this will need to be manually added to the `InternalLeanIMT.sol` file and refreshed accordingly after the issue is fixed and merged.
