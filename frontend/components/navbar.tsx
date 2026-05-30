"use client";

import Image from "next/image";
import Link from "next/link";
import Github from "@/public/assets/github.png";
import type { Dispatch, SetStateAction } from "react";

declare global {
    interface Window {
        ethereum?: {
            request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
        };
    }
}

type NavbarProps = {
  accounts: string[];
  setAccounts: Dispatch<SetStateAction<string[]>>;
};

export default function Navbar({ accounts, setAccounts }: NavbarProps) {
  const isConnected = Boolean(accounts[0]);

  const connectAccount = async () => {
    try {
      if (typeof window !== "undefined" && window.ethereum) {
        const nextAccounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
        setAccounts(nextAccounts as string[]);
      } else {
        console.error("Ethereum provider not found.");
      }
    } catch (error) {
      console.error("Failed to connect to accounts:", error);
    }
  };

  return (
    <div className="flex justify-between items-center text-2xl px-8 py-6 font-wq text-white">
      <div className="flex">

        <Link
          href="https://github.com/cc1239539190-lgtm"
          target="_blank"
          rel="noopener noreferrer"
        >
          <div className="flex items-center space-x-2">
            <Image src={Github} alt="@lllu_23" width={36} height={36} />
            <span className="text-3xl px-4 text-black ">@源代码仓库</span>
          </div>
        </Link>
      </div>

      <div className="flex items-center space-x-6 text-2xl text-black">
        <Link
          href="mailto:cc1239539190@gmail.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          联系作者
        </Link>

        {isConnected ? (
          <p className="bg-pink-600 px-6 py-2 rounded-md">已连接</p>
        ) : (
          <button
            onClick={connectAccount}
            className="bg-pink-600 px-6 py-2 rounded-md shadow-lg hover:bg-pink-700 transition duration-300"
          >
            连接钱包
          </button>
        )}
      </div>
    </div>
  );
}
