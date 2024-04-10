import { Action, ActionPanel, Clipboard, Icon, List, getPreferenceValues } from "@raycast/api";
import fs from "node:fs";
import { homedir } from "node:os";
import path from "node:path";
import * as openpgp from "openpgp";

interface Preferences {
  passphrase: string;
  publicKeyPath: string;
  privateKeyPath: string;
}

const storePath = path.join(homedir(), ".password-store");

function findFiles(folderPath: string) {
  const results: string[] = [];
  const files = fs.readdirSync(folderPath);

  for (const file of files) {
    const filePath = path.join(folderPath, file);
    const stats = fs.lstatSync(filePath);

    if (stats.isDirectory()) {
      results.push(...findFiles(filePath));
    } else if (path.extname(filePath) === ".gpg") {
      results.push(filePath);
    }
  }

  return results;
}

async function decryptFile(encryptedFilePath: string, preferences: Preferences) {
  const [publicKeyArmored, privateKeyArmored] = await Promise.all([
    await fs.promises.readFile(preferences.publicKeyPath, "utf-8"),
    await fs.promises.readFile(preferences.privateKeyPath, "utf-8"),
  ]);

  const [publicKey, privateKey] = await Promise.all([
    await openpgp.readKey({ armoredKey: publicKeyArmored }),
    await openpgp.decryptKey({
      privateKey: await openpgp.readPrivateKey({ armoredKey: privateKeyArmored }),
      passphrase: preferences.passphrase,
    }),
  ]);

  const binaryMessage = await fs.promises.readFile(encryptedFilePath);
  const message = await openpgp.readMessage({ binaryMessage });
  const { data } = await openpgp.decrypt({
    message,
    verificationKeys: publicKey,
    decryptionKeys: privateKey,
  });
  return data;
}

export default function Command() {
  const files = findFiles(storePath);
  const preferences = getPreferenceValues<Preferences>();

  return (
    <List filtering={false} searchBarPlaceholder="Search your password">
      {files.map((file: string) => {
        return (
          <List.Item
            key={file}
            title={file.replaceAll(storePath, "")}
            actions={
              <ActionPanel title="Item actions">
                <Action
                  title="Copy to Clipboard"
                  icon={Icon.Clipboard}
                  onAction={async () => {
                    const content = await decryptFile(file, preferences);
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
