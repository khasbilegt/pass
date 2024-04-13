import { CATEGORIES, DEFAULT_CATEGORY, getCategoryIcon } from "@/utils";
import { Icon, List } from "@raycast/api";

export function CategoryDropdown({ onCategoryChange }: { onCategoryChange: (newCategory: string) => void }) {
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
