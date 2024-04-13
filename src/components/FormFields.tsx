import { ExtractCategory, ItemCategoryType, ItemFormValues } from "@/types";
import { Form } from "@raycast/api";

function LoginCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"login"> }) {
  return (
    <>
      <Form.TextField id="website" title="Website" placeholder="example.com" defaultValue={defaultValues?.website} />
      <Form.TextField
        id="username"
        title="Email/Username"
        placeholder="user@example.com"
        defaultValue={defaultValues?.username}
      />
      <Form.PasswordField id="password" title="Password" placeholder="· · · · · · · · · · · ·" />
      <Form.TextField
        id="otp"
        title="OTP Secret"
        placeholder="otpauth://totp/OTP?secret=..."
        defaultValue={defaultValues?.otp}
      />
    </>
  );
}

function PasswordCategoryFields() {
  return (
    <>
      <Form.PasswordField id="password" title="Password" />
    </>
  );
}

function NoteCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"note"> }) {
  return (
    <>
      <Form.TextArea id="note" title="Note" defaultValue={defaultValues?.note} />
    </>
  );
}

function CardCategoryFields({ defaultValues }: { defaultValues?: ExtractCategory<"card"> }) {
  return (
    <>
      <Form.TextField id="name" title="Name" defaultValue={defaultValues?.name} />
      <Form.TextField id="number" title="Card Number" defaultValue={defaultValues?.number} />
      <Form.DatePicker
        id="expiration"
        title="Expiry Date"
        type={Form.DatePicker.Type.Date}
        defaultValue={defaultValues?.expiration ? new Date(defaultValues.expiration) : undefined}
      />
      <Form.TextField id="cvv" title="CVV" defaultValue={defaultValues?.cvv} />
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
      <Form.TextField id="firstname" title="Firstname" defaultValue={defaultValues?.firstname} />
      <Form.TextField id="lastname" title="Lastname" defaultValue={defaultValues?.lastname} />
      <Form.DatePicker
        id="birthdate"
        title="Birthdate"
        type={Form.DatePicker.Type.Date}
        defaultValue={defaultValues?.birthdate ? new Date(defaultValues.birthdate) : undefined}
      />
      <Form.TextField id="tel" title="Phone number" defaultValue={defaultValues?.tel} />
      <Form.TextArea id="address" title="Address" defaultValue={defaultValues?.address} />
    </>
  );
}

export function FormFields({ type, draftValues }: { type: ItemCategoryType; draftValues?: ItemFormValues }) {
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
      return <PasswordCategoryFields />;
    case "login":
    default:
      return <LoginCategoryFields defaultValues={draftValues as ExtractCategory<"login">} />;
  }
}
