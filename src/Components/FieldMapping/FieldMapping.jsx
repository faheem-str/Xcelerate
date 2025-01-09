import React, { useState, useEffect } from 'react';
import { ChevronsRight } from 'lucide-react';

const nativeFields = {
  microsoft: [
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
    "BirthDate"
  ],
  salesforce: [
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
    "Job Title",
    "AccountId",
    "Department",
    "CreatedDate",
    "LastModifiedDate", 
    "OwnerId",
    "LeadSource",
    "Birthdate"
  ]
};

// Field mapping between CRMs
const fieldMappings = {
  microsoft_to_salesforce: {
    "ContactId": "Id",
    "FirstName": "FirstName",
    "LastName": "LastName",
    "EmailAddress1": "Email",
    "Telephone1": "Phone",
    "MobilePhone": "MobilePhone",
    "Address1_Line1": "MailingStreet",
    "Address1_City": "MailingCity",
    "Address1_StateOrProvince": "MailingState",
    "Address1_PostalCode": "MailingPostalCode",
    "Address1_Country": "MailingCountry",
    "JobTitle": "Title",
    "Job Title": "JobTitle",
    "ParentCustomerId": "AccountId",
    "Department": "Department",
    "CreatedOn": "CreatedDate",
    "ModifiedOn": "LastModifiedDate",
    "OwnerId": "OwnerId",
    "LeadSource": "LeadSource",
    "BirthDate": "Birthdate",
    // Add normalized versions
    "First Name": "FirstName",
    "Last Name": "LastName",
    "Created On":"CreatedOn"
  },
  salesforce_to_microsoft: {
    "Id": "ContactId",
    "FirstName": "FirstName",
    "LastName": "LastName",
    "Email": "EmailAddress1",
    "Job Title": "JobTitle",
    "Phone": "Telephone1",
    "MobilePhone": "MobilePhone",
    "MailingStreet": "Address1_Line1",
    "MailingCity": "Address1_City",
    "MailingState": "Address1_StateOrProvince",
    "MailingPostalCode": "Address1_PostalCode",
    "MailingCountry": "Address1_Country",
    "Title": "JobTitle",
    "AccountId": "ParentCustomerId",
    "Department": "Department",
    "CreatedDate": "CreatedOn",
    "LastModifiedDate": "ModifiedOn",
    "OwnerId": "OwnerId",
    "LeadSource": "LeadSource",
    "Birthdate": "BirthDate",
    // Add normalized versions
    "First Name": "FirstName",
    "Last Name": "LastName"
  }
};

const FieldMapping = ({ 
  firstFileHeader, 
  selectedCRM,
  headerMapping,
  onMappingChange,
  mergedFieldsList,
  migrationHeaders,
  nativeFields,
  uploadedHeaders
}) => {
  const getAutoSelectedValue = (sourceField) => {
    const mappingKey = selectedCRM === 'microsoft' ? 
      'microsoft_to_salesforce' : 
      'salesforce_to_microsoft';
    
    // Check existing mapping first
    if (headerMapping[sourceField]) {
      return headerMapping[sourceField];
    }
    
    // Check predefined mappings
    const mappings = fieldMappings[mappingKey];
    if (mappings[sourceField]) {
      return mappings[sourceField];
    }
    
    return "";
  };

  const isFieldMerged = mergedFieldsList.some(
    merge => merge.sourceFields.includes(firstFileHeader)
  );

  // Combine and deduplicate fields for dropdown
  const allFields = [...new Set([
    ...migrationHeaders,      // Target CRM native fields
    ...nativeFields,         // Additional native fields
    ...uploadedHeaders       // Uploaded file headers
  ])];

  return (
    <div className="mb-3 d-flex items-center gap-[30px] w-100">
      <span className="d-flex justify-between items-center w-100">
        <label className="text-[16px]">{firstFileHeader}</label>
        <ChevronsRight />
      </span>
      <select
        onChange={(e) => onMappingChange(firstFileHeader, e.target.value)}
        value={getAutoSelectedValue(firstFileHeader)}
        className="form-select mapCol w-100"
        disabled={isFieldMerged}
      >
        <option value="">Select Field</option>
        <optgroup label="Target CRM Fields">
          {migrationHeaders.map((field, idx) => (
            <option key={`native-${idx}`} value={field}>
              {field}
            </option>
          ))}
        </optgroup>
        <optgroup label="Source Fields">
          {uploadedHeaders.map((field, idx) => (
            <option key={`uploaded-${idx}`} value={field}>
              {field}
            </option>
          ))}
        </optgroup>
      </select>
    </div>
  );
};

export default FieldMapping;
