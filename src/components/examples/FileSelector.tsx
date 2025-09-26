import { useState } from "react";
import FileSelector from "../FileSelector";

export default function FileSelectorExample() {
  const [selectedFile, setSelectedFile] = useState<string | null>("COA_PAK_1758827146187.csv");
  
  // todo: remove mock functionality
  const mockFiles = [
    "COA_PAK_1758827146187.csv",
    "COA_SAUDI_1758827146187.csv", 
    "COA_UAE_1758827146187.csv"
  ];

  return (
    <FileSelector
      files={mockFiles}
      selectedFile={selectedFile}
      onFileSelect={setSelectedFile}
    />
  );
}