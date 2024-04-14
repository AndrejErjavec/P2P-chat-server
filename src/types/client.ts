export type Client = {
  username: string,
  publicKey?: string,
  publicAddress?: string,
  publicPort?: number,
  socketId: string | null;
}