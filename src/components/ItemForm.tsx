import { itemUpdate } from "@/actions";
import { FormFields } from "@/components";
import { ItemCategoryType, ItemListContent, ItemUpdateFormValues } from "@/types";
import { CATEGORIES } from "@/utils";
import { Action, ActionPanel, Form, useNavigation } from "@raycast/api";
import { useState } from "react";

export function ItemForm(props: ItemListContent & { revalidate: () => void }) {
  const { revalidate, ...defaultValues } = props;
  const { pop } = useNavigation();
  const [type] = useState<ItemCategoryType>(defaultValues.item.category ?? "login");

  async function onSubmit(props: ItemUpdateFormValues) {
    await itemUpdate(defaultValues, props, () => {
      revalidate();
      pop();
    });
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
      <Form.Description title="Filename" text={defaultValues.filename} />
      <Form.Separator />
      <FormFields
        type={type}
        draftValues={{
          filename: defaultValues.filename,
          favored: defaultValues.favored,
          archived: defaultValues.archived,
          ...defaultValues.item,
        }}
      />
      <Form.Separator />
      <Form.Checkbox id="favored" label="Add to Favorite?" defaultValue={defaultValues.favored} />
      <Form.Checkbox id="archived" label="Add to Archived?" defaultValue={defaultValues.archived} />
    </Form>
  );
}
