import { FormFields } from "@/components";
import { ItemCategoryType, ItemContent, ItemFileContent } from "@/types";
import { CATEGORIES, StorePath, encryptData, getCategoryIcon } from "@/utils";
import { Action, ActionPanel, Form, Toast, popToRoot, showToast } from "@raycast/api";
import slugify from "@sindresorhus/slugify";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { useState } from "react";

export default function Command() {
  const [type, setType] = useState<ItemCategoryType>("login");

  async function onSubmit({
    favored,
    archived,
    filename,
    ...values
  }: {
    favored: boolean;
    archived: boolean;
    filename: string;
  } & ItemContent) {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Creating Item" });

    try {
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
      const result = await encryptData(payload, "binary");
      const filePath = path.join(StorePath, type, `${slugify(filename)}.gpg`);
      const dirPath = path.dirname(filePath);

      await fs.promises.mkdir(dirPath, { recursive: true });
      await fs.promises.writeFile(filePath, result as Uint8Array);
      toast.style = Toast.Style.Success;
      toast.title = "Created Item";
      popToRoot();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to upload image";
      if (error instanceof Error) {
        toast.message = error.message;
      }
    }
  }

  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.Dropdown
        id="category"
        title="Category"
        value={type}
        onChange={(value) => setType(value as ItemCategoryType)}
      >
        {Object.values(CATEGORIES).map((item) => (
          <Form.Dropdown.Item
            key={item.category}
            value={item.category}
            title={item.title}
            icon={getCategoryIcon(item.category)}
          />
        ))}
      </Form.Dropdown>
      <Form.TextField id="filename" title="Item Name" placeholder="filename" />
      <Form.Separator />
      <FormFields type={type} />
      <Form.Separator />
      <Form.Checkbox id="favored" label="Mark as favorite?" defaultValue={false} />
      <Form.Checkbox id="archived" label="Mark as archived?" defaultValue={false} />
    </Form>
  );
}
