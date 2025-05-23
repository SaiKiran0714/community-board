import React, { useState } from 'react';
import Papa from 'papaparse';

interface CsvImportProps {
  onImportComplete: () => void;
}

export default function CsvImport({ onImportComplete }: CsvImportProps) {
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [importStats, setImportStats] = useState<{
    imported: number;
    errors?: string[];
  } | null>(null);

  const handleClear = () => {
    setError(null);
    setSuccess(false);
    setImportStats(null);
    // Reset the file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validateCsvData = (data: any[]) => {
    const requiredFields = ['email', 'name'];
    const errors = [];

    // Check if data is empty
    if (!data.length) {
      errors.push('CSV file is empty');
      return errors;
    }

    // Check required fields
    const fields = Object.keys(data[0]);
    for (const field of requiredFields) {
      if (!fields.includes(field)) {
        errors.push(`Missing required field: ${field}`);
      }
    }

    // Validate each row
    data.forEach((row, index) => {
      if (!row.email || !row.email.includes('@')) {
        errors.push(`Invalid email in row ${index + 1}`);
      }
      if (!row.name || row.name.trim().length === 0) {
        errors.push(`Missing name in row ${index + 1}`);
      }
      
      // Parse links if present
      if (row.links) {
        try {
          if (typeof row.links === 'string') {
            row.links = JSON.parse(row.links);
          }
        } catch (e) {
          errors.push(`Invalid links format in row ${index + 1}. Expected JSON object.`);
        }
      }
    });

    return errors;
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setError(null);
    setSuccess(false);
    setImportStats(null);

    if (file) {
      if (!file.name.endsWith('.csv')) {
        setError('Please upload a CSV file');
        return;
      }

      setImporting(true);
      Papa.parse(file, {
        complete: async (results) => {
          try {
            // Process the data to parse links
            const processedData = results.data.map((row: any) => {
              if (row.links && typeof row.links === 'string') {
                try {
                  row.links = JSON.parse(row.links);
                } catch (e) {
                  // If parsing fails, set links to empty object
                  row.links = {};
                }
              }
              return row;
            });

            const validationErrors = validateCsvData(processedData);
            if (validationErrors.length > 0) {
              setError(validationErrors.join('\n'));
              setImporting(false);
              return;
            }

            const token = localStorage.getItem('authToken');
            const response = await fetch('http://127.0.0.1:5000/api/users/import', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({ data: processedData })
            });

            const data = await response.json();

            if (response.ok || response.status === 207) {
              setSuccess(true);
              setImportStats({
                imported: data.imported,
                errors: data.errors
              });
              if (data.imported > 0) {
                onImportComplete();
              }
            } else {
              throw new Error(data.error || 'Failed to import users');
            }
          } catch (error) {
            setError(error instanceof Error ? error.message : 'Failed to import users');
          } finally {
            setImporting(false);
          }
        },
        header: true,
        skipEmptyLines: true,
        error: (error) => {
          setError(`Failed to parse CSV: ${error.message}`);
          setImporting(false);
        }
      });
    }
  };

  return (
    <div style={{
      border: '1px solid #E8E1D5',
      padding: '20px',
      borderRadius: '8px',
      backgroundColor: '#FDFBF7'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '16px'
      }}>
        <h2 style={{
          fontSize: '18px',
          fontWeight: 'bold',
          color: '#1a1a1a'
        }}>Import Users</h2>
        {(success || error) && (
          <button
            onClick={handleClear}
            style={{
              padding: '6px 12px',
              backgroundColor: '#F5F1E8',
              border: '1px solid #E8E1D5',
              borderRadius: '4px',
              color: '#666666',
              cursor: 'pointer',
              fontSize: '14px'
            }}
          >
            Clear
          </button>
        )}
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label style={{
          display: 'block',
          marginBottom: '8px',
          color: '#666666'
        }}>
          Upload CSV File
          <span style={{
            fontSize: '14px',
            color: '#666666',
            marginLeft: '8px'
          }}>
            (Required fields: email, name)
          </span>
        </label>
        
        <input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={importing}
          style={{
            width: '100%',
            padding: '8px',
            border: '1px solid #E8E1D5',
            borderRadius: '4px',
            backgroundColor: 'white'
          }}
        />
      </div>

      {error && (
        <div style={{
          backgroundColor: '#FEF2F2',
          border: '1px solid #FCA5A5',
          padding: '12px',
          borderRadius: '4px',
          color: '#B91C1C',
          whiteSpace: 'pre-line',
          marginBottom: '12px'
        }}>
          {error}
        </div>
      )}

      {success && importStats && (
        <div style={{
          backgroundColor: importStats.errors ? '#FFFBEB' : '#F0FDF4',
          border: `1px solid ${importStats.errors ? '#FCD34D' : '#86EFAC'}`,
          padding: '12px',
          borderRadius: '4px',
          color: importStats.errors ? '#92400E' : '#166534',
          marginBottom: '12px'
        }}>
          <div>Successfully imported {importStats.imported} users</div>
          {importStats.errors && importStats.errors.length > 0 && (
            <div style={{ marginTop: '8px' }}>
              <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>Warnings:</div>
              <ul style={{ paddingLeft: '20px' }}>
                {importStats.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {importing && (
        <div style={{
          color: '#666666',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <svg
            className="animate-spin"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Importing users...
        </div>
      )}
    </div>
  );
} 