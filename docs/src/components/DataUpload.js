import React, { useState, useCallback } from 'react';
import { Box, Button, Typography, Input, CircularProgress, Alert } from '@mui/material';

function DataUpload({ onDataUpload }) {
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const validateFiles = (files) => {
    const validExtensions = ['.eeg', '.edf', '.bdf', '.gdf', '.set'];
    const maxFileSize = 100 * 1024 * 1024; // 100MB limit
    
    return files.every(file => {
      const extension = '.' + file.name.split('.').pop().toLowerCase();
      if (!validExtensions.includes(extension)) {
        setError(`Invalid file type: ${file.name}. Allowed types: ${validExtensions.join(', ')}`);
        return false;
      }
      if (file.size > maxFileSize) {
        setError(`File ${file.name} exceeds 100MB size limit`);
        return false;
      }
      return true;
    });
  };

  const handleFileChange = useCallback((event) => {
    setError(null);
    const files = Array.from(event.target.files);
    if (validateFiles(files)) {
      setSelectedFiles(files);
    } else {
      setSelectedFiles([]);
      event.target.value = null;
    }
  }, []);

  const processFile = async (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          // Here you would implement specific parsing logic for each file type
          // This is a placeholder for the actual implementation
          const rawData = e.target.result;
          const processedData = {
            fileName: file.name,
            fileType: file.name.split('.').pop().toLowerCase(),
            size: file.size,
            lastModified: file.lastModified,
            data: rawData
          };
          resolve(processedData);
        } catch (error) {
          reject(new Error(`Failed to process ${file.name}: ${error.message}`));
        }
      };

      reader.onerror = () => reject(new Error(`Failed to read ${file.name}`));
      reader.readAsArrayBuffer(file);
    });
  };

  const handleUpload = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      const processedData = [];
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const data = await processFile(file);
        processedData.push(data);
        setProgress(((i + 1) / selectedFiles.length) * 100);
      }

      onDataUpload(processedData);
      setSelectedFiles([]);
      setProgress(0);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, margin: '0 auto' }}>
      <Input
        type="file"
        inputProps={{ 
          multiple: true, 
          accept: '.eeg,.edf,.bdf,.gdf,.set',
          'data-testid': 'file-input'
        }}
        onChange={handleFileChange}
        disabled={isLoading}
        sx={{ width: '100%', mb: 2 }}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || isLoading}
        sx={{ 
          mt: 2,
          width: '100%',
          position: 'relative'
        }}
      >
        {isLoading ? (
          <>
            <CircularProgress
              size={24}
              sx={{
                position: 'absolute',
                left: '50%',
                marginLeft: '-12px'
              }}
            />
            Processing... {Math.round(progress)}%
          </>
        ) : 'Upload and Analyze'}
      </Button>

      {selectedFiles.length > 0 && !isLoading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" sx={{ mb: 1 }}>
            {selectedFiles.length} file(s) selected:
          </Typography>
          {selectedFiles.map((file, index) => (
            <Typography
              key={index}
              variant="caption"
              display="block"
              sx={{ color: 'text.secondary' }}
            >
              {file.name} ({(file.size / (1024 * 1024)).toFixed(2)} MB)
            </Typography>
          ))}
        </Box>
      )}
    </Box>
  );
}

export default DataUpload;