import { CategoryDropdown, ItemDetail, ItemForm } from "@/components";
import { CATEGORIES, findItems, getCategoryIcon } from "@/utils";
import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useCachedPromise, useCachedState } from "@raycast/utils";
import { itemUpdate } from "./actions";
import { ItemCategoryDropdownTypes, ItemListContent } from "./types";

function ListItemActions(props: ItemListContent) {
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

function getListItemSubtitle(props: ItemListContent) {
  const { item } = props;

  switch (item.category) {
    case "login":
      return item.username;
    case "card":
      return item.number.length === 16
        ? `${item.number.slice(0, 4)} * * * * ${item.number.slice(-4)}`
        : item.number.length === 15
          ? `${item.number.slice(0, 4)} * * * * ${item.number.slice(-5)}`
          : item.number;
    case "identity":
      return `${item.firstname} ${item.lastname}`;
    default:
      return undefined;
  }
}

export default function ListItems() {
  const [category, setCategory] = useCachedState<ItemCategoryDropdownTypes>("selected_category", "favored");
  const { data: items = [], isLoading, revalidate } = useCachedPromise(findItems);
  const categoryItems = items?.filter(({ item, archived, favored }) => {
    if (category === "null") return true;
    else if (category === "favored") return favored;
    else if (category === "archived") return archived;
    else return category === item.category;
  });

  function onCategoryChange(value: string) {
    category !== value && setCategory(value as ItemCategoryDropdownTypes);
  }

  return (
    <List
      filtering
      searchBarAccessory={<CategoryDropdown onCategoryChange={onCategoryChange} />}
      searchBarPlaceholder="Search your item"
      isLoading={isLoading}
    >
      {categoryItems.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No items found"
          description="Any items you have added in your password store will be listed here."
        />
      ) : (
        categoryItems.map((props) => {
          const { id, item, path, filename, favored, archived, modified, created } = props;
          const modifiedDate = new Date(modified);

          return (
            <List.Item
              key={id}
              title={filename}
              subtitle={getListItemSubtitle(props)}
              icon={{
                value: { source: getCategoryIcon(item.category), tintColor: Color.Blue },
                tooltip: CATEGORIES[item.category].title,
              }}
              accessories={[
                favored ? { icon: { source: Icon.Stars, tintColor: Color.Yellow }, tooltip: "Favorite item" } : {},
                archived ? { icon: { source: Icon.Tray, tintColor: Color.Yellow }, tooltip: "Archived item" } : {},
                modified ? { date: modifiedDate, tooltip: `Last modified at ${modifiedDate}` } : {},
              ]}
              actions={
                <ActionPanel title="Item actions">
                  <ListItemActions {...props} />
                  <Action.Push
                    title="Open Item"
                    icon={Icon.ArrowRightCircle}
                    target={<ItemDetail {...props} />}
                    shortcut={{ modifiers: ["cmd"], key: "o" }}
                  />
                  <ActionPanel.Section title="Management zone">
                    <Action.Push
                      title="Edit Item"
                      icon={Icon.Pencil}
                      target={<ItemForm {...props} revalidate={revalidate} />}
                      shortcut={{ modifiers: ["cmd"], key: "e" }}
                    />
                    <Action
                      title={favored ? "Remove From Favorite" : "Add to Favorite"}
                      icon={Icon.Stars}
                      onAction={async () =>
                        await itemUpdate(props, { favored: !favored, archived: favored ? archived : false }, revalidate)
                      }
                      shortcut={{ modifiers: ["cmd"], key: "f" }}
                    />
                    <Action
                      title={archived ? "Remove From Archived" : "Add to Archived"}
                      icon={Icon.Tray}
                      onAction={async () =>
                        await itemUpdate(
                          props,
                          { archived: !archived, favored: archived ? favored : false },
                          revalidate,
                        )
                      }
                      shortcut={{ modifiers: ["cmd"], key: "s" }}
                    />
                    <Action
                      title="Sync Items"
                      icon={Icon.RotateClockwise}
                      onAction={revalidate}
                      shortcut={{ modifiers: ["cmd"], key: "r" }}
                    />
                  </ActionPanel.Section>
                  <ActionPanel.Section title="Danger zone">
                    <Action.Trash paths={path} shortcut={{ modifiers: ["ctrl"], key: "x" }} onTrash={revalidate} />
                  </ActionPanel.Section>
                </ActionPanel>
              }
            />
          );
        })
      )}
    </List>
  );
}
