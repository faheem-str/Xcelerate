import React from 'react';
import { Upload } from 'lucide-react';
import  FileImage from '../../assets/Images/UploadedSheet.png';
const FileUpload = ({  onChange, uploadedFileName, title  }) => {
  return (
    <div className="flex flex-col items-center">
     { !uploadedFileName &&  <label className="relative flex items-center justify-center w-40 h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
        <input
          type="file"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".csv, .xls, .xlsx"
          onChange={onChange}
        />
        <div className="flex flex-col items-center space-y-2">
          <Upload className="w-8 h-8 text-gray-400" />
          <span className="text-sm text-gray-500">Upload File</span>
        </div>
      </label>}
      {
        uploadedFileName && 
        <img width={179} src={FileImage} alt='' />
      }
      {uploadedFileName && (
        <p className="text-sm text-gray-600 mt-2">
          {uploadedFileName}
        </p>
      )}
    </div>
  );
};

export default FileUpload;