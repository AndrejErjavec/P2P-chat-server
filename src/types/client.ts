export type Client = {
  username: string,
  publicKey?: string,
  publicAddress?: string | null,
  publicPort?: number,
  privateAddress: string,
  privatePort: number,
  socketId: string | null;
}