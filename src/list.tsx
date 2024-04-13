import { Action, ActionPanel, Clipboard, Detail, Icon, List, useNavigation } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { StorePath, decryptFile, findFiles } from "./utils";

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

export default function Command() {
  const { data: files, isLoading, revalidate } = useCachedPromise(findFiles, [StorePath]);

  return (
    <List filtering={false} searchBarPlaceholder="Search your item..." isLoading={isLoading} isShowingDetail>
      {(files ?? []).map((file: string) => {
        return (
          <List.Item
            key={file}
            title={file.replaceAll(StorePath, "")}
            detail={
              <List.Item.Detail markdown="![Illustration](https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/25.png)" />
            }
            actions={<ListActionPanel file={file} revalidate={revalidate} />}
          />
        );
      })}
    </List>
  );
}
