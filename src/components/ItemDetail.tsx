import { ItemListContent } from "@/types";
import { Detail } from "@raycast/api";

export function ItemDetail(props: ItemListContent) {
  return <Detail markdown={JSON.stringify(props)} />;
}
