import { Clipboard, getPreferenceValues, Icon, LocalStorage, showToast, Toast } from "@raycast/api";
import { Glob } from "glob";
import { createHash } from "node:crypto";
import fs from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import * as openpgp from "openpgp";
import {
  ItemCategoryType,
  ItemFileContent,
  ItemListContent,
  LocalStorageKey,
  LocalStorageKeyType,
  Preferences,
} from "./types";

export const StorePath = path.join(homedir(), ".password-store");
export const storePathGlob = new Glob(`${StorePath}/**/*.gpg`, {});
export const DEFAULT_CATEGORY = "null";
export const CATEGORIES: Record<ItemCategoryType, { category: ItemCategoryType; title: string }> = {
  login: { category: "login", title: "Login" },
  password: { category: "password", title: "Password" },
  card: { category: "card", title: "Credit Card" },
  document: { category: "document", title: "Document" },
  note: { category: "note", title: "Secure Note" },
  identity: { category: "identity", title: "Identity" },
} as const;

export async function getArmoredKey(key: LocalStorageKeyType) {
  const storageArmoredKey = await LocalStorage.getItem<string>(key);

  if (storageArmoredKey === undefined) {
    const { privateKeyPath, publicKeyPath } = getPreferenceValues<Preferences>();
    const keyPath = key === LocalStorageKey.PRIVATE ? privateKeyPath : publicKeyPath;
    const armoredKey = await fs.promises.readFile(keyPath, "utf-8");
    await LocalStorage.setItem(key, armoredKey);
    return armoredKey;
  }

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

export async function encryptData(payload: string) {
  const [publicKey, privateKey] = await Promise.all([await getPublicKey(), await getPrivateKey()]);

  const buffer = Buffer.from(payload, "utf8");
  const message = await openpgp.createMessage({ binary: new Uint8Array(buffer) });
  const encrypted = await openpgp.encrypt({
    message,
    encryptionKeys: publicKey,
    signingKeys: privateKey,
    format: "binary",
  });
  return encrypted;
}

export async function findItems() {
  const results: ItemListContent[] = [];

  for await (const file of storePathGlob) {
    try {
      const data = await decryptFile(file);
      if (typeof data === "string") {
        const payload: ItemFileContent = JSON.parse(data);
        results.push({ ...payload, path: file });
      }
    } catch (error) {
      console.error("Invalid schema!", file);
    }
  }

  return results.sort((a, b) => b.created - a.created);
}

export function hash(str: string) {
  return createHash("sha256").update(str).digest("hex");
}

export function getCategoryIcon(category: ItemCategoryType) {
  switch (category) {
    case "card":
      return Icon.CreditCard;
    case "document":
      return Icon.Document;
    case "identity":
      return Icon.Person;
    case "login":
      return Icon.Fingerprint;
    case "password":
      return Icon.Key;
    case "note":
      return Icon.Paragraph;
    default:
      return Icon.Key;
  }
}

export async function toastWrapper(
  title: { init: string; success: string; error: string },
  primary: () => Promise<void>,
) {
  const toast = await showToast({ style: Toast.Style.Animated, title: title.init });

  try {
    await primary();
    toast.style = Toast.Style.Success;
    toast.title = title.success;
  } catch (error) {
    toast.style = Toast.Style.Failure;
    toast.title = title.error;
    if (error instanceof Error) {
      toast.message = error.message;
      toast.primaryAction = {
        title: "Copy logs",
        onAction: async (toast) => {
          await Clipboard.copy(error.message);
          toast.hide();
        },
      };
    }
  }
}
