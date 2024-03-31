import * as fs from 'fs';
import { Client } from "./types/client";

const filename = "data/clients.json";

export const createClientStore = () => {
  if (!fs.existsSync(filename)) {
    try {
      fs.writeFileSync(filename, '[]');
    } catch (err) {
      console.log(err);
    }
  }
}

export const addClient = (client: Client): Array<Client> => {
  try {
    const clients = fs.readFileSync(filename, 'utf8');
    const clients_arr = JSON.parse(clients);
    const existing_clinet = clients_arr.findIndex((el: Client) => el.username === client.username);
    if (existing_clinet != -1) {
      clients_arr[existing_clinet] = client;
    } else {
      clients_arr.push(client);
    }
    fs.writeFileSync(filename, JSON.stringify(clients_arr));
    return clients_arr;
  } catch (err) {
    console.log(err);
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
