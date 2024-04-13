import { FormFields } from "@/components";
import { ItemCategoryType, ItemFileContent, ItemFormValues } from "@/types";
import { CATEGORIES, encryptData } from "@/utils";
import { Action, ActionPanel, Form, Toast, showToast, useNavigation } from "@raycast/api";
import { randomUUID } from "node:crypto";
import fs from "node:fs";
import { useState } from "react";

export default function ItemForm(props: {
  defaultValues: ItemFormValues;
  path: string;
  modified: number;
  created: number;
  revalidate: () => void;
}) {
  const { defaultValues, revalidate } = props;
  const { pop } = useNavigation();
  const [type, _] = useState<ItemCategoryType>(defaultValues.category ?? "login");

  async function onSubmit({ favored, archived, filename, ...values }: ItemFormValues) {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Creating Item" });

    try {
      const now = Date.now();
      const data: ItemFileContent = {
        id: randomUUID(),
        filename: filename ?? defaultValues.filename,
        item: { ...values, category: defaultValues.category },
        favored: favored ?? defaultValues.favored,
        archived: archived ?? defaultValues.favored,
        created: props.created,
        modified: now,
      };
      const payload = JSON.stringify(data);
      const result = await encryptData(payload, "binary");

      await fs.promises.writeFile(props.path, result as Uint8Array);
      toast.style = Toast.Style.Success;
      toast.title = "Updated Item";
      revalidate();
      pop();
    } catch (error) {
      toast.style = Toast.Style.Failure;
      toast.title = "Failed to update item";
      if (error instanceof Error) {
        toast.message = error.message;
      }
    }
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <Action.SubmitForm title="Update Form" onSubmit={onSubmit} />
        </ActionPanel>
      }
    >
      <Form.Description title="Category" text={CATEGORIES[type].title} />
      <Form.Separator />
      <FormFields type={type} draftValues={defaultValues} />
      <Form.Separator />
      <Form.Checkbox id="favored" label="Add to Favorite?" defaultValue={defaultValues.favored} />
      <Form.Checkbox id="archived" label="Add to Archived?" defaultValue={defaultValues.archived} />
    </Form>
  );
}
