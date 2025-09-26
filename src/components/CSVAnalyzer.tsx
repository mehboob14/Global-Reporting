import { useState, useEffect } from "react";
import FileSelector from "./FileSelector";
import DataTable from "./DataTable";
import MasterDataAnalyzer from "./MasterDataAnalyzer";
import { Loader2 } from "lucide-react";
import * as XLSX from "xlsx";

interface DataRow {
  [key: string]: string | number;
}

export default function CSVAnalyzer() {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [filters, setFilters] = useState<{ [key: string]: string[] }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currencyColumns = ["local_currency_amount", "global_currency_amount"];

  useEffect(() => {
    const availableFiles = ["master_data.xlsx", "COA_PAK.xlsx", "COA_Japan_faulty.xlsx", "COA_SAUDI.xlsx","COA_UAE.xlsx"];
    setFiles(availableFiles);
    if (availableFiles.length > 0) {
      handleFileSelect(availableFiles[0]);
    }
  }, []);
    interface MasterDataAnalyzerProps {
  data: DataRow[];
}
  const handleFileSelect = async (filename: string) => {
    setSelectedFile(filename);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/data/${filename}`);
      if (!response.ok) throw new Error("Failed to load file");
      const blob = await response.blob();
      const arrayBuffer = await blob.arrayBuffer();

      let jsonData: DataRow[] = [];

      if (filename.endsWith(".csv")) {
        // Parse CSV
        const text = await blob.text();
        const rows = text.split("\n").filter(Boolean);
        const headers = rows[0].split("\t"); // tab-separated
        jsonData = rows.slice(1).map((row) => {
          const values = row.split("\t");
          const obj: DataRow = {};
          headers.forEach((header, i) => (obj[header] = values[i]));
          return obj;
        });
      } else {
        // Parse XLSX
        const workbook = XLSX.read(arrayBuffer, { type: "array" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: "" }) as DataRow[];
      }

      if (jsonData.length === 0) throw new Error("No rows found in file");

      setData(jsonData);
      setColumns(Object.keys(jsonData[0] as object));
      setFilters({});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load file");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen flex flex-row bg-background">
      {/* Sidebar */}
      <div className="w-56 border-r bg-muted p-2">
        <FileSelector files={files} selectedFile={selectedFile} onFileSelect={handleFileSelect} />
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-hidden">
        {loading && (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="ml-2">Loading data...</span>
          </div>
        )}

        {error && !loading && <div className="h-full flex items-center justify-center text-red-500">{error}</div>}

        {!loading && !error && data.length > 0 && (
          <>
            {selectedFile === "master_data.xlsx" ? (
              <MasterDataAnalyzer data={data} />
            ) : (
              <DataTable
                data={data}
                columns={columns}
                filters={filters}
                onFiltersChange={setFilters}
                currencyColumns={currencyColumns}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}
