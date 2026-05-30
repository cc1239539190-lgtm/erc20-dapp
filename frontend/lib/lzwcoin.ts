import { ethers } from "ethers";
import type { ContractInterface } from "ethers";
import LZWCoin from "../LZWCoin.json";
import {
  getResolvedRuntimeConfig,
  loadRuntimeContractConfig,
} from "./runtime-config";

const getEthereum = () => {
    if (typeof window !== "undefined" && window.ethereum) {
        return window.ethereum;
    }
    return undefined;
};

const getContract = async () => {
    await loadRuntimeContractConfig();

    const ethereum = getEthereum();
    if (!ethereum) {
        throw new Error("Ethereum provider not found.");
    }

    const provider = new ethers.providers.Web3Provider(
        ethereum as ethers.providers.ExternalProvider
    );
    const signer = provider.getSigner();
    return new ethers.Contract(
        getResolvedRuntimeConfig().lzwCoinAddress,
        LZWCoin.abi as ContractInterface,
        signer
    );
};

export const mintLZWCoin = async (amount: number) => {
  const contract = await getContract();
  const parsedAmount = ethers.utils.parseUnits(amount.toString(), 18);
  const response = await contract.mint(parsedAmount);
  return response.wait();
};

export const fetchLZWCoinBalance = async (account: string) => {
  const contract = await getContract();
  const userBalance = await contract.balanceOf(account);
  return parseFloat(ethers.utils.formatUnits(userBalance, 18)).toFixed(2);
};
