import { useState, useEffect, useMemo } from "react";
import DataTable from "./DataTable";
import * as XLSX from "xlsx";

interface DataRow {
  [key: string]: string | number;
}

export default function MasterDataAnalyzer() {
  const [data, setData] = useState<DataRow[]>([]);
  const [filters, setFilters] = useState<Record<string, string[]>>({
    country: [],
    foreign_currency: [],
    account_type: [],
    category: [],
    sub_category: [],
  });

  const currencyColumns = ["local_currency_amount", "global_currency_amount"];

  useEffect(() => {
    const loadMasterData = async () => {
      const response = await fetch("/data/master_data.xlsx");
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as DataRow[];

      
      const normalizedData = jsonData.map(row => {
      const newRow: DataRow = {};
  Object.keys(row).forEach(k => {
    newRow[k.toLowerCase().replace(/\s+/g, "_")] = row[k];
  });
  return newRow;
});


      setData(normalizedData);
    };
    loadMasterData();
  }, []);

  
  const uniqueOptions = useMemo(() => {
    const opts: Record<string, string[]> = {
      country: [],
      foreign_currency: [],
      account_type: [],
      category: [],
      sub_category: [],
    };
    data.forEach(row => {
      Object.keys(opts).forEach(key => {
        const val = String(row[key] || "").trim();
        if (val && !opts[key].includes(val)) opts[key].push(val);
      });
    });
    return opts;
  }, [data]);

  
  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => {
      if (value === "All") {
        return {
          ...prev,
          [key]: prev[key].length === uniqueOptions[key].length ? [] : [...uniqueOptions[key]],
        };
      }
      const current = prev[key];
      return {
        ...prev,
        [key]: current.includes(value)
          ? current.filter(v => v !== value)
          : [...current, value],
      };
    });
  };

  
  const filteredData = useMemo(() => {
  return data.filter(row =>
    Object.keys(filters).every(key => {
      const vals = filters[key];
      if (vals.length === 0) return true;
      const rowValue = String(row[key] || "").trim().toLowerCase();
      return vals.some(v => v.toLowerCase() === rowValue);

    })
  );
}, [data, filters]);

  const groupAndSum = (rows: DataRow[], groupKeys: string[]) => {
    const map = new Map<string, DataRow>();
    rows.forEach(row => {
      const key = groupKeys.map(k => row[k]).join("|");
      if (!map.has(key)) {
        map.set(key, { ...row });
      } else {
        const existing = map.get(key)!;
        currencyColumns.forEach(col => {
          existing[col] = (parseFloat(existing[col] as string) || 0) + (parseFloat(row[col] as string) || 0);
        });
      }
    });
    return Array.from(map.values());
  };

  const subsidiarySummary = useMemo(
    () => groupAndSum(filteredData, ["country","erp_system","local_currency","foreign_currency"]),
    [filteredData]
  );

  const groupSummary = useMemo(
    () => groupAndSum(filteredData, ["country","erp_system","group_code","account_code","account_type","category","sub_category","foreign_currency"]),
    [filteredData]
  );

  const finalSummary = useMemo(
    () => groupAndSum(filteredData, ["group_code","account_type","category","sub_category","foreign_currency"]),
    [filteredData]
  );

  return (
    <div className="p-4 flex flex-col gap-6 h-screen overflow-auto">
      {/* Filters Row */}
      <div className="grid grid-cols-5 gap-4">
        {Object.keys(filters).map(key => (
          <div key={key} className="flex flex-col border rounded p-2 bg-white shadow-sm">
            <span className="font-semibold mb-1">{key.replace("_"," ")}</span>

           
            <label className="flex items-center gap-1 mb-1">
              <input
                type="checkbox"
                checked={filters[key].length === 0 || filters[key].length === uniqueOptions[key].length}
                onChange={() => handleFilterChange(key, "All")}
              />
              All
            </label>

            {/* Individual checkboxes */}
            <div className="flex flex-col max-h-32 overflow-auto mt-1">
              {uniqueOptions[key].map(val => (
                <label key={val} className="flex items-center gap-1">
                  <input
                    type="checkbox"
                    checked={filters[key].includes(val)}
                    onChange={() => handleFilterChange(key, val)}
                  />
                  {val}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      
      <div>
        <h3 className="font-bold mb-2">Subsidiary Wise Summary</h3>
        <DataTable
          data={subsidiarySummary}
          columns={["country","erp_system","local_currency","local_currency_amount","foreign_currency","global_currency_amount"]}
          filters={{}}
          onFiltersChange={() => {}}
          currencyColumns={currencyColumns}
        />
      </div>

      
      <div>
        <h3 className="font-bold mb-2">Group Consolidated Account Summary</h3>
        <DataTable
          data={groupSummary}
          columns={["country","erp_system","group_code","account_code","account_type","category","sub_category","local_currency_amount","foreign_currency","global_currency_amount"]}
          filters={{}}
          onFiltersChange={() => {}}
          currencyColumns={currencyColumns}
        />
      </div>

      
      <div>
        <h3 className="font-bold mb-2">Final Consolidated Summary</h3>
        <DataTable
          data={finalSummary}
          columns={["group_code","account_type","category","sub_category","local_currency_amount","foreign_currency","global_currency_amount"]}
          filters={{}}
          onFiltersChange={() => {}}
          currencyColumns={currencyColumns}
        />
      </div>
    </div>
  );
}
