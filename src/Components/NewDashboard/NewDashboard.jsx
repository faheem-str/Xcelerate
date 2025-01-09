import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";

const NewDashboard = () => {
  const [rawDataOld, setRawDataOld] = useState(null);
  const [rawDataNew, setRawDataNew] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [columnMapping, setColumnMapping] = useState({});
  const [error, setError] = useState("");
  const [newFields, setNewFields] = useState([]);
  const [contactFields, setContactFields] = useState([]);

  // Sample Contact Field JSON for Auto-Mapping
  const contactFieldJSON = [
    "First Name",
    "Last Name",
    "Email",
    "Phone",
    "Address",
  ];

  useEffect(() => {
    // Set contact fields on component mount
    setContactFields(contactFieldJSON);
  }, []);

  const handleFileUpload = (event, isNew) => {
    const file = event.target.files[0];
    if (!file) {
      setError("Please select a file.");
      return;
    }

    const fileType = file.name.split(".").pop();
    if (!["xlsx", "xls"].includes(fileType)) {
      setError("Invalid file type. Please upload an Excel file (.xlsx or .xls)."
      );
      return;
    }

    setError(""); // Clear any previous errors

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheetName = workbook.SheetNames[0];
      const sheet = workbook.Sheets[sheetName];
      const jsonData = XLSX.utils.sheet_to_json(sheet);
      console.log("Raw Data:", jsonData);
      if (isNew) {
        setRawDataNew(jsonData);
      } else {
        setRawDataOld(jsonData);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleColumnMappingChange = (oldColumn, newColumn) => {
    setColumnMapping((prev) => ({ ...prev, [oldColumn]: newColumn }));
  };

  const handleAddNewField = () => {
    const fieldName = prompt("Enter new field name:");
    if (fieldName) {
      setNewFields((prev) => [...prev, fieldName]);
      setContactFields((prev) => [...prev, fieldName]);
    }
  };

  const handleProcessData = () => {
    if (!rawDataOld || !rawDataNew) {
      setError("Please upload both old and new CRM files.");
      return;
    }

    setError(""); // Clear errors

    const processed = rawDataOld.map((row) => {
      const newRow = {};
      Object.keys(row).forEach((key) => {
        const newKey = columnMapping[key] || key; // Use mapped column or original
        newRow[newKey] = row[key];
      });
      return newRow;
    });

    console.log("Processed Data:", processed);
    setProcessedData(processed);
  };

  const handleFileDownload = () => {
    if (!processedData) {
      setError("No processed data available. Please process the data first.");
      return;
    }

    setError(""); // Clear errors
    const worksheet = XLSX.utils.json_to_sheet(processedData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Processed Data");
    XLSX.writeFile(workbook, "processed_data.xlsx");
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>CRM Data Migration</h2>

      <div style={{ marginBottom: "20px" }}>
        <h3>Upload Old CRM File</h3>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => handleFileUpload(e, false)}
        />
      </div>

      <div style={{ marginBottom: "20px" }}>
        <h3>Upload New CRM File</h3>
        <input
          type="file"
          accept=".xlsx, .xls"
          onChange={(e) => handleFileUpload(e, true)}
        />
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {rawDataOld && rawDataNew && (
        <>
          <h3>Column Mapping</h3>
          {Object.keys(rawDataOld[0]).map((key) => (
            <div key={key} style={{ marginBottom: "10px" }}>
              <label>
                {key} →
                <select
                  onChange={(e) =>
                    handleColumnMappingChange(key, e.target.value)
                  }
                  defaultValue=""
                >
                  <option value="">-- Select New CRM Column --</option>
                  {contactFields.map((field) => (
                    <option key={field} value={field}>
                      {field}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          ))}

          <button onClick={handleAddNewField} style={{ marginRight: "10px" }}>
            Add New Field
          </button>

          <button onClick={handleProcessData} style={{ marginRight: "10px" }}>
            Process Data
          </button>
        </>
      )}

      {processedData && (
        <button onClick={handleFileDownload}>Download Processed File</button>
      )}
    </div>
  );
};

export default NewDashboard;