import { Button } from "../components/ui/button";
import { FileText } from "lucide-react";

interface FileSelectorProps {
  files: string[];
  selectedFile: string | null;
  onFileSelect: (filename: string) => void;
}

export default function FileSelector({ files, selectedFile, onFileSelect }: FileSelectorProps) {
  return (
    <div className="border-b bg-card">
      <div className="p-4">
        <h1 className="text-lg font-semibold text-foreground mb-4">Finora Global Dash</h1>
        <div className="flex gap-2 flex-wrap">
          {files.map((filename) => {
            const isSelected = selectedFile === filename;
            const displayName = filename.replace(/\.(csv|xlsx)$/i, '').replace(/_/g, ' ');
            
            return (
              <Button
                key={filename}
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  console.log(`Selected file: ${filename}`);
                  onFileSelect(filename);
                }}
                className="flex items-center gap-2"
                data-testid={`button-select-file-${filename}`}
              >
                <FileText className="w-4 h-4" />
                {displayName}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
}