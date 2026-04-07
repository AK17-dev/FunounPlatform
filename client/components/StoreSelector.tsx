import type { Store } from "@shared/types";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StoreSelectorProps {
  stores: Store[];
  activeStoreId: string | null;
  onChange: (storeId: string | null) => void;
}

export function StoreSelector({
  stores,
  activeStoreId,
  onChange,
}: StoreSelectorProps) {
  if (stores.length <= 1) {
    return null;
  }

  return (
    <div className="space-y-2 max-w-xs">
      <Label>Active Store</Label>
      <Select
        value={activeStoreId ?? ""}
        onValueChange={(value) => onChange(value || null)}
      >
        <SelectTrigger>
          <SelectValue placeholder="Select a store" />
        </SelectTrigger>
        <SelectContent>
          {stores.map((store) => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}


