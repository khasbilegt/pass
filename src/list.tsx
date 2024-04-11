import { Action, ActionPanel, Clipboard, Icon, List } from "@raycast/api";
import { useCachedPromise } from "@raycast/utils";
import { StorePath, decryptFile, findFilesAsync } from "./utils";

export default function Command() {
  const { data: files, isLoading, revalidate } = useCachedPromise(findFilesAsync, [StorePath]);

  return (
    <List filtering={false} searchBarPlaceholder="Search your item..." isLoading={isLoading}>
      {(files ?? []).map((file: string) => {
        return (
          <List.Item
            key={file}
            title={file.replaceAll(StorePath, "")}
            actions={
              <ActionPanel title="Item actions">
                <Action
                  title="Copy to Clipboard"
                  icon={Icon.Clipboard}
                  onAction={async () => {
                    const content = await decryptFile(file);
                    await Clipboard.copy(content as string, { concealed: true });
                  }}
                />
                <ActionPanel.Section title="Danger zone">
                  <Action.Trash
                    paths={file}
                    shortcut={{ modifiers: ["ctrl"], key: "x" }}
                    onTrash={() => revalidate()}
                  />
                </ActionPanel.Section>
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
