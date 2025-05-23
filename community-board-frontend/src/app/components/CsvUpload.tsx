import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';

interface CsvUploadProps {
  onUploadSuccess: () => void;
  isAdmin?: boolean;
  onLoadingChange?: (loading: boolean) => void;
}

export function CsvUpload({ onUploadSuccess, isAdmin = false, onLoadingChange }: CsvUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string>('');
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);

  const handleClear = () => {
    setError('');
    setUploading(false);
    setUploadComplete(false);
    setIsDragging(false);
    // Reset the file input
    const fileInput = document.getElementById('csv-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = useCallback(async (file: File) => {
    setError('');
    setUploading(true);
    onLoadingChange?.(true);
    setUploadComplete(false);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        try {
          // Validate required fields
          const requiredFields = ['email', 'name'];
          const headers = results.meta.fields || [];
          const missingFields = requiredFields.filter(field => !headers.includes(field));

          if (missingFields.length > 0) {
            setError(`Missing required fields: ${missingFields.join(', ')}`);
            setUploading(false);
            onLoadingChange?.(false);
            return;
          }

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

          // Send to backend
          const token = localStorage.getItem('authToken');
          const response = await fetch('http://127.0.0.1:5000/api/users/import', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ data: processedData })
          });

          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.error || 'Failed to import users');
          }

          // Show success message with import details
          const successMessage = `Successfully imported ${data.imported} users.`;
          alert(successMessage + (data.errors ? `\n\nWarnings:\n${data.errors.join('\n')}` : ''));
          setUploadComplete(true);
          onUploadSuccess();
        } catch (error) {
          console.error('Failed to process CSV:', error);
          setError(error instanceof Error ? error.message : 'Failed to process CSV file');
        } finally {
          setUploading(false);
          onLoadingChange?.(false);
        }
      },
      error: (error: Error) => {
        console.error('CSV parsing error:', error);
        setError('Failed to parse CSV file');
        setUploading(false);
        onLoadingChange?.(false);
      }
    });
  }, [onUploadSuccess, onLoadingChange]);

  return (
        <div style={{      padding: '12px',      backgroundColor: '#F5F1E8',      borderRadius: '8px',    }}>
            <div style={{        display: 'flex',        justifyContent: 'flex-end',        alignItems: 'center',        marginBottom: '16px'      }}>        {(uploadComplete || error) && (          <button            onClick={handleClear}            style={{              padding: '6px 12px',              backgroundColor: '#FDFBF7',              border: '1px solid #E8E1D5',              borderRadius: '4px',              color: '#666666',              cursor: 'pointer',              fontSize: '14px'            }}          >            Clear          </button>        )}      </div>

      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        style={{
                    border: `2px dashed ${isDragging ? '#3b82f6' : '#E8E1D5'}`,          borderRadius: '6px',          padding: '30px 20px',          textAlign: 'center',          backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.1)' : '#FDFBF7',          cursor: 'pointer',          transition: 'all 0.2s ease'
        }}
      >
        <input
          type="file"
          accept=".csv"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
          id="csv-upload"
        />
        <label htmlFor="csv-upload" style={{ cursor: 'pointer' }}>
          <div style={{
            marginBottom: '10px',
            color: '#666666'
          }}>
            {uploading ? (
              <div>Uploading...</div>
            ) : (
              <>
                <div style={{ marginBottom: '8px' }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" style={{ margin: '0 auto' }}>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <div>
                  <strong>Drop CSV file here</strong> or <span style={{ color: '#3b82f6' }}>click to upload</span>
                </div>
                <div style={{ fontSize: '12px', marginTop: '8px' }}>
                  Required fields: email, name
                </div>
                {!isAdmin && (
                  <div style={{ 
                    fontSize: '12px', 
                    marginTop: '8px',
                    color: '#666666',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    padding: '4px 8px',
                    borderRadius: '4px',
                    display: 'inline-block'
                  }}>
                    Note: You can upload up to 10 users at a time
                  </div>
                )}
              </>
            )}
          </div>
        </label>
      </div>

      {error && (
        <div style={{
          marginTop: '10px',
          padding: '10px',
          color: '#ef4444',
          backgroundColor: '#fee2e2',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}
    </div>
  );
} 