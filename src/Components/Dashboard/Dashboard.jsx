import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import { Spinner, Modal, Button, Form, Row, Col } from "react-bootstrap";
import { ChevronsRight, CircleX } from "lucide-react";
import FileUpload from "../FileUpload/FileUpload";
import FileImg from "../../assets/Images/UploadedSheet.png";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import FieldMapping from "../FieldMapping/FieldMapping";
import { Plus, ArrowRight } from 'lucide-react';
import CRMSelectionStep from "../CRMSelectionStep/CRMSelectionStep";
import EnhancedFieldMapping from "../EnhancedFieldMapping/EnhancedFieldMapping";
const msFields = [];
const CRMCard = ({ title, onSelect, selected }) => {
  return (
    <div 
      className={`w-64 h-40 p-4 rounded-lg border-2 cursor-pointer transition-all
        ${selected ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-blue-400'}`}
      onClick={onSelect}
    >
      <div className="h-full flex flex-col justify-between">
        <div className="text-lg font-medium text-gray-700">{title}</div>
        {selected && (
          <div className="text-sm text-blue-600">Selected</div>
        )}
      </div>
    </div>
  );
};
const salesforceFields = [];
const fieldMappings = {
  microsoft_to_salesforce: {
    ContactId: "Id",
    FirstName: "FirstName",
    LastName: "LastName",
    EmailAddress1: "Email",
    Telephone1: "Phone",
    MobilePhone: "MobilePhone",
    Address1_Line1: "MailingStreet",
    Address1_City: "MailingCity",
    Address1_StateOrProvince: "MailingState",
    Address1_PostalCode: "MailingPostalCode",
    Address1_Country: "MailingCountry",
    JobTitle: "Title",
    ParentCustomerId: "AccountId",
    Department: "Department",
    CreatedOn: "CreatedDate",
    ModifiedOn: "LastModifiedDate",
    OwnerId: "OwnerId",
    LeadSource: "LeadSource",
    BirthDate: "Birthdate",
  },
  salesforce_to_microsoft: {
    Id: "ContactId",
    FirstName: "FirstName",
    LastName: "LastName",
    Email: "EmailAddress1",
    Phone: "Telephone1",
    MobilePhone: "MobilePhone",
    MailingStreet: "Address1_Line1",
    MailingCity: "Address1_City",
    MailingState: "Address1_StateOrProvince",
    MailingPostalCode: "Address1_PostalCode",
    MailingCountry: "Address1_Country",
    Title: "JobTitle",
    AccountId: "ParentCustomerId",
    Department: "Department",
    CreatedDate: "CreatedOn",
    LastModifiedDate: "ModifiedOn",
    OwnerId: "OwnerId",
    LeadSource: "LeadSource",
    Birthdate: "BirthDate",
  },
};

