import React, { useEffect } from 'react';
import { ChevronsRight } from 'lucide-react';

const EnhancedFieldMapping = ({ 
  firstFileHeader, 
  selectedCRM,
  headerMapping,
  onMappingChange,
  mergedFieldsList,
  migrationHeaders,
  nativeFields,
  uploadedHeaders
}) => {
  // Extended field mappings to include more variations
  const commonFieldMappings = {
    salesforce_to_microsoft: {
      'Id': 'ContactId',
      'FirstName': 'FirstName',
      'LastName': 'LastName',
      'Email': 'EmailAddress1',
      'Phone': 'Telephone1',
      'MobilePhone': 'MobilePhone',
      'MailingStreet': 'Address1_Line1',
      'MailingCity': 'Address1_City',
      'MailingState': 'Address1_StateOrProvince',
      'MailingPostalCode': 'Address1_PostalCode',
      'MailingCountry': 'Address1_Country',
      'Title': 'JobTitle',
      'AccountId': 'ParentCustomerId',
      'Department': 'Department',
      'CreatedDate': 'CreatedOn',
      'LastModifiedDate': 'ModifiedOn',
      'OwnerId': 'OwnerId',
      'LeadSource': 'LeadSource',
      'Birthdate': 'BirthDate',
      'Description': 'Description',
      // Add more Salesforce to Microsoft mappings
      'Account': 'ParentCustomerId',
      'Salutation': 'Salutation',
      'Suffix': 'Suffix',
      'AssistantName': 'AssistantName',
      'AssistantPhone': 'AssistantPhone',
      'Fax': 'Fax',
      'HomePhone': 'HomePhone',
      'OtherPhone': 'OtherPhone',
      'OtherStreet': 'Address2_Line1',
      'OtherCity': 'Address2_City',
      'OtherState': 'Address2_StateOrProvince',
      'OtherPostalCode': 'Address2_PostalCode',
      'OtherCountry': 'Address2_Country'
    },
    microsoft_to_salesforce: {
      'ContactId': 'Id',
      'FirstName': 'FirstName',
      'LastName': 'LastName',
      'EmailAddress1': 'Email',
      'Telephone1': 'Phone',
      'MobilePhone': 'MobilePhone',
      'Address1_Line1': 'MailingStreet',
      'Address1_City': 'MailingCity',
      'Address1_StateOrProvince': 'MailingState',
      'Address1_PostalCode': 'MailingPostalCode',
      'Address1_Country': 'MailingCountry',
      'JobTitle': 'Title',
      'ParentCustomerId': 'AccountId',
      'Department': 'Department',
      'CreatedOn': 'CreatedDate',
      'ModifiedOn': 'LastModifiedDate',
      'OwnerId': 'OwnerId',
      'LeadSource': 'LeadSource',
      'BirthDate': 'Birthdate',
      'Description': 'Description',
      // Add more Microsoft to Salesforce mappings
      'Salutation': 'Salutation',
      'Suffix': 'Suffix',
      'AssistantName': 'AssistantName',
      'AssistantPhone': 'AssistantPhone',
      'Fax': 'Fax',
      'HomePhone': 'HomePhone',
      'OtherPhone': 'OtherPhone',
      'Address2_Line1': 'OtherStreet',
      'Address2_City': 'OtherCity',
      'Address2_StateOrProvince': 'OtherState',
      'Address2_PostalCode': 'OtherPostalCode',
      'Address2_Country': 'OtherCountry'
    }
  };

  // Normalize field names with enhanced patterns
  const normalizeFieldName = (field) => {
    let normalized = field.toLowerCase()
      // Remove common prefixes
      .replace(/^(contact_|account_|user_|customer_)/, '')
      // Normalize date-related terms
      .replace(/(created_on|createdon|create_date|createdate|created_at|creation_date|creation|created)/, 'created')
      .replace(/(modified_on|modifiedon|modify_date|modifydate|modified_at|modification_date|modified|modified_date|lastmodified|last_modified)/, 'modified')
      .replace(/(updated_on|updatedon|update_date|updatedate|updated_at|update)/, 'modified')
      // Normalize common field patterns
      .replace(/(first_name|firstname|first)/, 'firstname')
      .replace(/(last_name|lastname|last)/, 'lastname')
      .replace(/(email_address|emailaddress|email_id|emailid)/, 'email')
      .replace(/(phone_number|phonenumber|telephone_number|telephonenumber|phone|telephone)/, 'phone')
      .replace(/(mobile_number|mobilenumber|cell_phone|cellphone|mobile_phone)/, 'mobilephone')
      .replace(/(birth_date|birthdate|dateofbirth|date_of_birth)/, 'birthdate')
      .replace(/(job_title|jobtitle|position|title)/, 'title')
      // Remove special characters and spaces
      .replace(/[^a-z0-9]/g, '');
    
    return normalized;
  };

  // Get auto-selected value with improved matching
  const getAutoSelectedValue = (field) => {
    const mappingKey = selectedCRM === "microsoft" ? "microsoft_to_salesforce" : "salesforce_to_microsoft";
    const mappings = commonFieldMappings[mappingKey];

    // First check for direct mapping
    if (mappings[field]) {
      return mappings[field];
    }

    // Check using normalized fields
    const normalizedSourceField = normalizeFieldName(field);
    
    // Try to find a match in the mappings using normalized names
    for (const [key, value] of Object.entries(mappings)) {
      if (normalizeFieldName(key) === normalizedSourceField || 
          normalizeFieldName(value) === normalizedSourceField) {
        return value;
      }
    }

    // Try to find a match in all available target fields
    const allTargetFields = [...new Set([...migrationHeaders, ...(nativeFields || [])])];
    const targetMatch = allTargetFields.find(targetField => 
      normalizeFieldName(targetField) === normalizedSourceField
    );

    if (targetMatch) {
      return targetMatch;
    }

    // Return existing mapping if it exists
    if (headerMapping[field]) {
      return headerMapping[field];
    }

    return '';
  };

  // Check if field is already mapped
  const isFieldMapped = (migrationHeader, currentHeader) => {
    return Object.entries(headerMapping).some(
      ([header, mapped]) => mapped === migrationHeader && header !== currentHeader
    );
  };

  // Combine all available target fields
  const allTargetFields = [...new Set([...migrationHeaders, ...(nativeFields || [])])];

  useEffect(() => {
    const autoSelectedValue = getAutoSelectedValue(firstFileHeader);
    if (autoSelectedValue && !headerMapping[firstFileHeader]) {
      onMappingChange(firstFileHeader, autoSelectedValue);
    }
  }, [firstFileHeader, selectedCRM]);

  return (
    <div className="mb-3 d-flex items-center gap-[30px] w-100">
      <span className="d-flex justify-between items-center w-100">
        <label className="text-[16px]">{firstFileHeader}</label>
        <ChevronsRight />
      </span>
      <select
        onChange={(e) => onMappingChange(firstFileHeader, e.target.value)}
        value={headerMapping[firstFileHeader] || ''}
        className="form-select mapCol w-100"
        disabled={mergedFieldsList?.some(
          merge => merge.sourceFields.includes(firstFileHeader)
        )}
      >
        <option value="">Select Migration Column</option>
        {allTargetFields.map((migrationHeader, idx) => {
          const isSelected = headerMapping[firstFileHeader] === migrationHeader;
          const isUsed = Object.values(headerMapping).includes(migrationHeader);
          const isPartOfMerge = mergedFieldsList?.some(
            merge => merge.targetField === migrationHeader
          );
          return (
            <option
              key={idx}
              value={migrationHeader}
              disabled={(!isSelected && isUsed) || isPartOfMerge}
            >
              {migrationHeader}
            </option>
          );
        })}
      </select>
    </div>
  );
};

export default EnhancedFieldMapping;