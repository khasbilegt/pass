import { ItemListContent } from "../types";

import { Action, Clipboard, Icon, Keyboard, getFrontmostApplication } from "@raycast/api";
import { usePromise } from "@raycast/utils";

export function ActionPaste({
  title,
  content,
  shortcut,
}: {
  title: string;
  content: string | number | Clipboard.Content;
  shortcut: Keyboard.Shortcut;
}) {
  const { data } = usePromise(async () => await getFrontmostApplication());

  return (
    data && (
      <Action.Paste
        icon={data ? { fileIcon: data?.path } : Icon.AppWindow}
        title={data ? `Paste ${title} in ${data?.name}` : `Paste ${title} in Active App`}
        content={content}
        shortcut={shortcut}
      />
    )
  );
}

export function ListItemCopyActions(props: ItemListContent) {
  const { item } = props;

  switch (item.category) {
    case "login":
      return (
        <>
          <Action.CopyToClipboard title="Copy Username" content={item.username} />
          <Action.CopyToClipboard title="Copy Password" content={item.password} concealed />
          {item.otp ?? (
            <Action.CopyToClipboard
              title="Copy OTP"
              content={item.password}
              shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
            />
          )}
        </>
      );
    case "password":
      return <Action.CopyToClipboard title="Copy Password" content={item.password} />;
    case "note":
      return <Action.CopyToClipboard title="Copy Note" content={item.note} />;
    case "card":
      return (
        <>
          <Action.CopyToClipboard title="Copy Card Number" content={item.number} />
          <Action.CopyToClipboard title="Copy CVV" content={item.cvv} concealed />
          <Action.CopyToClipboard
            title="Copy Expiry Date"
            content={item.expiration}
            shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
          />
        </>
      );
    case "identity":
      return (
        <>
          <Action.CopyToClipboard title="Copy Fullname" content={`${item.firstname} ${item.lastname}`} />
          <Action.CopyToClipboard title="Copy Phone Number" content={item.tel} concealed />
          <Action.CopyToClipboard
            title="Copy Address"
            content={item.address}
            shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
          />
        </>
      );
    case "document":
    default:
      return null;
  }
}

export function ListItemPasteActions(props: ItemListContent) {
  const { item } = props;

  switch (item.category) {
    case "login":
      return (
        <>
          <ActionPaste title="Username" content={item.username} shortcut={{ modifiers: ["shift"], key: "enter" }} />
          <ActionPaste
            title="Password"
            content={item.password}
            shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
          />
          {item.otp ?? (
            <ActionPaste title={"OTP"} content={item.otp} shortcut={{ modifiers: ["opt", "shift"], key: "enter" }} />
          )}
        </>
      );
    case "password":
      return <ActionPaste title="Password" content={item.password} shortcut={{ modifiers: ["shift"], key: "enter" }} />;
    case "note":
      return <ActionPaste title="Note" content={item.note} shortcut={{ modifiers: ["shift"], key: "enter" }} />;
    case "card":
      return (
        <>
          <ActionPaste title="Card Number" content={item.number} shortcut={{ modifiers: ["shift"], key: "enter" }} />
          <ActionPaste title="CVV" content={item.cvv} shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }} />
          <ActionPaste
            title="Expiry Date"
            content={item.expiration}
            shortcut={{ modifiers: ["opt", "shift"], key: "enter" }}
          />
        </>
      );
    case "identity":
      return (
        <>
          <ActionPaste
            title="Fullname"
            content={`${item.firstname} ${item.lastname}`}
            shortcut={{ modifiers: ["shift"], key: "enter" }}
          />
          <ActionPaste
            title="Phone Number"
            content={item.tel}
            shortcut={{ modifiers: ["cmd", "shift"], key: "enter" }}
          />
          <ActionPaste
            title="Address"
            content={item.address}
            shortcut={{ modifiers: ["opt", "shift"], key: "enter" }}
          />
        </>
      );
    case "document":
    default:
      return null;
  }
}

export function ListItemManagementActions(props: ItemListContent) {
  const { item } = props;

  switch (item.category) {
    case "login":
      return <Action.OpenInBrowser url={item.website} shortcut={{ modifiers: ["cmd", "shift"], key: "o" }} />;
    case "password":
    case "note":
    case "card":
    case "identity":
    case "document":
    default:
      return null;
  }
}
