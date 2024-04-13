import { CATEGORIES, DEFAULT_CATEGORY, getCategoryIcon } from "@/utils";
import { Icon, List } from "@raycast/api";

export function CategoryDropdown({ onCategoryChange }: { onCategoryChange: (newCategory: string) => void }) {
  return (
    <List.Dropdown defaultValue={DEFAULT_CATEGORY} onChange={onCategoryChange} tooltip="Select Category" storeValue>
      <List.Dropdown.Item key={"all"} icon={Icon.AppWindowGrid3x3} title="All Categories" value={DEFAULT_CATEGORY} />
      <List.Dropdown.Item key={"favored"} icon={Icon.Stars} title="Favorites" value={"favored"} />
      <List.Dropdown.Item key={"archived"} icon={Icon.Tray} title="Archived" value={"archived"} />
      {Object.values(CATEGORIES)
        .sort((a, b) => a.title.localeCompare(b.title))
        .map(({ category, title }) => (
          <List.Dropdown.Item key={category} icon={getCategoryIcon(category)} title={title} value={category} />
        ))}
    </List.Dropdown>
  );
}
