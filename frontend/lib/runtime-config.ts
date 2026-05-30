const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEFAULT_RPC_URL = "http://127.0.0.1:8545";
const DEFAULT_CHAIN_ID = 31337;
const WINDOW_CONFIG_KEY = "__ERC20_RUNTIME_CONFIG__";

export type RuntimeContractConfig = {
  lzwCoinAddress: string;
  rpcUrl: string;
  chainId: number;
};

type RuntimeContractConfigSource = {
  lzwCoinAddress?: unknown;
  rpcUrl?: unknown;
  chainId?: unknown;
};

let runtimeConfigCache: RuntimeContractConfig | null = null;
let runtimeConfigLoadPromise: Promise<RuntimeContractConfig> | null = null;

const isAddress = (value: unknown): value is string =>
  typeof value === "string" && /^0x[a-fA-F0-9]{40}$/.test(value);

const asAddress = (value: unknown, fallback: string): string =>
  isAddress(value) ? value : fallback;

const asChainId = (value: unknown, fallback: number): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const asRpcUrl = (value: unknown, fallback: string): string =>
  typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;

const normalizeRuntimeConfig = (
  runtimeConfig?: RuntimeContractConfigSource
): RuntimeContractConfig => ({
  lzwCoinAddress: asAddress(runtimeConfig?.lzwCoinAddress, ZERO_ADDRESS),
  rpcUrl: asRpcUrl(runtimeConfig?.rpcUrl, DEFAULT_RPC_URL),
  chainId: asChainId(runtimeConfig?.chainId, DEFAULT_CHAIN_ID),
});

const getEnvRuntimeConfig = (): RuntimeContractConfig =>
  normalizeRuntimeConfig({
    lzwCoinAddress: process.env.NEXT_PUBLIC_LZWCoin_ADDRESS,
    rpcUrl: process.env.NEXT_PUBLIC_RPC_URL,
    chainId: process.env.NEXT_PUBLIC_CHAIN_ID,
  });

const getWindowRuntimeConfig = (): RuntimeContractConfigSource => {
  if (typeof window === "undefined") {
    return {};
  }

  const runtime = (window as unknown as Record<string, unknown>)[WINDOW_CONFIG_KEY];
  if (!runtime || typeof runtime !== "object") {
    return {};
  }

  const objectValue = runtime as Record<string, unknown>;
  return normalizeRuntimeConfig({
    lzwCoinAddress: objectValue.lzwCoinAddress,
    rpcUrl: objectValue.rpcUrl,
    chainId: objectValue.chainId,
  });
};

const resolveRuntimeConfigSnapshot = (): RuntimeContractConfig => {
  const envConfig = getEnvRuntimeConfig();
  const windowConfig = getWindowRuntimeConfig();

  return normalizeRuntimeConfig({
    lzwCoinAddress: windowConfig.lzwCoinAddress ?? envConfig.lzwCoinAddress,
    rpcUrl: windowConfig.rpcUrl ?? envConfig.rpcUrl,
    chainId: windowConfig.chainId ?? envConfig.chainId,
  });
};

const cacheRuntimeConfig = (runtimeConfig: RuntimeContractConfig) => {
  runtimeConfigCache = normalizeRuntimeConfig(runtimeConfig);
  if (typeof window !== "undefined") {
    (window as unknown as Record<string, unknown>)[WINDOW_CONFIG_KEY] =
      runtimeConfigCache;
  }
  return runtimeConfigCache;
};

export const getResolvedRuntimeConfig = (): RuntimeContractConfig =>
  runtimeConfigCache ?? resolveRuntimeConfigSnapshot();

export const loadRuntimeContractConfig = async (): Promise<RuntimeContractConfig> => {
  if (runtimeConfigCache) {
    return runtimeConfigCache;
  }

  if (runtimeConfigLoadPromise) {
    return runtimeConfigLoadPromise;
  }

  if (typeof window === "undefined") {
    return cacheRuntimeConfig(resolveRuntimeConfigSnapshot());
  }

  runtimeConfigLoadPromise = (async () => {
    try {
      const response = await fetch("/contract-config.json", { cache: "no-store" });
      if (response.ok) {
        const data = (await response.json()) as RuntimeContractConfigSource;
        return cacheRuntimeConfig(normalizeRuntimeConfig(data));
      }
    } catch {
      // 忽略 public 配置读取失败，继续回退到 env/default。
    }

    return cacheRuntimeConfig(resolveRuntimeConfigSnapshot());
  })();

  try {
    return await runtimeConfigLoadPromise;
  } finally {
    runtimeConfigLoadPromise = null;
  }
};
