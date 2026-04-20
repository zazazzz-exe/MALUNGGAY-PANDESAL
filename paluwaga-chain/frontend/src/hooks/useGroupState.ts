import { useQuery } from "@tanstack/react-query";
import { sorobanService } from "../services/SorobanService";
import { stellarConfig } from "../services/stellar.config";

export const useGroupState = (contractId = stellarConfig.contractId) =>
  useQuery({
    queryKey: ["group-state", contractId],
    queryFn: () => sorobanService.readContract(contractId, "get_group_state", []),
    refetchInterval: 10_000,
    enabled: Boolean(contractId)
  });
