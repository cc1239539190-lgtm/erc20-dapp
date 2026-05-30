// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import {Script} from "forge-std/Script.sol";
import {LZWCoin} from "../src/LZWCoin.sol";

contract DeployLZWCoin is Script {
    function run() external returns (LZWCoin lzwCoin) {
        uint256 ownerPrivateKey = vm.envUint("OWNER_PRIVATE_KEY");
        address ownerAddress = vm.envAddress("OWNER_ADDRESS");

        vm.startBroadcast(ownerPrivateKey);
        lzwCoin = new LZWCoin(ownerAddress);
        vm.stopBroadcast();
    }
}