//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ISemaphoreVerifier} from "@semaphore-protocol/contracts/interfaces/ISemaphoreVerifier.sol";
import {IServiceProvider} from "./interfaces/IServiceProvider.sol";
import {IManager} from "./interfaces/IManager.sol";
import {MIN_DEPTH, MAX_DEPTH} from "@semaphore-protocol/contracts/base/Constants.sol";

/// @title ServiceProvider
/// @notice Contract for managing service providers and verifying Semaphore proofs
/// @dev Implements proof verification and account management for service providers
contract ServiceProvider is IServiceProvider {
    ISemaphoreVerifier public immutable verifier;
    IManager public immutable manager;
    uint256 public serviceProviderCounter;

    mapping(address => ServiceProviderData) private _serviceProviders;
    mapping(uint256 serviceProviderId => address provider) public serviceProviderAddresses;
    mapping(uint256 groupId => mapping(uint256 nullifier => bool used)) public nullifiers;
    mapping(uint256 serviceProviderId => mapping(uint256 accountId => bool isVerified)) public verifiedAccounts;

    /// @notice Modifier to restrict function access to registered service providers
    modifier onlyRegisteredServiceProvider() {
        if (_serviceProviders[msg.sender].serviceProviderId == 0) {
            revert ServiceProvider__NotRegistered();
        }
        _;
    }

    /// @notice Initializes the contract with verifier and manager addresses
    /// @param _verifier Address of the Semaphore verifier contract
    /// @param _manager Address of the Manager contract
    constructor(address _verifier, address _manager) {
        verifier = ISemaphoreVerifier(_verifier);
        manager = IManager(_manager);
    }

    /// @notice Registers a new service provider
    /// @return serviceProviderId The ID of the newly registered service provider
    function register() external returns (uint256 serviceProviderId) {
        if (isRegistered(msg.sender)) {
            revert ServiceProvider__AlreadyRegistered();
        }

        serviceProviderId = ++serviceProviderCounter;

        _serviceProviders[msg.sender].serviceProviderId = serviceProviderId;
        serviceProviderAddresses[serviceProviderId] = msg.sender;

        emit ServiceProviderRegistered(serviceProviderId, msg.sender);
    }

    /// @notice Sets an approved manager for the service provider
    /// @param groupId The ID of the manager's group to approve
    function setApprovedManager(uint256 groupId) external payable onlyRegisteredServiceProvider {
        // Check if manager is already approved
        if (_serviceProviders[msg.sender].approvedManagers[groupId]) {
            revert ServiceProvider__ManagerAlreadyApproved();
        }

        uint256 requiredFee = manager.getRegistrationFee(groupId);
        if (msg.value < requiredFee) {
            revert ServiceProvider__InsufficientFee();
        }

        address managerAddress = manager.getManagerAddress(groupId);
        
        if (requiredFee > 0) {
            (bool success, ) = managerAddress.call{value: msg.value}("");
            if (!success) {
                revert ServiceProvider__FeeTransferFailed();
            }
        }

        _serviceProviders[msg.sender].approvedManagers[groupId] = true;
        
        emit ManagerApproved(msg.sender, groupId);
    }

    /// @notice Removes an approved manager for the service provider
    /// @param managerId The ID of the manager to remove approval for
    function removeApprovedManager(uint256 managerId) external onlyRegisteredServiceProvider {
        _serviceProviders[msg.sender].approvedManagers[managerId] = false;
    }

    /// @notice Checks if a Semaphore proof is valid
    /// @param groupId The ID of the group
    /// @param proof The Semaphore proof to verify
    /// @return bool indicating if the proof is valid
    function checkProof(uint256 groupId, SemaphoreProof calldata proof) public view returns (bool) {
        // check if merkle tree depth is valid
        if (proof.merkleTreeDepth < MIN_DEPTH || proof.merkleTreeDepth > MAX_DEPTH) {
            revert ServiceProvider__InvalidMerkleTreeDepth();
        }

        // check if group exists
        if (manager.getManagerAddress(groupId) == address(0)) {
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

    /// @notice Verifies an account using a Semaphore proof
    /// @param groupId The ID of the group
    /// @param proof The Semaphore proof for verification
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

    /// @notice Checks if an address is a registered service provider
    /// @param provider The address to check
    /// @return bool indicating if the address is registered
    function isRegistered(address provider) public view returns (bool) {
        return _serviceProviders[provider].serviceProviderId != 0;
    }

    /// @notice Gets the service provider ID for an address
    /// @param provider The address to get the ID for
    /// @return The service provider ID
    function getServiceProviderId(address provider) public view returns (uint256) {
        return _serviceProviders[provider].serviceProviderId;
    }

    /// @notice Checks if a manager is approved by a service provider
    /// @param provider The service provider address
    /// @param managerId The manager ID to check
    /// @return bool indicating if the manager is approved
    function isApprovedManager(address provider, uint256 managerId) public view returns (bool) {
        return _serviceProviders[provider].approvedManagers[managerId];
    }

    /// @notice Checks if a manager is approved by a service provider using IDs
    /// @param serviceProviderId The service provider ID
    /// @param managerId The manager ID to check
    /// @return bool indicating if the manager is approved
    function isApprovedManagerById(uint256 serviceProviderId, uint256 managerId) public view returns (bool) {
        return _serviceProviders[serviceProviderAddresses[serviceProviderId]].approvedManagers[managerId];
    }

    /// @notice Hashes a message for proof verification
    /// @param message The message to hash
    /// @return The hashed message
    function _hash(uint256 message) private pure returns (uint256) {
        return uint256(keccak256(abi.encodePacked(message))) >> 8;
    }
}
