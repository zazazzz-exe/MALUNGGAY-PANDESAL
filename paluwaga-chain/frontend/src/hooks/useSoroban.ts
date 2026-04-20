import { useMutation } from "@tanstack/react-query";
import { sorobanService } from "../services/SorobanService";
import { stellarConfig } from "../services/stellar.config";
import { useFreighter } from "./useFreighter";

export const useSoroban = () => {
  const { publicKey } = useFreighter();

  const invokeMutation = useMutation({
    mutationFn: async ({
      method,
      args,
      contractId
    }: {
      method: string;
      args: unknown[];
      contractId?: string;
    }) => {
      if (!publicKey) {
        throw new Error("Wallet not connected.");
      }

      return sorobanService.invokeContract(
        contractId || stellarConfig.contractId,
        method,
        args,
        publicKey
      );
    }
  });

  return {
    invokeContract: invokeMutation.mutateAsync,
    isInvoking: invokeMutation.isPending,
    invokeError: invokeMutation.error
  };
};
