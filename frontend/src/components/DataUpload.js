import React, { useState } from 'react';
import { Box, Button, LinearProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

const Input = styled('input')({
  display: 'none',
});

const DataUpload = ({ onDataUpload }) => {
  const [uploading, setUploading] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setFileName(file.name);
    setUploading(true);

    try {
      // In a real application, you would upload the file to your server here
      const formData = new FormData();
      formData.append('file', file);

      // Simulate file upload
      await new Promise(resolve => setTimeout(resolve, 1000));

      // For demo purposes, we're just passing the file name
      onDataUpload({ fileName: file.name });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Box sx={{ textAlign: 'center', p: 3, border: '2px dashed grey', borderRadius: 2 }}>
      <label htmlFor="eeg-file-upload">
        <Input
          id="eeg-file-upload"
          type="file"
          accept=".edf,.fif,.set"
          onChange={handleFileSelect}
          disabled={uploading}
        />
        <Button
          variant="contained"
          component="span"
          disabled={uploading}
        >
          Upload EEG Data
        </Button>
      </label>
      
      {fileName && (
        <Typography variant="body2" sx={{ mt: 2 }}>
          Selected file: {fileName}
        </Typography>
      )}
      
      {uploading && (
        <Box sx={{ width: '100%', mt: 2 }}>
          <LinearProgress />
        </Box>
      )}
    </Box>
  );
};

export default DataUpload;
