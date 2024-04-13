import { Action, ActionPanel, Clipboard, Color, Detail, Icon, List, useNavigation } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { decryptFile, findItems, getCategoryIcon } from "./utils";

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

export default function ListItems() {
  const { data: items = [], isLoading, revalidate } = useCachedPromise(findItems, []);

  return (
    <List filtering={false} searchBarPlaceholder="Search your item..." isLoading={isLoading}>
      {items.length === 0 && !isLoading ? (
        <List.EmptyView
          title="No items found"
          description="Any items you have added in 1Password app will be listed here."
        />
      ) : (
        items.map((item) => {
          return (
            <List.Item
              key={item.id}
              icon={{
                value: { source: getCategoryIcon(item.item.category), tintColor: Color.Blue },
                tooltip: item.item.category.charAt(0).toUpperCase() + item.item.category.slice(1),
              }}
              title={item.filename}
              subtitle={item.path}
              accessories={[
                item.favored ? { icon: { source: Icon.Stars, tintColor: Color.Yellow }, tooltip: "Favorite item" } : {},
                item.archived
                  ? { icon: { source: Icon.Folder, tintColor: Color.Yellow }, tooltip: "Archived item" }
                  : {},
                // { text: item.vault?.name },
              ]}
              actions={<ListActionPanel file={item.path} revalidate={revalidate} />}
            />
          );
        })
      )}
    </List>
  );
}
