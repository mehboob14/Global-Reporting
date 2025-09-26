import { useState } from "react";
import DataTable from "../DataTable";

export default function DataTableExample() {
  // todo: remove mock functionality
  const mockData = [
    {
      Country: "Pakistan",
      Region: "South Asia",
      Product: "Cotton Textiles",
      "Local Currency": "15000000.50",
      "Global Currency": "52500.25",
      Category: "Export"
    },
    {
      Country: "Saudi Arabia", 
      Region: "Middle East",
      Product: "Petroleum Products",
      "Local Currency": "125000000.00",
      "Global Currency": "33333333.33",
      Category: "Export"
    },
    {
      Country: "UAE",
      Region: "Middle East", 
      Product: "Gold Jewelry",
      "Local Currency": "8500000.75",
      "Global Currency": "2314815.00",
      Category: "Import"
    },
    {
      Country: "Pakistan",
      Region: "South Asia",
      Product: "Rice",
      "Local Currency": "25000000.00",
      "Global Currency": "87500.00",
      Category: "Export"
    },
    {
      Country: "UAE",
      Region: "Middle East",
      Product: "Electronics", 
      "Local Currency": "12750000.25",
      "Global Currency": "3472222.22",
      Category: "Import"
    },
    {
      Country: "Saudi Arabia",
      Region: "Middle East",
      Product: "Dates",
      "Local Currency": "3500000.00",
      "Global Currency": "933333.33",
      Category: "Export"
    }
  ];

  const columns = ["Country", "Region", "Product", "Local Currency", "Global Currency", "Category"];
  const currencyColumns = ["Local Currency", "Global Currency"];
  
  const [filters, setFilters] = useState<{[key: string]: string[]}>({});

  return (
    <div className="h-96">
      <DataTable
        data={mockData}
        columns={columns}
        filters={filters}
        onFiltersChange={setFilters}
        currencyColumns={currencyColumns}
      />
    </div>
  );
}