//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SemaphoreGroups} from "@semaphore-protocol/contracts/base/SemaphoreGroups.sol";
import {IManager} from "./interfaces/IManager.sol";

/// @title Manager
/// @notice Contract for managing Semaphore groups and their registration fees
/// @dev Extends SemaphoreGroups to handle group management and registration fees
contract Manager is SemaphoreGroups, IManager {
    uint256 public groupCounter;
    mapping(address => uint256) private _managerGroupIds;
    mapping(uint256 groupId => uint256 fee) private _registrationFees;

    /// @notice Registers a new manager and creates their group
    /// @return groupId The ID of the newly created group
    function register() external returns (uint256 groupId) {
        if (_managerGroupIds[msg.sender] != 0) {
            revert Manager__AlreadyRegistered();
        }

        groupId = ++groupCounter;
        _createGroup(groupId, msg.sender);

        _managerGroupIds[msg.sender] = groupId;

        emit ManagerRegistered(msg.sender, groupId);
    }

    /// @notice Updates the manager of a group
    /// @param groupId The ID of the group
    /// @param newManager The address of the new manager
    function updateGroupManager(uint256 groupId, address newManager) external {
        _updateGroupAdmin(groupId, newManager);
    }

    /// @notice Accepts the role of group manager
    /// @param groupId The ID of the group to accept management of
    function acceptGroupManager(uint256 groupId) external {
        _acceptGroupAdmin(groupId);
    }

    /// @notice Adds a single member to a group
    /// @param groupId The ID of the group
    /// @param identityCommitment The commitment to add
    function addMember(uint256 groupId, uint256 identityCommitment) external {
        _addMember(groupId, identityCommitment);
    }

    /// @notice Adds multiple members to a group
    /// @param groupId The ID of the group
    /// @param identityCommitments Array of commitments to add
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external {
        _addMembers(groupId, identityCommitments);
    }

    /// @notice Updates a member's commitment in a group
    /// @param groupId The ID of the group
    /// @param oldIdentityCommitment The old commitment to update
    /// @param newIdentityCommitment The new commitment to update to
    /// @param merkleProofSiblings Array of the merkle proof siblings
    function updateMember(
        uint256 groupId,
        uint256 oldIdentityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external {
        _updateMember(groupId, oldIdentityCommitment, newIdentityCommitment, merkleProofSiblings);
    }

    /// @notice Removes a member from a group
    /// @param groupId The ID of the group
    /// @param identityCommitment The commitment to remove
    /// @param merkleProofSiblings Array of the merkle proof siblings
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external {
        _removeMember(groupId, identityCommitment, merkleProofSiblings);
    }

    /// @notice Sets the registration fee for a manager's group
    /// @param fee The fee amount to set
    function setRegistrationFee(uint256 fee) external {
        uint256 groupId = _managerGroupIds[msg.sender];
        if (groupId == 0) {
            revert Manager__NotRegistered();
        }
        _registrationFees[groupId] = fee;
        emit RegistrationFeeUpdated(groupId, fee);
    }

    /// @notice Gets the registration fee for a group
    /// @param groupId The ID of the group
    /// @return The registration fee amount
    function getRegistrationFee(uint256 groupId) external view returns (uint256) {
        return _registrationFees[groupId];
    }

    /// @notice Gets the manager address for a group
    /// @param groupId The ID of the group
    /// @return The manager's address
    function getManagerAddress(uint256 groupId) external view returns (address) {
        return admins[groupId];
    }

    /// @notice Gets the group ID for a manager
    /// @param manager The address of the manager
    /// @return The group ID
    function getManagerGroupId(address manager) external view returns (uint256) {
        return _managerGroupIds[manager];
    }

    /// @notice Gets the Merkle tree root for a group
    /// @param groupId The ID of the group
    /// @return The Merkle tree root
    function getMerkleTreeRoot(uint256 groupId) public view override(SemaphoreGroups, IManager) returns (uint256) {
        return super.getMerkleTreeRoot(groupId);
    }
}
