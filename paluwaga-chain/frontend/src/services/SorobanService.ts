import {
  Asset,
  BASE_FEE,
  Horizon,
  Operation,
  Transaction,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr
} from "stellar-sdk";
import { signTransaction as freighterSignTransaction } from "@stellar/freighter-api";
import { stellarConfig } from "./stellar.config";

export class SorobanService {
  private rpcServer: rpc.Server;
  private horizonServer: Horizon.Server;

  private isStellarAddress(value: unknown): value is string {
    return typeof value === "string" && /^[GC][A-Z2-7]{55}$/.test(value);
  }

  private toScVal(value: unknown): xdr.ScVal {
    if (this.isStellarAddress(value)) {
      return nativeToScVal(value, { type: "address" });
    }

    return nativeToScVal(value);
  }

  constructor() {
    this.rpcServer = new rpc.Server(stellarConfig.sorobanRpcUrl);
    this.horizonServer = new Horizon.Server(stellarConfig.horizonUrl);
  }

  async invokeContract(
    contractId: string,
    method: string,
    args: unknown[],
    signerPublicKey: string
  ): Promise<string> {
    const account = await this.rpcServer.getAccount(signerPublicKey);

    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: method,
          args: args.map((arg) => this.toScVal(arg))
        })
      )
      .setTimeout(120)
      .build();

    const simulation = await this.rpcServer.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    const prepared = rpc.assembleTransaction(tx, simulation).build();
    const unsignedXdr = prepared.toXDR();

    const signed = await freighterSignTransaction(unsignedXdr, {
      networkPassphrase: stellarConfig.networkPassphrase,
      address: signerPublicKey
    });

    if (signed.error || !signed.signedTxXdr) {
      throw new Error(signed.error || "Freighter signing failed.");
    }

    const signedTx = TransactionBuilder.fromXDR(
      signed.signedTxXdr,
      stellarConfig.networkPassphrase
    ) as Transaction;

    const sendResponse = await this.rpcServer.sendTransaction(signedTx);
    if (sendResponse.status === "ERROR") {
      const reason =
        typeof sendResponse.errorResult === "string"
          ? sendResponse.errorResult
          : JSON.stringify(sendResponse.errorResult);
      throw new Error(reason || "sendTransaction failed.");
    }

    if (!sendResponse.hash) {
      throw new Error("Missing transaction hash after submission.");
    }

    const hash = sendResponse.hash;
    for (let i = 0; i < 20; i += 1) {
      const txResult = await this.rpcServer.getTransaction(hash);
      if (txResult.status === rpc.Api.GetTransactionStatus.SUCCESS) {
        return hash;
      }
      if (txResult.status === rpc.Api.GetTransactionStatus.FAILED) {
        throw new Error(`Transaction failed: ${txResult.resultXdr || "unknown"}`);
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }

    throw new Error("Timed out waiting for transaction confirmation.");
  }

  async readContract(contractId: string, method: string, args: unknown[]): Promise<any> {
    const source = await this.rpcServer.getAccount(
      "GBRPYHIL2C3L2AU6J6N4VYUXRDMQ2SBZ6QW6IYQ4F6V5O7WKRJY2Q6XJ"
    );

    const tx = new TransactionBuilder(source, {
      fee: BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: method,
          args: args.map((arg) => this.toScVal(arg))
        })
      )
      .setTimeout(30)
      .build();

    const simulation = await this.rpcServer.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(`Read simulation failed: ${simulation.error}`);
    }

    if (!simulation.result?.retval) {
      return null;
    }

    return scValToNative(simulation.result.retval as xdr.ScVal);
  }

  async getAccountBalance(publicKey: string, assetCode: string, assetIssuer: string): Promise<string> {
    const account = await this.horizonServer.loadAccount(publicKey);
    const balance = account.balances.find(
      (b) =>
        (b.asset_type === "credit_alphanum4" || b.asset_type === "credit_alphanum12") &&
        b.asset_code === assetCode &&
        b.asset_issuer === assetIssuer
    );

    return balance?.balance || "0";
  }

  async sendNativePayment(
    senderPublicKey: string,
    destinationPublicKey: string,
    amount: string
  ): Promise<string> {
    const trimmedAmount = amount.trim();
    const normalizedAmount = Number(trimmedAmount);

    if (!this.isStellarAddress(destinationPublicKey)) {
      throw new Error("Invalid destination address.");
    }

    if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
      throw new Error("Enter a valid XLM amount.");
    }

    const sourceAccount = await this.horizonServer.loadAccount(senderPublicKey);

    const tx = new TransactionBuilder(sourceAccount, {
      fee: BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase
    })
      .addOperation(
        Operation.payment({
          destination: destinationPublicKey,
          asset: Asset.native(),
          amount: normalizedAmount.toFixed(7)
        })
      )
      .setTimeout(120)
      .build();

    const signed = await freighterSignTransaction(tx.toXDR(), {
      networkPassphrase: stellarConfig.networkPassphrase,
      address: senderPublicKey
    });

    if (signed.error || !signed.signedTxXdr) {
      throw new Error(signed.error || "Freighter signing failed.");
    }

    const signedTx = TransactionBuilder.fromXDR(
      signed.signedTxXdr,
      stellarConfig.networkPassphrase
    ) as Transaction;

    const submitted = await this.horizonServer.submitTransaction(signedTx);
    if (!submitted.hash) {
      throw new Error("Missing transaction hash after transfer.");
    }

    return submitted.hash;
  }

  async buildContributeTransaction(
    contractId: string,
    memberPublicKey: string,
    amount: string
  ): Promise<string> {
    const account = await this.rpcServer.getAccount(memberPublicKey);
    const tx = new TransactionBuilder(account, {
      fee: BASE_FEE,
      networkPassphrase: stellarConfig.networkPassphrase
    })
      .addOperation(
        Operation.invokeContractFunction({
          contract: contractId,
          function: "contribute",
          args: [this.toScVal(memberPublicKey)]
        })
      )
      .setTimeout(120)
      .build();

    const simulation = await this.rpcServer.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simulation)) {
      throw new Error(`Simulation failed: ${simulation.error}`);
    }

    const prepared = rpc.assembleTransaction(tx, simulation).build();
    return prepared.toXDR();
  }
}

export const sorobanService = new SorobanService();

export const getUsdcAsset = () => {
  if (!stellarConfig.usdcIssuer) {
    throw new Error("Missing VITE_USDC_ISSUER in frontend/.env");
  }

  return new Asset("USDC", stellarConfig.usdcIssuer);
};
