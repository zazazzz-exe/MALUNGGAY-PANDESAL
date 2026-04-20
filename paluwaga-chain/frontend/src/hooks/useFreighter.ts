import { useCallback, useEffect } from "react";
import {
  getNetwork,
  getAddress,
  isConnected,
  requestAccess,
  signTransaction as freighterSignTransaction
} from "@stellar/freighter-api";
import { useWalletStore } from "../store/walletStore";

interface SignOptions {
  networkPassphrase: string;
  address: string;
}

const normalizeNetwork = (network: string | undefined): string => (network || "").toLowerCase();

export const useFreighter = () => {
  const {
    isInstalled,
    isConnected: connected,
    publicKey,
    network,
    isLoading,
    error,
    setInstalled,
    setConnection,
    setLoading,
    setError,
    disconnect: disconnectStore
  } = useWalletStore();

  const detectInstallation = useCallback(async () => {
    const result = await isConnected();
    const installed = result.isConnected;
    setInstalled(installed);
    return installed;
  }, [setInstalled]);

  const connect = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const installed = await detectInstallation();
      if (!installed) {
        throw new Error("Freighter is not installed.");
      }

      const access = await requestAccess();
      if (access.error) {
        throw new Error(access.error);
      }

      const keyRes = await getAddress();
      if (keyRes.error || !keyRes.address) {
        throw new Error(keyRes.error || "Unable to fetch public key.");
      }

      const networkRes = await getNetwork();
      if (networkRes.error || !networkRes.network) {
        throw new Error(networkRes.error || "Unable to fetch current network.");
      }

      if (!normalizeNetwork(networkRes.network).includes("test")) {
        throw new Error("Wrong network. Please switch Freighter to Testnet.");
      }

      setConnection(true, keyRes.address, networkRes.network);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Wallet connection failed.";
      setError(message.includes("rejected") ? "Connection request was rejected." : message);
      disconnectStore();
    } finally {
      setLoading(false);
    }
  }, [detectInstallation, disconnectStore, setConnection, setError, setLoading]);

  const disconnect = useCallback(() => {
    disconnectStore();
  }, [disconnectStore]);

  const signTransaction = useCallback(
    async (xdr: string, options: SignOptions): Promise<string> => {
      if (!connected || !publicKey) {
        throw new Error("Wallet is not connected.");
      }

      const networkRes = await getNetwork();
      if (networkRes.error || !networkRes.network) {
        throw new Error(networkRes.error || "Unable to verify network.");
      }

      if (!normalizeNetwork(networkRes.network).includes("test")) {
        throw new Error("Wrong network. Please switch Freighter to Testnet.");
      }

      const signed = await freighterSignTransaction(xdr, {
        networkPassphrase: options.networkPassphrase,
        address: options.address
      });

      if (signed.error || !signed.signedTxXdr) {
        throw new Error(signed.error || "Failed to sign transaction.");
      }

      return signed.signedTxXdr;
    },
    [connected, publicKey]
  );

  useEffect(() => {
    void detectInstallation();
  }, [detectInstallation]);

  return {
    isInstalled,
    isConnected: connected,
    publicKey,
    network,
    connect,
    disconnect,
    signTransaction,
    isLoading,
    error
  };
};
