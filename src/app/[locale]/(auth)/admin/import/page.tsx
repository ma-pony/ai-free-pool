'use client';

import { useState } from 'react';

type ValidationResult = {
  valid: number;
  warnings: number;
  errors: number;
  items: ImportItem[];
};

type ImportItem = {
  row: number;
  platform: string;
  title: string;
  status: 'valid' | 'warning' | 'error';
  issues?: string[];
};

export default function AdminImportPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResult | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [importComplete, setImportComplete] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && (droppedFile.name.endsWith('.csv') || droppedFile.name.endsWith('.json'))) {
      setFile(droppedFile);
      validateFile(droppedFile);
    } else {
      alert('Please upload a CSV or JSON file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      validateFile(selectedFile);
    }
  };

  const validateFile = async (fileToValidate: File) => {
    setIsValidating(true);
    setValidationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', fileToValidate);

      const response = await fetch('/api/admin/import/validate', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setValidationResult(data.data);
      } else {
        alert(data.error?.message || 'Failed to validate file');
      }
    } catch (err) {
      console.error('Validation error:', err);
      alert('Failed to validate file');
    } finally {
      setIsValidating(false);
    }
  };

  const handleImport = async () => {
    if (!file || !validationResult) {
      return;
    }

    setIsImporting(true);
    setImportProgress(0);
    setImportComplete(false);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/admin/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setImportProgress(100);
        setImportComplete(true);
        setTimeout(() => {
          // Reset form
          setFile(null);
          setValidationResult(null);
          setImportComplete(false);
        }, 3000);
      } else {
        alert(data.error?.message || 'Failed to import campaigns');
      }
    } catch (err) {
      console.error('Import error:', err);
      alert('Failed to import campaigns');
    } finally {
      setIsImporting(false);
    }
  };

  const downloadTemplate = () => {
    // Create CSV template
    const csvContent = `platform,title,description,freeCredit,startDate,endDate,officialLink,aiModels,usageLimits,conditionTags
OpenAI,Free API Credits,Get $5 USD credit for new users,$5 USD,2024-01-01,2024-12-31,https://openai.com/api,"GPT-4,GPT-3.5",100 requests per day,"new-user,email-required"
Anthropic,Claude Pro Trial,Try Claude Pro for free,Free for 30 days,2024-01-01,2024-12-31,https://anthropic.com,"Claude-3,Claude-2",Unlimited during trial,"new-user,credit-card-required"`;

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'campaign-import-template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bulk Import Campaigns</h1>
        <p className="mt-1 text-sm text-gray-600">
          Import multiple campaigns at once using CSV or JSON files
        </p>
      </div>

      {/* Step 1: Upload File */}
      <div className="rounded-lg bg-white shadow">
        <div className="border-b border-gray-200 px-6 py-4">
          <h2 className="text-lg font-medium text-gray-900">Step 1: Upload File</h2>
        </div>
        <div className="p-6">
          <div
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`rounded-lg border-2 border-dashed p-12 text-center transition-colors ${
              isDragging
                ? 'border-indigo-500 bg-indigo-50'
                : 'border-gray-300 bg-gray-50'
            }`}
          >
            <svg
              className="mx-auto size-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="mt-4 text-sm text-gray-600">
              Drag & Drop CSV or JSON file here
            </p>
            <p className="mt-1 text-sm text-gray-500">or</p>
            <label className="mt-4 inline-block cursor-pointer rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-gray-300 ring-inset hover:bg-gray-50">
              Choose File
              <input
                type="file"
                accept=".csv,.json"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <p className="mt-4 text-xs text-gray-500">
              Supported formats: .csv, .json | Max file size: 10MB
            </p>
          </div>

          {file && (
            <div className="mt-4 flex items-center justify-between rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <svg className="size-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-gray-900">{file.name}</p>
                  <p className="text-xs text-gray-500">
                    {(file.size / 1024).toFixed(2)}
                    {' '}
                    KB
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFile(null);
                  setValidationResult(null);
                }}
                className="text-sm text-red-600 hover:text-red-700"
                type="button"
              >
                Remove
              </button>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <button
              onClick={downloadTemplate}
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              type="button"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Download Template
            </button>
            <button
              className="inline-flex items-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              type="button"
            >
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              View Format Guide
            </button>
          </div>
        </div>
      </div>

      {/* Step 2: Preview & Validate */}
      {isValidating && (
        <div className="rounded-lg bg-white p-12 text-center shadow">
          <div className="inline-block size-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">Validating file...</p>
        </div>
      )}

      {validationResult && (
        <div className="rounded-lg bg-white shadow">
          <div className="border-b border-gray-200 px-6 py-4">
            <h2 className="text-lg font-medium text-gray-900">Step 2: Preview & Validate</h2>
          </div>
          <div className="p-6">
            {/* Summary */}
            <div className="mb-6 grid grid-cols-3 gap-4">
              <div className="rounded-lg bg-green-50 p-4">
                <div className="flex items-center gap-2">
                  <svg className="size-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-green-900">
                    {validationResult.valid}
                    {' '}
                    valid campaigns
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-yellow-50 p-4">
                <div className="flex items-center gap-2">
                  <svg className="size-5 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span className="text-sm font-medium text-yellow-900">
                    {validationResult.warnings}
                    {' '}
                    warnings
                  </span>
                </div>
              </div>
              <div className="rounded-lg bg-red-50 p-4">
                <div className="flex items-center gap-2">
                  <svg className="size-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm font-medium text-red-900">
                    {validationResult.errors}
                    {' '}
                    errors
                  </span>
                </div>
              </div>
            </div>

            {/* Preview Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Row
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Platform
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium tracking-wider text-gray-500 uppercase">
                      Issues
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {validationResult.items.slice(0, 10).map(item => (
                    <tr key={item.row}>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {item.row}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap text-gray-900">
                        {item.platform}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {item.title}
                      </td>
                      <td className="px-6 py-4 text-sm whitespace-nowrap">
                        {item.status === 'valid' && (
                          <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
                            ✅ Valid
                          </span>
                        )}
                        {item.status === 'warning' && (
                          <span className="inline-flex rounded-full bg-yellow-100 px-2 py-1 text-xs font-semibold text-yellow-800">
                            ⚠️ Warning
                          </span>
                        )}
                        {item.status === 'error' && (
                          <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-800">
                            ❌ Error
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {item.issues?.join(', ') || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Options */}
            <div className="mt-6 space-y-3 rounded-lg border border-gray-200 bg-gray-50 p-4">
              <h3 className="font-medium text-gray-900">Import Options:</h3>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-700">
                  Trigger AI translation for all campaigns
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm text-gray-700">
                  Send notification to admin after import
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" className="rounded" />
                <span className="text-sm text-gray-700">
                  Publish immediately (default: pending review)
                </span>
              </label>
            </div>

            {/* Import Button */}
            <div className="mt-6 flex justify-end gap-4">
              <button
                onClick={() => {
                  setFile(null);
                  setValidationResult(null);
                }}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={validationResult.errors > 0 || isImporting}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                type="button"
              >
                {isImporting ? 'Importing...' : `Import ${validationResult.valid} Campaigns`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Import Progress */}
      {isImporting && (
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="mb-4 font-medium text-gray-900">Importing campaigns...</h3>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${importProgress}%` }}
            />
          </div>
          <p className="mt-2 text-sm text-gray-600">
            {importProgress}
            % complete
          </p>
        </div>
      )}

      {/* Import Complete */}
      {importComplete && (
        <div className="rounded-lg bg-green-50 p-6 shadow">
          <div className="flex items-center gap-3">
            <svg className="size-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <h3 className="font-medium text-green-900">Import Complete!</h3>
              <p className="text-sm text-green-700">
                Campaigns have been successfully imported and are pending review.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
