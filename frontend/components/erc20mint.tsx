"use client";

import { useEffect, useState } from "react";
import {
  fetchLZWCoinBalance,
  mintLZWCoin,
} from "@/lib/lzwcoin";
import { loadRuntimeContractConfig } from "@/lib/runtime-config";

type MintERC20Props = {
  accounts: string[];
};

export default function MintERC20({ accounts }: MintERC20Props) {
  const [balance, setBalance] = useState<string | null>(null);
  const [mintAmount, setMintAmount] = useState(1);
  const [runtimeReady, setRuntimeReady] = useState(false);
  const isConnected = Boolean(accounts[0]);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      await loadRuntimeContractConfig();
      if (!cancelled) {
        setRuntimeReady(true);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!isConnected || !runtimeReady) {
      return;
    }

    let disposed = false;

    const refreshBalance = async () => {
      try {
        const nextBalance = await fetchLZWCoinBalance(accounts[0]);
        if (!disposed) {
          setBalance(nextBalance);
        }
      } catch (error) {
        console.error("error fetching balance", error);
      }
    };

    void refreshBalance();
    const intervalId = window.setInterval(() => {
      void refreshBalance();
    }, 1000);

    return () => {
      disposed = true;
      window.clearInterval(intervalId);
    };
  }, [accounts, isConnected, runtimeReady]);

  const handleMint = async () => {
    try {
      await mintLZWCoin(mintAmount);
      const nextBalance = await fetchLZWCoinBalance(accounts[0]);
      setBalance(nextBalance);
    } catch (error) {
      console.error("error", error);
    }
  };

  return (
    <div className="flex flex-col flex-grow justify-center items-center font-wq mb-12 mt-20 text-black-600">
      <div className="w-[640px] text-center">
        <h1 className="text-8xl text-[#000000] text-bold [text-shadow_8px_8px_16px_rgba(0,0,0,0.6)] ">铸造 LZWCoin</h1>
        {isConnected ? (
          <>
            <p className="text-4xl mt-20 mb-12 animate-pulse">
              开始铸造你的第一个 LZWCoin 代币吧!
            </p>
            <div className="flex justify-center mt-4">
              <input
                value={mintAmount}
                onChange={(event) => setMintAmount(Number(event.target.value))}
                className="text-center w-80 h-10 mt-4 mb-4 text-black-600 text-2xl"
                type="number"
                placeholder="请输入你想要铸造的代币数量..."
                min="0"
              />
            </div>

            <div className="flex-col justify-center items-center mt-8">
              <button
                onClick={handleMint}
                className="bg-[#D6517D] rounded-md shadow-md text-2xl p-4 w-80"
              >
                立即铸造！
              </button>
              <p className="text-[#ff2c73] text-xl animate-pulse mt-4">
                当前的 LZWCoin 代币余额：{" "}
                {balance !== null ? `${balance} LLC` : "正在加载中..."}
              </p>
            </div>
          </>
        ) : (
          <div className="flex justify-center text-6xl items-center mt-48 mb-20">
            <p className="animate-pulse">连接钱包以开始铸造代币...</p>
          </div>
        )}
      </div>
    </div>
  );
}
