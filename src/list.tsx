import { CategoryDropdown } from "@/components";
import { CATEGORIES, DEFAULT_CATEGORY, decryptFile, findItems, getCategoryIcon } from "@/utils";
import { Action, ActionPanel, Clipboard, Color, Icon, List } from "@raycast/api";
import { useCachedPromise, useCachedState } from "@raycast/utils";

function ListActionPanel(props: { file: string; revalidate: () => void }) {
  return (
    <ActionPanel title="Item actions">
      <Action
        title="Copy to Clipboard"
        icon={Icon.Clipboard}
        onAction={async () => {
          const content = await decryptFile(props.file);
          await Clipboard.copy(content as string, { concealed: true });
        }}
      />
      <Action
        title="Sync Items"
        icon={Icon.RotateClockwise}
        onAction={() => props.revalidate}
        shortcut={{ modifiers: ["cmd"], key: "r" }}
      />
      <ActionPanel.Section title="Danger zone">
        <Action.Trash
          paths={props.file}
          shortcut={{ modifiers: ["ctrl"], key: "x" }}
          onTrash={() => props.revalidate()}
        />
      </ActionPanel.Section>
    </ActionPanel>
  );
}

export default function ListItems() {
  const [category, setCategory] = useCachedState<string>("selected_category", DEFAULT_CATEGORY);
  const { data: items = [], isLoading, revalidate } = useCachedPromise(findItems, []);

  const categoryItems = category === DEFAULT_CATEGORY ? items : items?.filter(({ item }) => item.category === category);
  const onCategoryChange = (newCategory: string) => {
    category !== newCategory && setCategory(newCategory);
  };

  return (
    <List
      filtering={false}
      searchBarAccessory={<CategoryDropdown onCategoryChange={onCategoryChange} />}
      searchBarPlaceholder="Search your item..."
      isLoading={isLoading}
    >
      {categoryItems.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No items found"
          description="Any items you have added in your password store will be listed here."
        />
      ) : (
        categoryItems.map(({ id, item, path, filename, favored, archived }) => {
          return (
            <List.Item
              key={id}
              title={filename}
              subtitle={item.category === "login" ? item.username : "-"}
              icon={{
                value: { source: getCategoryIcon(item.category), tintColor: Color.Blue },
                tooltip: CATEGORIES[item.category].title,
              }}
              accessories={[
                favored ? { icon: { source: Icon.Stars, tintColor: Color.Yellow }, tooltip: "Favorite item" } : {},
                archived ? { icon: { source: Icon.Folder, tintColor: Color.Yellow }, tooltip: "Archived item" } : {},
              ]}
              actions={<ListActionPanel file={path} revalidate={revalidate} />}
            />
          );
        })
      )}
    </List>
  );
}
