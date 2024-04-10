import { Action, ActionPanel, Clipboard, Icon, List } from "@raycast/api";
import { StorePath, decryptFile, findFiles } from "./utils";

export default function Command() {
  const files = findFiles(StorePath);

  return (
    <List filtering={false} searchBarPlaceholder="Search your item...">
      {files.map((file: string) => {
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
              </ActionPanel>
            }
          />
        );
      })}
    </List>
  );
}
