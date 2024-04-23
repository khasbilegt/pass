import { CategoryDropdown, ItemDetail, ItemForm, ListItemCopyActions, ListItemPasteActions } from "@/components";
import { CATEGORIES, findItems, getCategoryIcon } from "@/utils";
import { Action, ActionPanel, Color, Icon, List } from "@raycast/api";
import { useCachedPromise, useCachedState } from "@raycast/utils";
import { itemUpdate } from "./actions";

import { ItemCategoryDropdownTypes, ItemListContent } from "./types";

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
    if (category === "null") return !archived;
    else if (category === "favored") return favored;
    else if (category === "archived") return archived;
    else return category === item.category;
  });

  const sectionItems = categoryItems.reduce<{ "Favorite items": ItemListContent[]; "Other items": ItemListContent[] }>(
    (acc, item) => {
      if (item.favored) {
        acc["Favorite items"].push(item);
      } else {
        acc["Other items"].push(item);
      }
      return acc;
    },
    { "Favorite items": [], "Other items": [] },
  );

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
      {items.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No items found"
          description="Any items you have added in your password store will be listed here."
        />
      ) : (
        Object.entries(sectionItems).map(([title, sectionItems]) => (
          <List.Section key={title} title={title}>
            {sectionItems
              .sort((a, b) => b.modified - a.modified)
              .map((props) => {
                const { id, item, path, filename, favored, archived, modified } = props;
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
                      favored
                        ? { icon: { source: Icon.Stars, tintColor: Color.Yellow }, tooltip: "Favorite item" }
                        : {},
                      archived
                        ? { icon: { source: Icon.Tray, tintColor: Color.Yellow }, tooltip: "Archived item" }
                        : {},
                      modified ? { date: modifiedDate, tooltip: `Last modified at ${modifiedDate}` } : {},
                    ]}
                    actions={
                      <ActionPanel title="Item actions">
                        <ListItemCopyActions {...props} />
                        <ActionPanel.Section title="Paste actions">
                          <ListItemPasteActions {...props} />
                        </ActionPanel.Section>
                        <ActionPanel.Section title="Management actions">
                          <Action.Push
                            title="Open Item"
                            icon={Icon.ArrowRightCircle}
                            target={<ItemDetail {...props} />}
                            shortcut={{ modifiers: ["cmd"], key: "o" }}
                          />
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
                              await itemUpdate(
                                props,
                                { favored: !favored, archived: favored ? archived : false },
                                revalidate,
                              )
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
                          <Action.Trash
                            paths={path}
                            shortcut={{ modifiers: ["ctrl"], key: "x" }}
                            onTrash={revalidate}
                          />
                        </ActionPanel.Section>
                      </ActionPanel>
                    }
                  />
                );
              })}
          </List.Section>
        ))
      )}
    </List>
  );
}
