//SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {SemaphoreGroups} from "@semaphore-protocol/contracts/base/SemaphoreGroups.sol";
import {IManager} from "./interfaces/IManager.sol";

contract Manager is SemaphoreGroups, IManager {
    uint256 public groupCounter;
    mapping(address => ManagerData) private _managers;

    function register() external returns (uint256 groupId) {
        if (_managers[msg.sender].isRegistered) {
            revert Manager__AlreadyRegistered();
        }

        groupId = groupCounter++;
        _createGroup(groupId, msg.sender);

        _managers[msg.sender] = ManagerData({
            isRegistered: true,
            groupId: groupId
        });

        emit ManagerRegistered(msg.sender, groupId);
    }

    function updateGroupManager(uint256 groupId, address newManager) external {
        _updateGroupAdmin(groupId, newManager);
    }

    function acceptGroupManager(uint256 groupId) external {
        _acceptGroupAdmin(groupId);
    }

    function addMember(uint256 groupId, uint256 identityCommitment) external {
        _addMember(groupId, identityCommitment);
    }

    function addMembers(uint256 groupId, uint256[] calldata identityCommitments) external {
        _addMembers(groupId, identityCommitments);
    }

    function updateMember(
        uint256 groupId,
        uint256 oldIdentityCommitment,
        uint256 newIdentityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external {
        _updateMember(groupId, oldIdentityCommitment, newIdentityCommitment, merkleProofSiblings);
    }

    function removeMember(
        uint256 groupId,
        uint256 identityCommitment,
        uint256[] calldata merkleProofSiblings
    ) external {
        _removeMember(groupId, identityCommitment, merkleProofSiblings);
    }

    // View functions

    function getGroupManager(uint256 groupId) external view returns (address) {
        return admins[groupId];
    }

    function managers(address manager) external view returns (ManagerData memory) {
        return _managers[manager];
    }

    function getMerkleTreeRoot(uint256 groupId) public view override(SemaphoreGroups, IManager) returns (uint256) {
        return super.getMerkleTreeRoot(groupId);
    }
}
