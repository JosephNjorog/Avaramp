import axios from "axios";
export class GlacierService {
  private baseUrl = "https://glacier-api.avax.network";
  private headers = {
    "x-glacier-api-key": process.env.GLACIER_API_KEY!,
  };
  async getERC20Transfers(address: string, contractAddress: string) {
    const res = await axios.get(
      `${this.baseUrl}/v1/chains/43114/addresses/${address}/transactions:listErc20`,
      {
        headers: this.headers,
        params:  { contractAddress, pageSize: 10 },
      }
    );
    return res.data.transactions ?? [];
  }
  async getTransaction(txHash: string) {
    const res = await axios.get(
      `${this.baseUrl}/v1/chains/43114/transactions/${txHash}`,
      { headers: this.headers }
    );
    return res.data;
  }
}
