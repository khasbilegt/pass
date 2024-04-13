export const LocalStorageKey = { PUBLIC: "@public-key", PRIVATE: "@private-key" } as const;
export type LocalStorageKeyType = (typeof LocalStorageKey)[keyof typeof LocalStorageKey];

export type Preferences = {
  passphrase: string;
  publicKeyPath: string;
  privateKeyPath: string;
};

export type ItemContent =
  | { category: "password"; password: string }
  | { category: "login"; website: string; username: string; password: string; otp: string }
  | { category: "card"; name: string; number: string; expiration: string; cvv: string }
  | { category: "identity"; firstname: string; lastname: string; birthdate: string; tel: string; address: string }
  | { category: "document"; file: string }
  | { category: "note"; note: string };

export type ItemCategoryType = ItemContent["category"];

export type ItemFileContent = {
  id: string;
  filename: string;
  favored: boolean;
  archived: boolean;
  item: ItemContent;
  created: number;
  modified: number;
};

export type ItemListContent = { path: string } & ItemFileContent;
