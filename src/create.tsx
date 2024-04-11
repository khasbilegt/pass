import { Action, ActionPanel, Form, Icon, Toast, popToRoot, showToast } from "@raycast/api";
import slugify from "@sindresorhus/slugify";
import fs from "node:fs";
import path from "node:path";
import { useState } from "react";
import { StorePath, encryptData } from "./utils";

type ItemType = "password" | "card" | "identity" | "note" | "document";

export default function Command() {
  const [type, setType] = useState<ItemType>("password");

  return (
    <Form
      enableDrafts
      actions={
        <ActionPanel>
          <Action.SubmitForm
            onSubmit={async ({
              type,
              favored,
              archived,
              filename,
              ...values
            }: {
              type: ItemType;
              favored: boolean;
              archived: boolean;
              filename: string;
            }) => {
              const toast = await showToast({ style: Toast.Style.Animated, title: "Creating Item" });

              try {
                const now = Date.now();
                const data = { type, item: values, favored, archived, created: now, modified: now };
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
            }}
          />
        </ActionPanel>
      }
    >
      <Form.Dropdown id="type" title="Item Type" value={type} onChange={(value) => setType(value as ItemType)}>
        <Form.Dropdown.Item value="password" title="Login" icon={Icon.Fingerprint} />
        <Form.Dropdown.Item value="card" title="Credit Card" icon={Icon.CreditCard} />
        <Form.Dropdown.Item value="identity" title="Identity" icon={Icon.Person} />
        <Form.Dropdown.Item value="note" title="Secret Note" icon={Icon.Paragraph} />
        <Form.Dropdown.Item value="document" title="Document" icon={Icon.Document} />
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

function FormFields({ type }: { type: ItemType }) {
  switch (type) {
    case "identity":
      return <IdentityTypeFields />;
    case "note":
      return <NoteTypeFields />;
    case "card":
      return <CardTypeFields />;
    case "document":
      return <DocumentTypeFields />;
    case "password":
    default:
      return <PasswordTypeFields />;
  }
}

function PasswordTypeFields() {
  return (
    <>
      <Form.TextField id="website" title="Website" placeholder="example.com" />
      <Form.TextField id="username" title="Email/Username" placeholder="user@example.com" />
      <Form.PasswordField id="password" title="Password" placeholder="· · · · · · · · · · · ·" />
      <Form.TextField id="otp" title="OTP Secret" placeholder="otpauth://totp/OTP?secret=..." />
    </>
  );
}

function NoteTypeFields() {
  return (
    <>
      <Form.TextArea id="text" title="Note" />
    </>
  );
}

function CardTypeFields() {
  return (
    <>
      <Form.TextField id="name" title="Name" />
      <Form.TextField id="number" title="Card Number" />
      <Form.DatePicker id="expiration" title="Expiry Date" type={Form.DatePicker.Type.Date} />
      <Form.TextField id="cvv" title="CVV" />
    </>
  );
}

function DocumentTypeFields() {
  return (
    <>
      <Form.FilePicker id="file" title="Document" />
    </>
  );
}

function IdentityTypeFields() {
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
