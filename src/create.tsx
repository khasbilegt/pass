import { FormFields } from "@/components";
import { ItemCategoryType, ItemFileContent, ItemFormValues } from "@/types";
import { CATEGORIES, StorePath, encryptData, getCategoryIcon } from "@/utils";
import { Action, ActionPanel, Form, LaunchProps, Toast, popToRoot, showToast } from "@raycast/api";
import slugify from "@sindresorhus/slugify";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { useState } from "react";

export default function Command(props: LaunchProps<{ draftValues: ItemFormValues }>) {
  const { draftValues } = props;
  const [type, setType] = useState<ItemCategoryType>(draftValues?.category ?? "login");

  async function onSubmit({ favored, archived, filename, ...values }: ItemFormValues) {
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
      toast.title = "Failed to create item";
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
      <Form.TextField id="filename" title="Item Name" placeholder="filename" defaultValue={draftValues?.filename} />
      <Form.Separator />
      <FormFields type={type} draftValues={draftValues} />
      <Form.Separator />
      <Form.Checkbox id="favored" label="Add to Favorite?" defaultValue={!!draftValues?.favored} />
      <Form.Checkbox id="archived" label="Add to Archived?" defaultValue={!!draftValues?.archived} />
    </Form>
  );
}
