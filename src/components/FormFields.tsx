import { ExtractCategory, ItemCategoryType, ItemCreateFormValues } from "@/types";
import { Form } from "@raycast/api";
import { useState } from "react";

function LoginCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"login"> }) {
  const [password, setPassword] = useState(defaultValues?.password);

  return (
    <>
      <Form.TextField
        id="website"
        title="Website"
        placeholder="https://www.bafs.org.uk/"
        defaultValue={defaultValues?.website}
      />
      <Form.TextField
        id="username"
        title="Email/Username"
        placeholder="SherlockH"
        defaultValue={defaultValues?.username}
      />
      <Form.PasswordField
        id="password"
        title="Password"
        placeholder="I 4M SH3R L0CK3D"
        value={password}
        onChange={setPassword}
        info={password ? `Raw value: ${password}` : undefined}
      />
      <Form.TextField
        id="otp"
        title="OTP Secret"
        placeholder="otpauth://totp/OTP?secret=..."
        defaultValue={defaultValues?.otp}
      />
    </>
  );
}

function PasswordCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"password"> }) {
  const [password, setPassword] = useState(defaultValues?.password);

  return (
    <Form.PasswordField
      id="password"
      title="Password"
      placeholder="I 4M SH3R L0CK3D"
      value={password}
      onChange={setPassword}
      info={password ? `Raw value: ${password}` : undefined}
    />
  );
}

function CardCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"card"> }) {
  const [cvv, setCVV] = useState(defaultValues?.cvv);

  return (
    <>
      <Form.TextField id="name" title="Name" placeholder="Sherlock Holmes" defaultValue={defaultValues?.name} />
      <Form.TextField
        id="number"
        title="Card Number"
        placeholder="4111 1111 1111 1111"
        defaultValue={defaultValues?.number}
      />
      <Form.DatePicker
        id="expiration"
        title="Expiry Date"
        type={Form.DatePicker.Type.Date}
        defaultValue={defaultValues?.expiration ? new Date(defaultValues.expiration) : undefined}
      />
      <Form.PasswordField
        id="cvv"
        title="CVV"
        placeholder="221"
        value={cvv}
        onChange={setCVV}
        info={cvv ? `Raw value: ${cvv}` : undefined}
      />
    </>
  );
}

function DocumentCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"document"> }) {
  return (
    <Form.FilePicker id="file" title="Document" defaultValue={defaultValues?.file ? [defaultValues.file] : undefined} />
  );
}

function IdentityCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"identity"> }) {
  return (
    <>
      <Form.TextField id="firstname" title="Firstname" placeholder="Sherlock" defaultValue={defaultValues?.firstname} />
      <Form.TextField id="lastname" title="Lastname" placeholder="Holmes" defaultValue={defaultValues?.lastname} />
      <Form.DatePicker
        id="birthdate"
        title="Birthdate"
        type={Form.DatePicker.Type.Date}
        defaultValue={defaultValues?.birthdate ? new Date(defaultValues.birthdate) : undefined}
      />
      <Form.TextField id="tel" title="Phone number" defaultValue={defaultValues?.tel} />
      <Form.TextArea
        id="address"
        title="Address"
        placeholder="221B Baker Street, London, UK"
        defaultValue={defaultValues?.address}
      />
    </>
  );
}

function NoteCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"note"> }) {
  return (
    <Form.TextArea
      id="note"
      title="Secure Note"
      placeholder="Look not to the obvious, but seek the shadows that hide the truth. The key lies in the spaces between the lines..."
      defaultValue={defaultValues?.note}
      enableMarkdown
    />
  );
}

export function FormFields({ type, draftValues }: { type: ItemCategoryType; draftValues?: ItemCreateFormValues }) {
  switch (type) {
    case "identity":
      return <IdentityCategoryFields defaultValues={draftValues as ExtractCategory<"identity">} />;
    case "note":
      return <NoteCategoryFields defaultValues={draftValues as ExtractCategory<"note">} />;
    case "card":
      return <CardCategoryFields defaultValues={draftValues as ExtractCategory<"card">} />;
    case "document":
      return <DocumentCategoryFields defaultValues={draftValues as ExtractCategory<"document">} />;
    case "password":
      return <PasswordCategoryFields defaultValues={draftValues as ExtractCategory<"password">} />;
    case "login":
    default:
      return <LoginCategoryFields defaultValues={draftValues as ExtractCategory<"login">} />;
  }
}
