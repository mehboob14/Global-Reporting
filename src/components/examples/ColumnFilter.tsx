import { useState } from "react";
import ColumnFilter from "../ColumnFilter";

export default function ColumnFilterExample() {
  // todo: remove mock functionality
  const mockCountries = ["Pakistan", "Saudi Arabia", "UAE", "India", "Bangladesh"];
  const [selectedCountries, setSelectedCountries] = useState<string[]>(mockCountries);

  return (
    <div className="p-4 w-48">
      <ColumnFilter
        columnName="Country"
        uniqueValues={mockCountries}
        selectedValues={selectedCountries}
        onSelectionChange={setSelectedCountries}
      />
    </div>
  );
}