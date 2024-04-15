import { FormFields } from "@/components";
import { ItemCategoryType, ItemCreateFormValues } from "@/types";
import { CATEGORIES, getCategoryIcon } from "@/utils";
import { Action, ActionPanel, Form, LaunchProps } from "@raycast/api";
import { useState } from "react";
import { itemCreate } from "./actions";

export default function Command(props: LaunchProps<{ draftValues: ItemCreateFormValues }>) {
  const { draftValues } = props;
  const [type, setType] = useState<ItemCategoryType>(draftValues?.category ?? "login");

  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm onSubmit={itemCreate} />
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
