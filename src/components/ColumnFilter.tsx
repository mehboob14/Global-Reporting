import { useState } from "react";
import { Button } from "../components/ui/button";
import { Checkbox } from "../components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { ChevronDown, Filter } from "lucide-react";
import { Badge } from "../components/ui/badge";

interface ColumnFilterProps {
  columnName: string;
  uniqueValues: string[];
  selectedValues: string[];
  onSelectionChange: (values: string[]) => void;
}

export default function ColumnFilter({ 
  columnName, 
  uniqueValues, 
  selectedValues, 
  onSelectionChange 
}: ColumnFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isAllSelected = selectedValues.length === uniqueValues.length;
  const hasFilters = selectedValues.length !== uniqueValues.length;

  const handleSelectAll = () => {
    const newSelection = isAllSelected ? [] : uniqueValues;
    onSelectionChange(newSelection);
    console.log(`${columnName}: Selected ${isAllSelected ? 'none' : 'all'} values`);
  };

  const handleValueToggle = (value: string) => {
    const newSelection = selectedValues.includes(value)
      ? selectedValues.filter(v => v !== value)
      : [...selectedValues, value];
    onSelectionChange(newSelection);
    console.log(`${columnName}: Toggled ${value}, selected count: ${newSelection.length}`);
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className={`h-8 px-2 font-medium text-xs uppercase tracking-wide justify-between w-full ${hasFilters ? 'bg-primary/10 text-primary' : ''}`}
          data-testid={`button-filter-${columnName}`}
        >
          <span className="flex items-center gap-1">
            {hasFilters && <Filter className="w-3 h-3" />}
            {columnName}
          </span>
          <ChevronDown className="w-3 h-3 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-3" align="start">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-sm">{columnName}</span>
            {hasFilters && (
              <Badge variant="secondary" className="text-xs">
                {selectedValues.length} of {uniqueValues.length}
              </Badge>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox
              id={`${columnName}-all`}
              checked={isAllSelected}
              onCheckedChange={handleSelectAll}
              data-testid={`checkbox-${columnName}-all`}
            />
            <label 
              htmlFor={`${columnName}-all`} 
              className="text-sm font-medium cursor-pointer"
            >
              ALL
            </label>
          </div>

          <div className="max-h-48 overflow-y-auto space-y-2">
            {uniqueValues.map((value) => (
              <div key={value} className="flex items-center space-x-2">
                <Checkbox
                  id={`${columnName}-${value}`}
                  checked={selectedValues.includes(value)}
                  onCheckedChange={() => handleValueToggle(value)}
                  data-testid={`checkbox-${columnName}-${value}`}
                />
                <label 
                  htmlFor={`${columnName}-${value}`} 
                  className="text-sm cursor-pointer truncate flex-1"
                  title={value}
                >
                  {value}
                </label>
              </div>
            ))}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}