//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ISemaphoreVerifier} from "@semaphore-protocol/contracts/interfaces/ISemaphoreVerifier.sol";
import {IServiceProvider} from "./interfaces/IServiceProvider.sol";
import {IManager} from "./interfaces/IManager.sol";
import {MIN_DEPTH, MAX_DEPTH} from "@semaphore-protocol/contracts/base/Constants.sol";

contract ServiceProvider is IServiceProvider {
    ISemaphoreVerifier public immutable verifier;
    IManager public immutable manager;
    uint256 public serviceProviderCounter;

    mapping(address => ServiceProviderData) private _serviceProviders;
    mapping(uint256 serviceProviderId => address provider) public serviceProviderAddresses;
    mapping(uint256 groupId => mapping(uint256 nullifier => bool used)) public nullifiers;
    mapping(uint256 serviceProviderId => mapping(uint256 accountId => bool isVerified)) public verifiedAccounts;

    modifier onlyRegisteredServiceProvider() {
        if (!_serviceProviders[msg.sender].isRegistered) {
            revert ServiceProvider__NotRegistered();
        }
        _;
    }

    constructor(address _verifier, address _manager) {
        verifier = ISemaphoreVerifier(_verifier);
        manager = IManager(_manager);
    }

    function register() external returns (uint256 serviceProviderId) {
        if (isRegistered(msg.sender)) {
            revert ServiceProvider__AlreadyRegistered();
        }

        serviceProviderId = serviceProviderCounter++;

        _serviceProviders[msg.sender].isRegistered = true;
        _serviceProviders[msg.sender].serviceProviderId = serviceProviderId;

        serviceProviderAddresses[serviceProviderId] = msg.sender;

        emit ServiceProviderRegistered(serviceProviderId, msg.sender);
    }

    function setApprovedManager(uint256 managerId) external onlyRegisteredServiceProvider {
        _serviceProviders[msg.sender].approvedManagers[managerId] = true;
    }

    function removeApprovedManager(uint256 managerId) external onlyRegisteredServiceProvider {
        _serviceProviders[msg.sender].approvedManagers[managerId] = false;
    }

    function checkProof(uint256 groupId, SemaphoreProof calldata proof) public view returns (bool) {
        // check if merkle tree depth is valid
        if (proof.merkleTreeDepth < MIN_DEPTH || proof.merkleTreeDepth > MAX_DEPTH) {
            revert ServiceProvider__InvalidMerkleTreeDepth();
        }

        // check if group exists
        if (manager.getGroupManager(groupId) == address(0)) {
            revert ServiceProvider__GroupDoesNotExist();
        }

        // check if group ID is valid with provided proof
        if (manager.getMerkleTreeRoot(groupId) != proof.merkleTreeRoot) {
            revert ServiceProvider__InvalidTreeRoot();
        }

        // Check if this manager is approved by the service provider
        if (!isApprovedManagerById(proof.scope, groupId)) {
            revert ServiceProvider__ManagerNotApproved();
        }

        // check if nullifier has been used
        if (nullifiers[groupId][proof.nullifier]) {
            revert ServiceProvider__NullifierAlreadyUsed();
        }

        return
            verifier.verifyProof(
                [proof.points[0], proof.points[1]],
                [[proof.points[2], proof.points[3]], [proof.points[4], proof.points[5]]],
                [proof.points[6], proof.points[7]],
                [proof.merkleTreeRoot, proof.nullifier, _hash(proof.message), _hash(proof.scope)],
                proof.merkleTreeDepth
            );
    }

    function verifyAccount(uint256 groupId, SemaphoreProof calldata proof) external {
        if (!checkProof(groupId, proof)) {
            revert ServiceProvider__InvalidProof();
        }

        nullifiers[groupId][proof.nullifier] = true;

        // proof.scope is the serviceProviderId
        // proof.message is the accountId
        verifiedAccounts[proof.scope][proof.message] = true;

        emit AccountVerified(
            groupId,
            proof.merkleTreeDepth,
            proof.merkleTreeRoot,
            proof.nullifier,
            proof.message,
            proof.scope,
            proof.points
        );
    }

    // View functions

    function isRegistered(address provider) public view returns (bool) {
        return _serviceProviders[provider].isRegistered;
    }

    function getServiceProviderId(address provider) public view returns (uint256) {
        return _serviceProviders[provider].serviceProviderId;
    }

    function isApprovedManager(address provider, uint256 managerId) public view returns (bool) {
        return _serviceProviders[provider].approvedManagers[managerId];
    }

    function isApprovedManagerById(uint256 serviceProviderId, uint256 managerId) public view returns (bool) {
        return _serviceProviders[serviceProviderAddresses[serviceProviderId]].approvedManagers[managerId];
    }

    // Internal functions

    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}
