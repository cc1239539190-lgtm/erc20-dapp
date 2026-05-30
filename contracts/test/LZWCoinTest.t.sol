// SPDX-License-Identifier: MIT

pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {LZWCoin} from "../src/LZWCoin.sol";

/// @notice Tests for LZWCoin owner-only mint/burn behavior.
contract LZWCoinTest is Test {
    LZWCoin public lzw;

    address owner = vm.addr(1);
    address user = vm.addr(2);

    /// @dev Deploys the token and seeds the owner with ETH for transactions.
    function setUp() public {
        lzw = new LZWCoin(owner);
        vm.deal(owner, 10 ether);
    }

    /// @notice Owner can mint tokens.
    function testSuccessIfOwnerMint() public {
        vm.startPrank(owner);
        lzw.mint(10 ether);
        vm.stopPrank();

        assertEq(lzw.balanceOf(owner), 10 ether);
    }

    /// @notice Non-owner cannot mint tokens.
    /// @dev Expects revert from Ownable.
    function testRevertIfUserMint() public {
        vm.startPrank(user);
        vm.expectRevert();
        lzw.mint(10 ether);
        vm.stopPrank();

        assertEq(lzw.balanceOf(user), 0 ether);
    }

    /// @notice Owner can burn tokens.
    function testSuccessIfOwnerBurn() public {
        vm.startPrank(owner);
        lzw.mint(10 ether);
        vm.stopPrank();

        assertEq(lzw.balanceOf(owner), 10 ether);
        vm.startPrank(owner);
        lzw.burn(5 ether);
        vm.stopPrank();

        assertEq(lzw.balanceOf(owner), 5 ether);
    }

    /// @notice Non-owner cannot burn tokens.
    /// @dev Expects revert from Ownable.
    function testRevertIfUserBurn() public {
        vm.startPrank(owner);
        lzw.mint(10 ether);
        vm.stopPrank();

        assertEq(lzw.balanceOf(owner), 10 ether);

        vm.startPrank(user);
        vm.expectRevert();
        lzw.burn(5 ether);
        vm.stopPrank();

        assertEq(lzw.balanceOf(owner), 10 ether);
        assertEq(lzw.balanceOf(user), 0 ether);
    }
}
