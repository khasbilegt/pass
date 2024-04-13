import { Action, ActionPanel, Form, Icon, Toast, popToRoot, showToast } from "@raycast/api";
import slugify from "@sindresorhus/slugify";
import fs from "node:fs";
import path from "node:path";
import { useState } from "react";
import { ItemCategoryType, ItemFileContent } from "./types";
import { StorePath, encryptData } from "./utils";

function LoginCategoryFields() {
  return (
    <>
      <Form.TextField id="website" title="Website" placeholder="example.com" />
      <Form.TextField id="username" title="Email/Username" placeholder="user@example.com" />
      <Form.PasswordField id="password" title="Password" placeholder="· · · · · · · · · · · ·" />
      <Form.TextField id="otp" title="OTP Secret" placeholder="otpauth://totp/OTP?secret=..." />
    </>
  );
}

function NoteCategoryFields() {
  return (
    <>
      <Form.TextArea id="note" title="Note" />
    </>
  );
}

function CardCategoryFields() {
  return (
    <>
      <Form.TextField id="name" title="Name" />
      <Form.TextField id="number" title="Card Number" />
      <Form.DatePicker id="expiration" title="Expiry Date" type={Form.DatePicker.Type.Date} />
      <Form.TextField id="cvv" title="CVV" />
    </>
  );
}

function DocumentCategoryFields() {
  return (
    <>
      <Form.FilePicker id="file" title="Document" />
    </>
  );
}

function IdentityCategoryFields() {
  return (
    <>
      <Form.TextField id="firstname" title="Firstname" />
      <Form.TextField id="lastname" title="Lastname" />
      <Form.DatePicker id="birthdate" title="Birthdate" type={Form.DatePicker.Type.Date} />
      <Form.TextField id="tel" title="Phone number" />
      <Form.TextArea id="address" title="Address" />
    </>
  );
}

function FormFields({ type }: { type: ItemCategoryType }) {
  switch (type) {
    case "identity":
      return <IdentityCategoryFields />;
    case "note":
      return <NoteCategoryFields />;
    case "card":
      return <CardCategoryFields />;
    case "document":
      return <DocumentCategoryFields />;
    case "login":
    default:
      return <LoginCategoryFields />;
  }
}

export default function Command() {
  const [type, setType] = useState<ItemCategoryType>("login");

  async function onSubmit({
    favored,
    archived,
    filename,
    category,
    ...values
  }: {
    category: ItemCategoryType;
    favored: boolean;
    archived: boolean;
    filename: string;
  }) {
    const toast = await showToast({ style: Toast.Style.Animated, title: "Creating Item" });

    try {
      const now = Date.now();
      const data = {
        item: { ...values, category },
        favored,
        archived,
        created: now,
        modified: now,
      } as ItemFileContent;
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
        <Form.Dropdown.Item value={"login" as ItemCategoryType} title="Login" icon={Icon.Fingerprint} />
        <Form.Dropdown.Item value={"card" as ItemCategoryType} title="Credit Card" icon={Icon.CreditCard} />
        <Form.Dropdown.Item value={"identity" as ItemCategoryType} title="Identity" icon={Icon.Person} />
        <Form.Dropdown.Item value={"note" as ItemCategoryType} title="Secret Note" icon={Icon.Paragraph} />
        <Form.Dropdown.Item value={"document" as ItemCategoryType} title="Document" icon={Icon.Document} />
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
