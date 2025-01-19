# Contracts

## Compile

```bash
yarn compile
```

## Deploy

```bash
yarn hardhat deploy:all \
  --network amoy \
  --semaphore-verifier 0x6C42599435B82121794D835263C846384869502d \
  --poseidon 0xB43122Ecb241DD50062641f089876679fd06599a
```

## Polygon Amoy Addresses

```
Manager: 0x87fCD11dC167A78547669d4BAFcB0b549A314756
ServiceProvider: 0x624f574416F7eeA8552fBDAbd5bC347980d3E013
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
