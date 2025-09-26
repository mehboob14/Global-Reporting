import { useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../components/ui/table";
import ColumnFilter from "./ColumnFilter";

interface DataRow {
  [key: string]: string | number;
}

interface ColumnFilters {
  [columnName: string]: string[];
}

interface DataTableProps {
  data: DataRow[];
  columns: string[];
  filters: ColumnFilters;
  onFiltersChange: (filters: ColumnFilters) => void;
  currencyColumns?: string[];
}

export default function DataTable({ 
  data, 
  columns, 
  filters, 
  onFiltersChange, 
  currencyColumns = [] 
}: DataTableProps) {
  
  // Get unique values for each column
  const uniqueValues = useMemo(() => {
    const values: { [key: string]: string[] } = {};
    columns.forEach(column => {
      const uniqueSet = new Set<string>();
      data.forEach(row => {
        const value = String(row[column] || '');
        if (value.trim()) uniqueSet.add(value);
      });
      values[column] = Array.from(uniqueSet).sort();
    });
    return values;
  }, [data, columns]);

  const visibleColumns = useMemo(
    () => columns.filter((col) => col !== "Forex_Rate"),
    [columns]
  );

  // Filter data based on selected filters
const filteredData = useMemo(() => {
  return data.filter(row => {
    return Object.entries(filters).every(([column, selectedValues]) => {
      const uniqueVals = uniqueValues[column] || [];
      if (selectedValues.length === uniqueVals.length) {
        // All selected → show all
        return true;
      }
      if (selectedValues.length === 0) {
        // None selected → hide all
        return false;
      }
      const rowValue = String(row[column] || '');
      return selectedValues.includes(rowValue);
    });
  });
}, [data, filters, uniqueValues]);


  const totals = useMemo(() => {
    const totalRow: DataRow = {};
    currencyColumns.forEach(column => {
      const sum = filteredData.reduce((acc, row) => {
        const value = parseFloat(String(row[column] || '0').replace(/[^\d.-]/g, ''));
        return acc + (isNaN(value) ? 0 : value);
      }, 0);
      totalRow[column] = sum.toLocaleString('en-US', { 
        minimumFractionDigits: 2, 
        maximumFractionDigits: 2 
      });
    });
    return totalRow;
  }, [filteredData, currencyColumns]);

  const handleFilterChange = (columnName: string, selectedValues: string[]) => {
    onFiltersChange({
      ...filters,
      [columnName]: selectedValues
    });
    console.log(`Filter updated for ${columnName}: ${selectedValues.length} values selected`);
  };

  const formatCellValue = (value: any, column: string) => {
    if (currencyColumns.includes(column) && value !== null && value !== undefined) {
      const numValue = parseFloat(String(value).replace(/[^\d.-]/g, ''));
      if (!isNaN(numValue)) {
        return numValue.toLocaleString('en-US', { 
          minimumFractionDigits: 2, 
          maximumFractionDigits: 2 
        });
      }
    }
    return value;
  };

  // Special narrower columns
  const narrowCols = ["Local_Currency_Amount", "Global_Currency_Amount"];

  return (
  <div className="flex-1 flex flex-col overflow-hidden">
    {/* Scrollable rows */}
    <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[70vh]">
      <Table className="min-w-full border-collapse">
        <TableHeader className="sticky top-0 bg-background z-10">
          <TableRow className="border-b">
            {visibleColumns.map((column) => (
              <TableHead
                key={column}
                className="p-1 min-w-[100px] border-r border-border/50 text-xs"
              >
                <div className="p-1">
                  <ColumnFilter
                    columnName={column}
                    uniqueValues={uniqueValues[column] || []}
                    selectedValues={filters[column] || uniqueValues[column] || []}
                    onSelectionChange={(values) => handleFilterChange(column, values)}
                  />
                </div>
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>

        <TableBody>
          {filteredData.map((row, index) => (
            <TableRow
              key={index}
              className="hover:bg-muted/50 border-b border-border/30"
            >
              {visibleColumns.map((column) => (
                <TableCell
                  key={column}
                  className={`p-2 border-r border-border/30 text-xs ${
                    currencyColumns.includes(column) ? "text-right font-mono" : ""
                  }`}
                >
                  {formatCellValue(row[column], column)}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>

    {/* Sticky totals row */}
    {currencyColumns.length > 0 && filteredData.length > 0 && (
      <div className="border-t-2 border-primary/20 bg-muted/30">
        <Table className="min-w-full border-collapse">
          <TableBody>
            <TableRow className="font-semibold">
              {visibleColumns.map((column, index) => (
                <TableCell
                  key={column}
                  className={`p-2 border-r border-border/30 text-xs ${
                    currencyColumns.includes(column) ? "text-right font-mono" : ""
                  } ${index === 0 ? "font-semibold" : ""}`}
                >
                  {index === 0 ? (
                    <span className="text-primary">Total</span>
                  ) : currencyColumns.includes(column) ? (
                    <span className="text-primary">{totals[column]}</span>
                  ) : (
                    ""
                  )}
                </TableCell>
              ))}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    )}

    {/* Footer info */}
    <div className="p-2 border-t bg-muted/20 flex items-center justify-between text-xs text-muted-foreground">
      <span>
        Showing {filteredData.length} of {data.length} rows
      </span>
      {Object.values(filters).some(
        (values) =>
          values.length <
          (uniqueValues[
            Object.keys(filters).find((key) => filters[key] === values) || ""
          ]?.length || 0)
      ) && <span className="text-primary font-medium">Filters active</span>}
    </div>
  </div>
);

}
