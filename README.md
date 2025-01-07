# Contracts

## Compile

```bash
yarn compile
```

## Deploy

```bash
npx hardhat deploy:all \
  --network amoy \
  --semaphore-verifier 0x6C42599435B82121794D835263C846384869502d \
  --poseidon 0xB43122Ecb241DD50062641f089876679fd06599a
```

## Polygon Amoy Addresses

```
Manager: 0x221D8e05eAE92e63d8C584d514e89733f4bEB52D
ServiceProvider: 0x05de354d56C83da8b46176a711E535040D68af86
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
