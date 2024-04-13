import { Action, ActionPanel, Clipboard, Color, Detail, Icon, List, useNavigation } from "@raycast/api";
import { useCachedPromise, useCachedState } from "@raycast/utils";
import { CATEGORIES, DEFAULT_CATEGORY, decryptFile, findItems, getCategoryIcon } from "./utils";

function Editor(props: { content: string }) {
  const { pop } = useNavigation();

  return (
    <Detail
      markdown={props.content}
      actions={
        <ActionPanel>
          <Action title="Go Back" onAction={pop} />
        </ActionPanel>
      }
    />
  );
}

function ListActionPanel(props: { file: string; revalidate: () => void }) {
  const { push } = useNavigation();

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
        title="Edit Raw"
        icon={Icon.Pencil}
        onAction={async () => {
          const content = await decryptFile(props.file);
          push(<Editor content={String(content)} />);
        }}
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

function Categories({ onCategoryChange }: { onCategoryChange: (newCategory: string) => void }) {
  return (
    <List.Dropdown defaultValue={DEFAULT_CATEGORY} onChange={onCategoryChange} tooltip="Select Category" storeValue>
      <List.Dropdown.Item key={"000"} icon={Icon.AppWindowGrid3x3} title="All Categories" value={DEFAULT_CATEGORY} />
      {Object.values(CATEGORIES)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(({ category, title }) => (
          <List.Dropdown.Item key={category} icon={getCategoryIcon(category)} title={title} value={category} />
        ))}
    </List.Dropdown>
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
      searchBarAccessory={<Categories onCategoryChange={onCategoryChange} />}
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
