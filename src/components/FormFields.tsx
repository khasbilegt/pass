import { ItemCategoryType } from "@/types";
import { Form } from "@raycast/api";

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

function PasswordCategoryFields() {
  return (
    <>
      <Form.PasswordField id="password" title="Password" />
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

export function FormFields({ type }: { type: ItemCategoryType }) {
  switch (type) {
    case "identity":
      return <IdentityCategoryFields />;
    case "note":
      return <NoteCategoryFields />;
    case "card":
      return <CardCategoryFields />;
    case "document":
      return <DocumentCategoryFields />;
    case "password":
      return <PasswordCategoryFields />;
    case "login":
    default:
      return <LoginCategoryFields />;
  }
}
