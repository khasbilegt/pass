import { getPreferenceValues, LocalStorage } from "@raycast/api";
import fs from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import * as openpgp from "openpgp";
import { Preferences } from "./types";

type LocalStorageKeyType = (typeof LocalStorageKey)[keyof typeof LocalStorageKey];

export const StorePath = path.join(homedir(), ".password-store");
export const LocalStorageKey = { PUBLIC: "@public-key", PRIVATE: "@private-key" } as const;

export async function getArmoredKey(key: LocalStorageKeyType) {
  console.log(`getArmoredKey(key: '${key}')`);
  const storageArmoredKey = await LocalStorage.getItem<string>(key);

  if (storageArmoredKey === undefined) {
    console.log("> Key is not in the local storage!");
    const { privateKeyPath, publicKeyPath } = getPreferenceValues<Preferences>();
    const keyPath = key === LocalStorageKey.PRIVATE ? privateKeyPath : publicKeyPath;
    const armoredKey = await fs.promises.readFile(keyPath, "utf-8");
    await LocalStorage.setItem(key, armoredKey);
    console.log("> Key is read from the file, saved in the storage and returned!");
    return armoredKey;
  }

  console.log("> Key is read from the storage!");
  return storageArmoredKey;
}

export async function getPublicKey() {
  const publicArmoredKey = await getArmoredKey(LocalStorageKey.PUBLIC);
  const publicKey = await openpgp.readKey({ armoredKey: publicArmoredKey });
  return publicKey;
}

export async function getPrivateKey() {
  const { passphrase } = getPreferenceValues<Preferences>();
  const privateArmoredKey = await getArmoredKey(LocalStorageKey.PRIVATE);
  const encryptedPrivateKey = await openpgp.readPrivateKey({ armoredKey: privateArmoredKey });
  const privateKey = await openpgp.decryptKey({ privateKey: encryptedPrivateKey, passphrase });
  return privateKey;
}

export async function decryptFile(encryptedFilePath: string) {
  const binaryMessage = await fs.promises.readFile(encryptedFilePath);
  const data = await decryptData(binaryMessage);
  return data;
}

export async function decryptData(payload: Buffer) {
  const [publicKey, privateKey] = await Promise.all([await getPublicKey(), await getPrivateKey()]);

  const message = await openpgp.readMessage({ binaryMessage: payload });
  const { data } = await openpgp.decrypt({ message, verificationKeys: publicKey, decryptionKeys: privateKey });
  return data;
}

export async function encryptData(payload: string, format: "armored" | "binary" = "armored") {
  const [publicKey, privateKey] = await Promise.all([await getPublicKey(), await getPrivateKey()]);

  const buffer = Buffer.from(payload, "utf8");
  const message = await openpgp.createMessage({ binary: new Uint8Array(buffer) });
  const encrypted = await openpgp.encrypt({ message, encryptionKeys: publicKey, signingKeys: privateKey, format });
  return encrypted;
}

export function findFiles(folderPath: string) {
  const results: string[] = [];
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.lstatSync(filePath);

    if (stats.isDirectory()) {
      results.push(...findFiles(filePath));
    } else if (path.extname(filePath) === ".gpg") {
      results.push(filePath);
    }
  }

  return results;
}