export default function Dashboard() {
  const [showMigrationModal, setShowMigrationModal] = useState(false);
  const [fileData, setFileData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [migrationData, setMigrationData] = useState([]);
  const [migrationHeaders, setMigrationHeaders] = useState([]);
  const [fileType, setFileType] = useState("");
  const [headerMapping, setHeaderMapping] = useState({});
  const [updatedMigrationData, setUpdatedMigrationData] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [uploadedFileName, setUploadedFileName] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [unmatchedColumns, setUnmatchedColumns] = useState([]);
  const [newFields, setNewFields] = useState({});
  const [currentCRMFileName, setCurrentCRMFileName] = useState("");
  const [newCRMFileName, setNewCRMFileName] = useState("");
  const [currentStep, setCurrentStep] = useState(0);
  const [isContactSelected, setIsContactSelected] = useState(false);
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [mergeFields, setMergeFields] = useState({});
  const [newMergeFieldName, setNewMergeFieldName] = useState("");
  const [selectedMigrationField, setSelectedMigrationField] = useState("");
  const [fieldsToMerge, setFieldsToMerge] = useState({});
  const [mergedFieldsList, setMergedFieldsList] = useState([]);
  const [tempNewField, setTempNewField] = useState("");
  const [selectedCRM, setSelectedCRM] = useState("microsoft");
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("");
  const [mappedFields, setMappedFields] = useState({});
  const [mergeFieldType, setMergeFieldType] = useState("");
  const [mergeSeparator, setMergeSeparator] = useState(" ");
  const [showCRMModal, setShowCRMModal] = useState(false);
  const [modalType, setModalType] = useState(''); // 'source' or 'target'
  const [sourceCRM, setSourceCRM] = useState('');
  const [targetCRM, setTargetCRM] = useState('');
  const [isMergeField,setIsMergeField] = useState(false)
  const crmFields = {
    MicrosoftDynamics365: [
      "ContactId",
      "FirstName",
      "LastName",
      "EmailAddress1",
      "Telephone1",
      "MobilePhone",
      "Address1_Line1",
      "Address1_City",
      "Address1_StateOrProvince",
      "Address1_PostalCode",
      "Address1_Country",
      "JobTitle",
      "ParentCustomerId",
      "Department",
      "CreatedOn",
      "ModifiedOn",
      "OwnerId",
      "LeadSource",
      "BirthDate",
      "Notes",
    ],
    Salesforce: [
      "Id",
      "FirstName",
      "LastName",
      "Email",
      "Phone",
      "MobilePhone",
      "MailingStreet",
      "MailingCity",
      "MailingState",
      "MailingPostalCode",
      "MailingCountry",
      "Title",
      "AccountId",
      "Department",
      "CreatedDate",
      "LastModifiedDate",
      "OwnerId",
      "LeadSource",
      "Birthdate",
      "Notes",
    ],
  };
  const findClosestMatch = (sourceField, targetFields) => {
    const normalizedSource = sourceField
      .toLowerCase()
      .replace(/[^a-z0-9]/g, "");
    return targetFields.find((field) => {
      const normalizedTarget = field.toLowerCase().replace(/[^a-z0-9]/g, "");
      return normalizedSource === normalizedTarget;
    });
  };
  const autoMapFields = (sourceHeaders, targetCRM) => {
    // The enhanced mapping is now handled by the EnhancedFieldMapping component
    // This function can be simplified to just set up initial state if needed
    const mappingKey = targetCRM === "salesforce" 
      ? "microsoft_to_salesforce" 
      : "salesforce_to_microsoft";
    
    const mappings = fieldMappings[mappingKey];
    const initialMapping = {};
  
    sourceHeaders.forEach((header) => {
      // Try exact match first
      if (mappings[header]) {
        initialMapping[header] = mappings[header];
      }
    });
  
    setHeaderMapping(initialMapping);
  };
  const handleFileUpload = async (file) => {
    try {
      const extension = file.name.split(".").pop().toLowerCase();
      let data = [];
  
      if (extension === "csv") {
        const text = await file.text();
        const result = Papa.parse(text, { header: true });
        data = result.data;
      } else if (["xlsx", "xls"].includes(extension)) {
        const buffer = await file.arrayBuffer();
        const workbook = XLSX.read(buffer);
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        data = XLSX.utils.sheet_to_json(worksheet);
      }
  
      if (data.length > 0) {
        const newHeaders = Object.keys(data[0]);
        setHeaders(newHeaders);
        setFileData(data);
        
        if (selectedCRM) {
          autoMapFields(newHeaders, selectedCRM);
        }
      }
    } catch (error) {
      console.error("Error processing file:", error);
      toast.error("Error processing file. Please check the format.");
    }
  };

  // Function to set initial mapping in your component
  const setInitialFieldMapping = (sourceCRM, targetCRM, headers) => {
    try {
      // Convert CRM names to match the mapping dictionary
      const sourceSystem =
        sourceCRM === "microsoft" ? "MicrosoftDynamics365" : "Salesforce";
      const targetSystem =
        sourceCRM === "microsoft" ? "Salesforce" : "MicrosoftDynamics365";

      // Get mapped fields
      const mappedFields = autoMapFields(sourceSystem, targetSystem, headers);
      return mappedFields;
    } catch (error) {
      console.error("Error in field mapping:", error);
      // Return empty mapping in case of error
      return {};
    }
  };

  const handleAddNewField = () => {
    if (!tempNewField.trim() || !mergeFieldType) {
      toast.error("Please provide both field name and type");
      return;
    }

    // Add the new field to migration headers
    setMigrationHeaders((prev) => [...prev, tempNewField]);

    // Add field type to newFields state
    setNewFields((prev) => ({
      ...prev,
      [tempNewField]: {
        fieldType: mergeFieldType,
      },
    }));

    // Reset form
    setTempNewField("");
    setMergeFieldType("");

    toast.success("New field added successfully!");
  };

  const contactNativeFields = [
    "First Name",
    "Last Name",
    "Salutation",
    "Email",
    "Phone",
    "Mobile Phone",
    "Fax",
    "Other Phone",
    "Mailing Street",
    "Mailing City",
    "Mailing State",
    "Mailing Postal Code",
    "Mailing Country",
    "Other Street",
    "Other City",
    "Other State",
    "Other Postal Code",
    "Other Country",
    "Account",
    "Department",
    "Title",
    "Birthdate",
    "Description",
    "Do Not Call",
    "Opted Out of Email",
    "Opted Out of Fax",
    "Lead Source",
    "Reports To",
    "Owner",
  ];

  const handleCurrentCRMFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setCurrentCRMFileName(file.name);
      handleFileChange(event);
    }
  };

  const handleNewCRMFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setNewCRMFileName(file.name);
      handleFileChange(event, true);
    }
  };

  const handleFileChange = (event, isMigrationFile = false) => {
    const file = event.target.files[0];
    if (!file) return;

    setUploadedFileName(file.name);
    const fileExtension = file.name.split(".").pop().toLowerCase();
    setFileType(fileExtension);

    if (fileExtension === "csv") {
      if (isMigrationFile) {
        parseCSVMigration(file);
      } else {
        parseCSV(file);
        // After parsing, this will trigger the useEffect to handle mapping
      }
    } else if (["xls", "xlsx"].includes(fileExtension)) {
      if (isMigrationFile) {
        parseExcelMigration(file);
      } else {
        parseExcel(file);
        // After parsing, this will trigger the useEffect to handle mapping
      }
    } else {
      alert("Please upload a CSV or Excel file.");
    }
  };

  const parseCSV = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        if (result.data && result.data.length > 0) {
          setFileData(result.data);
          setHeaders(Object.keys(result.data[0] || {}));
        }
      },
      header: true,
    });
  };

  const parseExcel = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        if (jsonData && jsonData.length > 0) {
          setFileData(jsonData);
          setHeaders(Object.keys(jsonData[0] || {}));
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Error parsing Excel file. Please check the file format.");
      }
    };
    reader.readAsBinaryString(file);
  };

  const parseCSVMigration = (file) => {
    Papa.parse(file, {
      complete: (result) => {
        if (result.data && result.data.length > 0) {
          setMigrationData(result.data);
          setMigrationHeaders(Object.keys(result.data[0] || {}));
        }
      },
      header: true,
    });
  };

  const parseExcelMigration = (file) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const binaryStr = e.target.result;
        const workbook = XLSX.read(binaryStr, { type: "binary" });
        const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(firstSheet);
        if (jsonData && jsonData.length > 0) {
          setMigrationData(jsonData);
          setMigrationHeaders(Object.keys(jsonData[0] || {}));
        }
      } catch (error) {
        console.error("Error parsing Excel file:", error);
        alert("Error parsing Excel file. Please check the file format.");
      }
    };
    reader.readAsBinaryString(file);
  };
  useEffect(() => {
    // Update selectedCRM based on target CRM selection
    if (targetCRM) {
      setSelectedCRM(targetCRM);
    }
  }, [targetCRM]);
  useEffect(() => {
    if (headers.length > 0) {
      // Determine which mapping to use based on selected CRM
      const mappingKey =
        selectedCRM === "microsoft"
          ? "microsoft_to_salesforce"
          : "salesforce_to_microsoft";

      // Create initial mapping object
      const initialMapping = {};

      headers.forEach((header) => {
        // Check if there's a corresponding field in the mapping
        if (fieldMappings[mappingKey][header]) {
          initialMapping[header] = fieldMappings[mappingKey][header];
        } else {
          // If no mapping exists, keep the same field name
          initialMapping[header] = header;
        }
      });

      // Update the header mapping state
      setHeaderMapping(initialMapping);

      // Set migration headers based on selected CRM
      const targetFields =
        selectedCRM === "microsoft"
          ? crmFields.Salesforce
          : crmFields.MicrosoftDynamics365;
      setMigrationHeaders(targetFields);
    }
  }, [headers, selectedCRM]);

  // Update the CRM selection handler to trigger re-mapping
  const handleCRMChange = (e) => {
    const newCRM = e.target.value;
    setSelectedCRM(newCRM);

    // Reset current mappings
    setHeaderMapping({});
    setMigrationHeaders([]);

    // Set new migration headers based on selected CRM
    const targetFields =
      newCRM === "microsoft"
        ? crmFields.MicrosoftDynamics365
        : crmFields.Salesforce;

    setMigrationHeaders(targetFields);
  };

  const handleCreateNewFields = () => {
    if (!newFieldName.trim() || !newFieldType) {
      return;
    }

    // Add the new field to migration headers
    setMigrationHeaders((prev) => [...prev, newFieldName]);

    // Reset the form
    setNewFieldName("");
    setNewFieldType("");
    setShowModal(false);

    // Show success toast
    toast.success("New field added successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
    });
  };

  const getAvailableFieldNames = () => {
    const targetFields =
      selectedCRM === "microsoft"
        ? crmFields.MicrosoftDynamics365
        : crmFields.Salesforce;

    // Include custom fields if any
    const customFields = Object.values(newFields)
      .map((field) => field.migrationField)
      .filter(Boolean);

    return [...new Set([...targetFields, ...customFields])];
  };

  const handleMappingChange = (firstFileHeader, migrationHeader) => {
    setHeaderMapping((prevMapping) => ({
      ...prevMapping,
      [firstFileHeader]: migrationHeader,
    }));
  };

  const isFieldMapped = (migrationHeader, currentHeader) => {
    return Object.entries(headerMapping).some(
      ([header, mapped]) =>
        mapped === migrationHeader && header !== currentHeader
    );
  };

  const getAutoSelectedValue = (firstFileHeader) => {
    const mappingKey =
      selectedCRM === "microsoft"
        ? "microsoft_to_salesforce"
        : "salesforce_to_microsoft";

    // First check if we have a mapping for this field
    if (headerMapping[firstFileHeader]) {
      return headerMapping[firstFileHeader];
    }

    // Then check if there's a corresponding field in the mapping dictionary
    if (fieldMappings[mappingKey][firstFileHeader]) {
      return fieldMappings[mappingKey][firstFileHeader];
    }

    // If no mapping is found, return empty string
    return "";
  };

  const handleFieldNameChange = (colName, e) => {
    const value = e.target.value;
    setNewFields((prevState) => ({
      ...prevState,
      [colName]: {
        ...prevState[colName],
        migrationField: value,
      },
    }));
  };

  const handleFieldTypeChange = (colName, e) => {
    const value = e.target.value;
    setNewFields((prevState) => ({
      ...prevState,
      [colName]: {
        ...prevState[colName],
        fieldType: value,
        migrationField: prevState[colName]?.migrationField || "",
      },
    }));
  };
  const detectDataType = (value) => {
    if (value === null || value === undefined || value === "") {
      return "@";
    }

    // Check if it's a boolean
    if (typeof value === "boolean" || value === "true" || value === "false") {
      return "true/false";
    }

    // Check if it's a number
    if (!isNaN(value) && typeof value !== "boolean") {
      return "0";
    }

    // Check if it's a date
    const dateValue = new Date(value);
    if (
      dateValue instanceof Date &&
      !isNaN(dateValue) &&
      typeof value === "string" &&
      value.match(/^\d{4}-\d{2}-\d{2}|^\d{2}\/\d{2}\/\d{4}/)
    ) {
      return "d/m/yyyy";
    }

    // Default to string
    return "@";
  };

  // Improved value conversion
  const convertValue = (value, targetType, sourceType) => {
    // Handle null/undefined values
    if (value === null || value === undefined || value === "") {
      return null;
    }

    // If source and target types match, return the original value
    if (sourceType === targetType) {
      return value;
    }

    try {
      switch (targetType) {
        case "0": // Number
          const numValue = Number(value);
          return !isNaN(numValue) ? numValue : null;

        case "d/m/yyyy": // Date
          const dateValue = new Date(value);
          return !isNaN(dateValue)
            ? dateValue.toISOString().split("T")[0]
            : null;

        case "true/false": // Boolean
          if (typeof value === "boolean") return value;
          if (typeof value === "string") {
            return value.toLowerCase() === "true" || value === "1";
          }
          return Boolean(value);

        case "$": // Currency
          const currValue = Number(value);
          return !isNaN(currValue) ? currValue.toFixed(2) : null;

        case "%": // Percentage
          const percentValue = Number(value);
          return !isNaN(percentValue) ? (percentValue / 100).toFixed(4) : null;

        default: // String or unknown type
          return String(value);
      }
    } catch (error) {
      console.error(
        `Error converting value: ${value} to type: ${targetType}`,
        error
      );
      return null;
    }
  };
  const handleDataMigration = () => {
    setShowMigrationModal(true);
    setIsProcessing(true);

    setTimeout(() => {
      try {
        if (!fileData || !fileData.length) {
          throw new Error("Source data is missing");
        }

        // Create a template object with all possible target fields initialized to null
        const templateObject = {};
        migrationHeaders.forEach((header) => {
          templateObject[header] = null;
        });

        // Process the data with proper error handling
        const updatedData = fileData.map((sourceRow, index) => {
          // Start with a fresh template for each row
          const updatedRow = { ...templateObject };

          // Handle merged fields first
          mergedFieldsList.forEach((mergedField) => {
            try {
              const mergedValue = mergedField.sourceFields
                .map((field) => sourceRow[field])
                .filter(Boolean)
                .join(mergedField.separator || " ");

              updatedRow[mergedField.targetField] = convertValue(
                mergedValue,
                mergedField.fieldType || "@",
                "string"
              );
            } catch (error) {
              console.error(
                `Error processing merged field: ${mergedField.targetField}`,
                error
              );
              updatedRow[mergedField.targetField] = null;
            }
          });

          // Handle regular field mappings
          Object.entries(headerMapping).forEach(
            ([sourceHeader, targetHeader]) => {
              // Skip if this field is part of a merge
              const isPartOfMerge = mergedFieldsList.some((mergedField) =>
                mergedField.sourceFields.includes(sourceHeader)
              );

              if (
                !isPartOfMerge &&
                targetHeader &&
                sourceRow.hasOwnProperty(sourceHeader)
              ) {
                try {
                  const sourceValue = sourceRow[sourceHeader];
                  const sourceType = detectDataType(sourceValue);
                  const targetType =
                    newFields[targetHeader]?.fieldType || sourceType;

                  updatedRow[targetHeader] = convertValue(
                    sourceValue,
                    targetType,
                    sourceType
                  );
                } catch (error) {
                  console.error(
                    `Error processing field: ${sourceHeader} -> ${targetHeader}`,
                    error
                  );
                  updatedRow[targetHeader] = null;
                }
              }
            }
          );

          return updatedRow;
        });

        setUpdatedMigrationData(updatedData);

        setTimeout(() => {
          setShowMigrationModal(false);
          setIsProcessing(false);
          toast.success("🎉 Data Migration Successful!");
        }, 2000);
      } catch (error) {
        console.error("Error during migration:", error);
        setShowMigrationModal(false);
        setIsProcessing(false);
        toast.error(`Migration Error: ${error.message}`);
      }
    }, 100);
  };
  const downloadUpdatedFile = () => {
    try {
      // Get all potential headers
      const allHeaders = new Set([
        ...migrationHeaders,
        ...Object.values(headerMapping),
        ...mergedFieldsList.map((field) => field.targetField),
      ]);

      // Process the data to ensure proper types
      const processedData = updatedMigrationData.map((row) => {
        const processedRow = {};
        for (const header of allHeaders) {
          const value = row[header];
          const fieldType = newFields[header]?.fieldType;

          // Ensure proper types in Excel
          switch (fieldType) {
            case "0":
            case "$":
            case "%":
              // Ensure numbers are stored as numbers
              processedRow[header] =
                typeof value === "string" ? Number(value) : value;
              break;
            case "d/m/yyyy":
              // Convert dates to Excel dates if they're valid
              if (value && !isNaN(new Date(value).getTime())) {
                processedRow[header] = new Date(value);
              } else {
                processedRow[header] = value;
              }
              break;
            default:
              processedRow[header] = value;
          }
        }
        return processedRow;
      });

      // Create worksheet with all headers
      const worksheet = XLSX.utils.json_to_sheet(processedData, {
        header: Array.from(allHeaders),
      });

      // Set column types for numeric fields
      const range = XLSX.utils.decode_range(worksheet["!ref"]);
      const headerRow = processedData[0] || {};

      for (let C = range.s.c; C <= range.e.c; C++) {
        const header = Array.from(allHeaders)[C];
        const fieldType = newFields[header]?.fieldType;

        if (fieldType === "0" || fieldType === "$" || fieldType === "%") {
          // Set number format for numeric columns
          for (let R = range.s.r + 1; R <= range.e.r; R++) {
            const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
            if (!worksheet[cellRef]) continue;

            worksheet[cellRef].t = "n"; // Set cell type to number
            if (fieldType === "$") {
              worksheet[cellRef].z = '"$"#,##0.00'; // Currency format
            } else if (fieldType === "%") {
              worksheet[cellRef].z = '0.00"%"'; // Percentage format
            } else {
              worksheet[cellRef].z = "#,##0.00"; // Regular number format
            }
          }
        }
      }

      // Adjust column widths
      const columnWidths = Array.from(allHeaders).map((header) => ({
        wch: Math.max(header.length, 15),
      }));
      worksheet["!cols"] = columnWidths;

      // Create workbook and append worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Updated Data");

      // Download file
      XLSX.writeFile(workbook, "UpdatedMigrationFile.xlsx");
    } catch (error) {
      console.error("Error downloading file:", error);
      alert("Error downloading the file. Please try again.");
    }
  };

  const steps = ["Select CRM","Upload", "Select Objects ", "Field Mapping", "Finish"];

  const handleModulBox = () => {
    setIsContactSelected((prevState) => !prevState);
  };

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setCurrentStep(0);
    setFileData([]);
    setHeaders([]);
    setMigrationData([]);
    setMigrationHeaders([]);
    setHeaderMapping({});
    setUnmatchedColumns([]);
    setNewFields({});
    setUpdatedMigrationData([]);
    setCurrentCRMFileName("");
    setNewCRMFileName("");
  };
  const handleCheckboxChange = (colName, isChecked) => {
    setNewFields((prevState) => ({
      ...prevState,
      [colName]: {
        ...prevState[colName],
        isChecked, // Track whether the field is checked
      },
    }));
  };
  const handleMergeFieldsModal = () => {
    setShowMergeModal(true);
    setFieldsToMerge({});
    setSelectedMigrationField("");
    setTempNewField("");
  };
  const handleFieldMergeCheckbox = (colName, isChecked) => {
    setFieldsToMerge((prev) => ({
      ...prev,
      [colName]: {
        ...prev[colName],
        isChecked,
      },
    }));
  };
  const handleMergeFieldsSubmit = () => {
    const selectedFields = Object.entries(fieldsToMerge)
      .filter(([_, value]) => value.isChecked)
      .map(([key]) => key);

    if (selectedFields.length === 0) {
      toast.error("Please select fields to merge");
      return;
    }

    if (!selectedMigrationField) {
      toast.error("Please select a target field");
      return;
    }

    // Create merged field entry
    const newMergedField = {
      id: Date.now(),
      targetField: selectedMigrationField,
      sourceFields: selectedFields,
      separator: mergeSeparator,
      fieldType: mergeFieldType || "@", // Default to text type if not specified
    };

    // Update merged fields list
    setMergedFieldsList((prev) => [...prev, newMergedField]);

    // Update header mapping for merged fields
    const updatedMapping = { ...headerMapping };
    selectedFields.forEach((field) => {
      updatedMapping[field] = selectedMigrationField;
    });

    setHeaderMapping(updatedMapping);
    setShowMergeModal(false);
    setSelectedMigrationField("");
    setFieldsToMerge({});
    setMergeSeparator(" "); // Reset to default
    setMergeFieldType(""); // Reset field type

    toast.success("Fields merged successfully!");
  };

  const handleRemoveMergedField = (id) => {
    setMergedFieldsList((prev) => prev.filter((field) => field.id !== id));
    // Reset mappings for removed merged field
    const mergedField = mergedFieldsList.find((field) => field.id === id);
    if (mergedField) {
      const updatedMapping = { ...headerMapping };
      mergedField.sourceFields.forEach((field) => {
        delete updatedMapping[field];
      });
      setHeaderMapping(updatedMapping);
    }
  };
  const handleClearCurrentCRM = () => {
    setCurrentCRMFileName("");
    setFileData([]);
    setHeaders([]);
    const currentFileInput = document.querySelector('input[name="currentCRM"]');
    if (currentFileInput) {
      currentFileInput.value = "";
    }
  };

  const handleClearNewCRM = () => {
    setNewCRMFileName("");
    setMigrationData([]);
    setMigrationHeaders([]);
    const newFileInput = document.querySelector('input[name="newCRM"]');
    if (newFileInput) {
      newFileInput.value = "";
    }
  };
  
  
    const crmOptions = [
      { id: 'microsoft', name: 'Microsoft Dynamics 365' },
      { id: 'salesforce', name: 'Salesforce' },
      { id: 'other', name: 'Other CRM' }
    ];
  
    const handleCRMSelect = (crmId) => {
      if (modalType === 'source') {
        setSourceCRM(crmId);
      } else {
        setTargetCRM(crmId);
        setSelectedCRM(crmId);
        
        // Reset and update mappings when target CRM changes
        if (headers.length > 0) {
          autoMapFields(headers, crmId);
        }
        
        // Set new migration headers based on selected CRM
        const targetFields = crmId === "microsoft" 
          ? crmFields.MicrosoftDynamics365 
          : crmFields.Salesforce;
        setMigrationHeaders(targetFields);
      }
      setShowCRMModal(false);
    };
  
    const openCRMModal = (type) => {
      setModalType(type);
      setShowCRMModal(true);
    };
  const stepContent = [
    // Step 1: Upload
    <div className="w-full space-y-8">
    <h2 className="text-2xl font-semibold text-[#292C89]">Select CRM Systems</h2>
    
    <div className="flex items-center justify-center space-x-6">
      {/* Source CRM Selection */}
      <div className="relative">
        {sourceCRM ? (
          <CRMCard 
            title={crmOptions.find(crm => crm.id === sourceCRM)?.name} 
            selected={true}
            onSelect={() => openCRMModal('source')}
          />
        ) : (
          <button
            onClick={() => openCRMModal('source')}
            className="w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg 
                     flex flex-col items-center justify-center space-y-2
                     hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <Plus className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">Select Source CRM</span>
          </button>
        )}
      </div>

      <ArrowRight className="w-8 h-8 text-gray-400" />

      {/* Target CRM Selection */}
      <div className="relative">
        {targetCRM ? (
          <CRMCard 
            title={crmOptions.find(crm => crm.id === targetCRM)?.name}
            selected={true}
            onSelect={() => openCRMModal('target')}
          />
        ) : (
          <button
            onClick={() => openCRMModal('target')}
            className="w-64 h-40 border-2 border-dashed border-gray-300 rounded-lg 
                     flex flex-col items-center justify-center space-y-2
                     hover:border-blue-400 hover:bg-blue-50 transition-all"
          >
            <Plus className="w-8 h-8 text-gray-400" />
            <span className="text-sm text-gray-600">Select Target CRM</span>
          </button>
        )}
      </div>
    </div>

    {/* CRM Selection Modal using React Bootstrap */}
    <Modal show={showCRMModal} onHide={() => setShowCRMModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          Select {modalType === 'source' ? 'Source' : 'Target'} CRM
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="space-y-3">
          {crmOptions.map((crm) => (
            <button
              key={crm.id}
              className="w-full p-3 text-left rounded-lg border border-gray-200 
                       hover:border-blue-400 hover:bg-blue-50 transition-all"
              onClick={() => handleCRMSelect(crm.id)}
            >
              {crm.name}
            </button>
          ))}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={() => setShowCRMModal(false)}>
          Cancel
        </Button>
      </Modal.Footer>
    </Modal>

    {/* Next Button */}
    <div className="flex justify-end">
   
    <button
  className={`px-4 py-2 text-sm font-medium text-white lgBG rounded ${
    !sourceCRM || !targetCRM ? "cursor-not-allowed opacity-50" : ""
  }`}
  onClick={handleNext}
  disabled={!sourceCRM || !targetCRM}
>
  Next
</button>
    </div>
  </div>,
    <>
     
      <div className="d-flex justify-between flex-col">
      <div className="container mt-4">
  <div className="d-flex gap-[30px] items-start justify-between mb-4">
    <div
      className="card w-100 bg-white"
      style={{ boxShadow: "5.4px 5.4px 48.6px 0px #0000000D" }}
    >
      <div className="card-body">
        <div className="mb-4">
          <h5 className="mb-4 text-center">
            {crmOptions.find(crm => crm.id === sourceCRM)?.name} Data
            (CSV or Excel)
          </h5>
          <div className="d-flex gap-3 justify-center items-end">
            <FileUpload
              onChange={handleCurrentCRMFileChange}
              uploadedFileName={currentCRMFileName}
            />
            {currentCRMFileName && (
              <button
                onClick={handleClearCurrentCRM}
                className="p-1 rounded-full hover:bg-gray-100 relative top-[6px]"
              >
                <CircleX />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>

    <div className="card w-100 bg-white">
      <div className="card-body">
        <div className="mb-4">
          <h5 className="mb-4 text-center">
            {crmOptions.find(crm => crm.id === targetCRM)?.name} Data
            (CSV or Excel)
          </h5>
          <div className="d-flex gap-3 justify-center items-end">
            <FileUpload
              onChange={handleNewCRMFileChange}
              uploadedFileName={newCRMFileName}
            />
            {newCRMFileName && (
              <button
                onClick={handleClearNewCRM}
                className="p-1 rounded-full hover:bg-gray-100 relative top-[6px]"
              >
                <CircleX />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  </div>
</div>
        <div className="mt-6 flex justify-between w-100">
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium text-white lgBG rounded ${
              currentCRMFileName === "" ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={handleNext}
            disabled={currentCRMFileName === ""}
          >
            Next
          </button>
        </div>
      </div>
    </>,

    // Step 2: Module - File Mapping
    <>
      <div className="d-flex justify-between h-100 flex-col">
        <div
          className="d-flex flex-wrap gap-4 justify-start overflow-x-auto h-[335px] card w-100 bg-white"
          style={{ boxShadow: "5.4px 5.4px 48.6px 0px #0000000D" }}
        >
          <div className="card-body">
            <div className="flex items-center justify-start">
              <div
                className={`w-48 h-48 bg-white rounded-lg shadow-md flex flex-col items-center justify-center space-y-3 ${
                  isContactSelected && "border-2 border-green-500"
                }`}
                onClick={() => handleModulBox()}
              >
                <div className="p-4 bg-blue-100 rounded-full">
                  <svg
                    className="w-8 h-8 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <span className="text-base font-medium text-gray-700">
                  Contact
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-between">
          <button
            className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            Previous
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium text-white lgBG rounded ${
              isContactSelected === false ? "cursor-not-allowed opacity-50" : ""
            }`}
            onClick={handleNext}
            disabled={isContactSelected === false || !selectedCRM}
          >
            Next
          </button>
        </div>
      </div>
    </>,
    // Step 3: Field Mapping
    <>
      {migrationHeaders.length > 0 && (
        <div className="w-100 d-flex flex-col justify-between items-center h-100">
          <div className="w-100">
            <div className="w-100 d-flex justify-between items-center mb-3 bg-white border border-[#292C89] p-4 rounded-lg flex items-center">
              <h4 className="text-[18px] text-[#292C89]">Field Mapping</h4>
              <div className="d-flex justify-center items-center gap-4">
                {/* {unmatchedColumns.length > 0 && ( */}
                <div>
                  <button
                    className=" border-[#292C89] text-[18px] text-[#292C89] ring-[#292C89] ring-2 flex items-center space-x-3 no-underline rounded-xl p-1 border"
                    onClick={() => setShowModal(true)}
                  >
                    Create New Fields
                  </button>
                </div>
                {/* )} */}
              </div>
            </div>
            <div className="w-100 d-flex justify-between items-center mb-3">
              <div className="w-100 d-flex justify-start">
                <h3 className="text-[#292C89] text-[18px]">Source CRM ({crmOptions.find(crm => crm.id === sourceCRM)?.name})</h3>
              </div>
              <div className="w-100 d-flex justify-start">
                <h3 className="text-[#292C89] text-[18px]">
                  {selectedCRM === "microsoft"
                    ? "Target CRM (Microsoft Dynamics CRM)"
                    : "Target CRM (SalesForce CRM)"}
                </h3>
              </div>
            </div>
            {headers.map((firstFileHeader, index) => (
              // <div key={index} className="mb-3 d-flex items-center gap-[30px] w-100">
              //   <span className="d-flex justify-between items-center w-100">
              //     <label className="text-[16px]">{firstFileHeader}</label>
              //     <ChevronsRight />
              //   </span>
              //   <select
              //     onChange={(e) => handleMappingChange(firstFileHeader, e.target.value)}
              //     value={getAutoSelectedValue(firstFileHeader)}
              //     className="form-select mapCol w-100"
              //     disabled={mergedFieldsList.some(
              //       merge => merge.sourceFields.includes(firstFileHeader)
              //     )}
              //   >
              //     <option value="">Select Migration Column</option>
              //     {migrationHeaders.map((migrationHeader, idx) => {
              //       const isSelected = headerMapping[firstFileHeader] === migrationHeader;
              //       const isUsed = Object.values(headerMapping).includes(migrationHeader);
              //       const isPartOfMerge = mergedFieldsList.some(
              //         merge => merge.targetField === migrationHeader
              //       );
              //       return (
              //         <option
              //           key={idx}
              //           value={migrationHeader}
              //           disabled={(!isSelected && isUsed) || isPartOfMerge}
              //         >
              //           {migrationHeader}
              //         </option>
              //       );
              //     })}
              //   </select>
              // </div>
            //   <FieldMapping
            //   key={index}
            //   firstFileHeader={firstFileHeader}
            //   selectedCRM={selectedCRM}
            //   headerMapping={headerMapping}
            //   onMappingChange={handleMappingChange}
            //   mergedFieldsList={mergedFieldsList}
            //   migrationHeaders={migrationHeaders}
            //   nativeFields={selectedCRM === 'microsoft' ? crmFields.Salesforce : crmFields.MicrosoftDynamics365}
            //   uploadedHeaders={headers} // Add this to pass uploaded headers
            // />
          <EnhancedFieldMapping
    key={index}
    firstFileHeader={firstFileHeader}
    selectedCRM={selectedCRM}
    headerMapping={headerMapping}
    onMappingChange={handleMappingChange}
    mergedFieldsList={mergedFieldsList}
    migrationHeaders={migrationHeaders}
    nativeFields={selectedCRM === 'microsoft' ? crmFields.Salesforce : crmFields.MicrosoftDynamics365}
  />
            ))}
            {mergedFieldsList.length > 0 && (
              <div className="mb-4">
                <h5 className="mb-3">Merged Fields</h5>
                {mergedFieldsList.map((mergedField) => (
                  <div
                    key={mergedField.id}
                    className="bg-gray-100 p-3 rounded mb-2 d-flex justify-between align-items-center"
                  >
                    <div>
                      <span className="text-gray-600">
                        {mergedField.sourceFields.join(" + ")}
                      </span>
                      <span className="mx-2">→</span>
                      <strong className="text-primary">
                        {mergedField.targetField}
                      </strong>
                    </div>
                    <div className="d-flex gap-2">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleRemoveMergedField(mergedField.id)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-between mb-6 w-100">
            <button
              className="px-4 py-2 text-sm font-medium text-white bg-gray-500 rounded hover:bg-gray-600"
              onClick={handlePrev}
            >
              Previous
            </button>
            <div className="d-flex gap-3">
              <button
                id="liveToastBtn"
                className="bg-[#292C89] text-white text-[16px] flex items-center space-x-3 no-underline rounded-lg p-2 border"
                onClick={handleDataMigration}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <Spinner animation="border" size="sm" />
                ) : (
                  "Migrate Data"
                )}
              </button>
              <button
                className={`px-4 py-2 text-sm font-medium text-white lgBG rounded ${
                  !updatedMigrationData.length
                    ? "cursor-not-allowed opacity-50"
                    : ""
                }`}
                onClick={handleNext}
                disabled={!updatedMigrationData.length}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        show={showMigrationModal}
        centered
        backdrop="static"
        keyboard={false}
        className="migration-modal"
      >
        <Modal.Body className="text-center p-5">
          <div className="migration-animation">
            <div className="d-flex align-items-center justify-content-center gap-3 mb-4">
              {/* Source File */}
              <div className="source-file p-3 bg-gray-100 rounded-lg">
                <div className="file-icon text-[#292C89]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                </div>
              </div>

              {/* Transfer Animation */}
              <div className="transfer-container">
                <div
                  className="progress"
                  style={{ height: "4px", backgroundColor: "#e9ecef" }}
                >
                  <div
                    className="progress-bar progress-bar-animated"
                    role="progressbar"
                    style={{ width: "100%", backgroundColor: "#292C89" }}
                  ></div>
                </div>
                <div className="transfer-dots">
                  <div className="dot"></div>
                  <div className="dot"></div>
                  <div className="dot"></div>
                </div>
              </div>

              {/* Target File */}
              <div className="target-file p-3 bg-gray-100 rounded-lg">
                <div className="file-icon text-[#292C89]">
                  <svg
                    width="32"
                    height="32"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                    <polyline points="13 2 13 9 20 9"></polyline>
                  </svg>
                </div>
              </div>
            </div>

            <h4 className="text-[#292C89] mb-2">Migrating Data</h4>
            <p className="text-gray-600 text-sm">
              Please wait while we process your data...
            </p>
          </div>
        </Modal.Body>
      </Modal>

      <Modal
        show={showMergeModal}
        onHide={() => setShowMergeModal(false)}
        size="lg"
      >
       
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Create New Field</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="mb-3">
            <Col sm={12}>
              <Form.Group className="mb-3">
                <Form.Label>Field Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter new field name"
                  value={newFieldName}
                  onChange={(e) => setNewFieldName(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col sm={12}>
              <Form.Group>
                <Form.Label>Field Type</Form.Label>
                <Form.Select
                  value={newFieldType}
                  onChange={(e) => setNewFieldType(e.target.value)}
                >
                  <option value="">Select Field Type</option>
                  <option value="@">Text</option>
                  <option value="0">Number</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col>
            <Form.Check
                  type="checkbox"
                  id="merge-fields-checkbox"
                  label="Merge multiple fields"
                  checked={isMergeField}
                  onChange={(e) => setIsMergeField(e.target.checked)}
                  className="mb-3 mt-3"
                />
            </Col>
          </Row>
          {
            isMergeField &&
            <div>
            <Modal.Title>Merge Fields</Modal.Title>
            <Modal.Body>
            <Form>
              {/* Target Field Section */}
              <Form.Group className="mb-4">
                <Form.Label>Target Field</Form.Label>
                <div className="d-flex gap-3 align-items-center mb-3">
                  <Form.Select
                    value={selectedMigrationField}
                    onChange={(e) => setSelectedMigrationField(e.target.value)}
                    className="flex-grow-1"
                  >
                    <option value="">Select Field</option>
                    {[...migrationHeaders, ...contactNativeFields].map(
                      (header, index) => (
                        <option key={index} value={header}>
                          {header}
                        </option>
                      )
                    )}
                  </Form.Select>
                </div>
  
                {/* New Field Creation Section */}
                <div className="border p-3 rounded mb-3">
                  <h6>Create New Target Field</h6>
                  <div className="mb-3">
                    <Form.Control
                      type="text"
                      placeholder="Add new field name"
                      value={tempNewField}
                      onChange={(e) => setTempNewField(e.target.value)}
                    />
                  </div>
                  <div className="d-flex gap-3">
                    <Form.Select
                      value={mergeFieldType}
                      onChange={(e) => setMergeFieldType(e.target.value)}
                      className="flex-grow-1"
                    >
                      <option value="">Select Field Type</option>
                      <option value="@">Text</option>
                      <option value="0">Number</option>
                      <option value="d/m/yyyy">Date</option>
                      <option value="$">Currency</option>
                      <option value="%">Percentage</option>
                    </Form.Select>
                    <Button
                      variant="outline-primary"
                      onClick={handleAddNewField}
                      disabled={!tempNewField.trim() || !mergeFieldType}
                    >
                      Add
                    </Button>
                  </div>
                </div>
  
                {/* Separator Selection */}
                <Form.Group className="mb-3">
                  <Form.Label>Separator</Form.Label>
                  <Form.Select
                    value={mergeSeparator}
                    onChange={(e) => setMergeSeparator(e.target.value)}
                  >
                    <option value=" ">Space</option>
                    <option value=", ">Comma with space</option>
                    <option value="-">Hyphen</option>
                    <option value="_">Underscore</option>
                    <option value=";">Semicolon</option>
                    <option value="|">Vertical Bar</option>
                  </Form.Select>
                </Form.Group>
              </Form.Group>
  
              {/* Fields to Merge Selection */}
              <Form.Group>
                <Form.Label>Select Fields to Merge</Form.Label>
                {headers.map((header, index) => (
                  <div key={index} className="mb-2">
                    <Form.Check
                      type="checkbox"
                      id={`merge-${header}`}
                      label={header}
                      onChange={(e) =>
                        handleFieldMergeCheckbox(header, e.target.checked)
                      }
                      checked={fieldsToMerge[header]?.isChecked || false}
                    />
                  </div>
                ))}
              </Form.Group>
            </Form>
          </Modal.Body>
            </div>
          }
         
        
       
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          {
            isMergeField && 
            <Button variant="primary" onClick={handleMergeFieldsSubmit}>
            Merge Fields
          </Button>
          }
          <Button
            variant="primary"
            onClick={handleCreateNewFields}
            disabled={!newFieldName.trim() || !newFieldType}
          >
            Add Field
          </Button>
        </Modal.Footer>
        
      </Modal>
    </>,

    // Step 4: Finish
    <div className="w-100 h-100">
      {updatedMigrationData.length > 0 && (
        <div className="d-flex flex-col justify-center items-center">
          <h3 className="text-[#292C89] text-[30px]">
            Your Migration Is Complete !
          </h3>
          <p>Check out your migration result.</p>
          <button
            className="btn btn-success mt-3"
            onClick={downloadUpdatedFile}
          >
            Download
          </button>
          <a
            className="mt-4 text-[#198754] text-[16px]"
            href=""
            onClick={() => handleRestart()}
          >
            Restart
          </a>
        </div>
      )}
    </div>,
  ];

  return (
    <>
      <div className="dashHeight">
        <div className="flex-grow-1 d-flex h-100">
          <div className="p-10 w-full d-flex justify-between flex-col h-100">
            <div className="h-100">
            <div className="after:mt-4 after:block after:h-1 after:w-100 after:relative after:rounded-lg after:bg-gray-300">
            <ol className="grid grid-cols-5 text-sm font-medium text-gray-500 pl-0 relative">
                  {steps.map((step, index) => (
                  <li
                  key={index}
                  className={`relative flex
                    ${
                      index === 0
                        ? "justify-start"
                        : index === steps.length - 1
                        ? "justify-end"
                        : "justify-center"
                    }
                     ${
                    currentStep === index
                      ? "text-blue-600"
                      : currentStep > index
                      ? "text-green-600"
                      : ""
                  }`}
                >
                  <span
                    className={`z-[100] absolute -bottom-[1.75rem] rounded-full ${
                      currentStep === index
                        ? "bg-blue-600"
                        : currentStep > index
                        ? "bg-green-600"
                        : "bg-gray-600"
                    } text-white`}
                  >
                    <svg
                      className="size-5"
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                  <span className="block text-center whitespace-nowrap">{step}</span>
                </li>
                  ))}
                </ol>
              </div>
              <div className="mt-6 h-100">
                <div className="p-4 text-lg font-medium h-100">
                  {stepContent[currentStep]}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </>
  );
}
