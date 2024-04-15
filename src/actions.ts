import { ItemContent, ItemCreateFormValues, ItemFileContent, ItemListContent, ItemUpdateFormValues } from "@/types";
import { StorePath, encryptData, toastWrapper } from "@/utils";
import slugify from "@sindresorhus/slugify";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

export async function itemCreate(
  { filename, favored, archived, ...values }: ItemCreateFormValues,
  callback?: () => void,
) {
  const create = async () => {
    const now = Date.now();
    const data: ItemFileContent = {
      id: randomUUID(),
      filename,
      item: values,
      favored,
      archived,
      created: now,
      modified: now,
    };
    const payload = JSON.stringify(data);
    const result = await encryptData(payload);
    const filePath = path.join(StorePath, values.category, `${slugify(filename)}.gpg`);
    const dirPath = path.dirname(filePath);

    await fs.promises.mkdir(dirPath, { recursive: true });
    await fs.promises.writeFile(filePath, result as Uint8Array);
    callback && (await callback());
  };

  await toastWrapper(
    {
      init: "Creating Item",
      success: "Created Item",
      error: "Failed to create item",
    },
    create,
  );
}

export async function itemUpdate(
  defaultValues: ItemListContent,
  updatedValues: ItemUpdateFormValues,
  callback?: () => void,
) {
  const update = async () => {
    const { filename, favored, archived, ...values } = updatedValues;
    const now = Date.now();
    const data: ItemFileContent = {
      id: randomUUID(),
      filename: filename ?? defaultValues.filename,
      item: { ...defaultValues.item, ...values } as ItemContent,
      favored: favored ?? defaultValues.favored,
      archived: archived ?? defaultValues.favored,
      created: defaultValues.created,
      modified: now,
    };
    const payload = JSON.stringify(data);
    const result = await encryptData(payload);

    await fs.promises.writeFile(defaultValues.path, result as Uint8Array);
    callback && (await callback());
  };

  await toastWrapper(
    {
      init: "Updating Item",
      success: "Updated Item",
      error: "Failed to update item",
    },
    update,
  );
}
