import { useQuery } from "@tanstack/react-query";
import { sorobanService } from "../services/SorobanService";
import { stellarConfig } from "../services/stellar.config";

export const useMemberInfo = (
  address: string | null,
  contractId = stellarConfig.contractId
) =>
  useQuery({
    queryKey: ["member-info", contractId, address],
    queryFn: () => sorobanService.readContract(contractId, "get_member_info", [address]),
    enabled: Boolean(contractId && address)
  });
