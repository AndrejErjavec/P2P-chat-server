import { Client } from "./types/client";
import fs from 'fs';

const filename = "clients.json";

export const createClientStore = () => {
  fs.writeFileSync(filename, '[]');
}

export const addClient = (client: Client): Client => {
  try {
    const clients = fs.readFileSync(filename, 'utf8');
    const clients_obj = JSON.parse(clients);
    clients_obj.push(client);
    return JSON.parse(clients_obj);
  } catch (err) {
    throw new Error(`Unable to write client to a file: ${err}`);
  }
}

export const getClients = (): Array<Client> => {
  try {
    const clients = fs.readFileSync(filename, 'utf8');
    return JSON.parse(clients);
  } catch (err) {
    throw new Error(`Unable to read file: ${err}`);
  }
}
