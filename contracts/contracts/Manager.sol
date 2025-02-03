// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SemaphoreGroups} from "@semaphore-protocol/contracts/base/SemaphoreGroups.sol";
import {IManager} from "./interfaces/IManager.sol";

/// @title Manager
/// @notice Manages Semaphore groups and their associated registration fees.
/// @dev Inherits SemaphoreGroups to extend functionality for group management.
contract Manager is SemaphoreGroups, IManager {
    uint256 public groupCounter;
    mapping(address => uint256) private _managerGroupIds;
    mapping(uint256 => uint256) private _registrationFees;
    // Tracks whether a group is sealed (prevents updates and removals)
    mapping(uint256 => bool) private _sealed;


    /// @notice Ensures the group has not been sealed
    /// @param groupId The group ID to check
    modifier notSealed(uint256 groupId) {
        if (_sealed[groupId]) {
            revert Manager__GroupHasBeenSealed(groupId);
        }
        _;
    }

    /// @notice Registers the caller as a manager and creates a group.
    /// @return groupId The ID of the newly created group.
    function register() external returns (uint256 groupId) {
        if (_managerGroupIds[msg.sender] != 0) {
            revert Manager__AlreadyRegistered();
        }

        groupId = ++groupCounter;
        _createGroup(groupId, msg.sender);
        _managerGroupIds[msg.sender] = groupId;

        emit ManagerRegistered(msg.sender, groupId);
    }

    /// @notice Updates the manager address for a specified group.
    /// @param groupId The ID of the group.
    /// @param newManager The address of the new manager.
    function updateGroupManager(uint256 groupId, address newManager) external {
        _updateGroupAdmin(groupId, newManager);
    }

    /// @notice Allows the new manager address to accept manager role of a group.
    /// @param groupId The ID of the group.
    function acceptGroupManager(uint256 groupId) external {
        _acceptGroupAdmin(groupId);
    }

    /// @notice Adds a new member to a group.
    /// @param groupId The ID of the group.
    /// @param identityCommitment The identity commitment of the new member.
    function addMember(uint256 groupId, uint256 identityCommitment) external {
        _addMember(groupId, identityCommitment);
    }

    /// @notice Adds multiple new members to a group.
    /// @param groupId The ID of the group.
    /// @param identityCommitments An array of identity commitments for the new members.
    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external {
        _addMembers(groupId, identityCommitments);
    }

    /// @notice Updates an existing member's identity commitment within a group.
    /// @param groupId The ID of the group.
    /// @param oldIdentityCommitment The member's current commitment.
    /// @param newIdentityCommitment The member's updated commitment.
    /// @param merkleProofSiblings An array of sibling nodes of a Merkle proof.
    function updateMember(
        uint256 groupId,
        uint256 oldIdentityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external notSealed(groupId) {
        _updateMember(groupId, oldIdentityCommitment, newIdentityCommitment, merkleProofSiblings);
    }

    /// @notice Removes an existing member from a group.
    /// @param groupId The ID of the group.
    /// @param identityCommitment The identity commitment of the member to remove.
    /// @param merkleProofSiblings An array of sibling nodes of a Merkle proof.
    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external notSealed(groupId) {
        _removeMember(groupId, identityCommitment, merkleProofSiblings);
    }

    /// @notice Sets the registration fee for the caller's group.
    /// @param fee The fee amount to be set.
    function setRegistrationFee(uint256 fee) external {
        uint256 groupId = _managerGroupIds[msg.sender];
        if (groupId == 0) {
            revert Manager__NotRegistered();
        }
        _registrationFees[groupId] = fee;
        emit RegistrationFeeUpdated(groupId, fee);
    }

    /// @notice Seals the group so that member updates and removals are disabled.
    /// @dev Once sealed, the group can only have new members added.
    /// Reverts if caller is not registered as a manager or if group is already sealed.
    function sealGroup() external {
        uint256 groupId = _managerGroupIds[msg.sender];
        if (groupId == 0) {
            revert Manager__NotRegistered();
        }
        if (_sealed[groupId]) {
            revert Manager__AlreadySealed();
        }
        _sealed[groupId] = true;
        emit GroupSealed(groupId);
    }

    /// @notice Retrieves the registration fee for a specified group.
    /// @param groupId The ID of the group.
    /// @return The fee amount associated with the group.
    function getRegistrationFee(uint256 groupId) external view returns (uint256) {
        return _registrationFees[groupId];
    }

    /// @notice Retrieves the current manager's address for a specified group.
    /// @param groupId The ID of the group.
    /// @return The address of the group's manager.
    function getManagerAddress(uint256 groupId) external view returns (address) {
        return admins[groupId];
    }

    /// @notice Retrieves the group ID associated with a manager.
    /// @param manager The address of the manager.
    /// @return The group ID managed by the provided address.
    function getManagerGroupId(address manager) external view returns (uint256) {
        return _managerGroupIds[manager];
    }

    /// @notice Retrieves the Merkle tree root for a specified group.
    /// @param groupId The unique identifier of the group.
    /// @return The current Merkle tree root of the group.
    function getMerkleTreeRoot(uint256 groupId)
        public
        view
        override(SemaphoreGroups, IManager)
        returns (uint256)
    {
        return super.getMerkleTreeRoot(groupId);
    }
}
