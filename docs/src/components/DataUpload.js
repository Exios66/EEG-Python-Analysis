import React, { useState } from 'react';
import { Box, Button, Typography, Input } from '@mui/material';

function DataUpload({ onDataUpload }) {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = () => {
    // Process the files and extract data
    // For now, we'll simulate data extraction
    const data = {}; // Replace with actual data extraction logic
    onDataUpload(data);
  };

  return (
    <Box>
      <Input
        type="file"
        inputProps={{ multiple: true, accept: '.eeg,.edf,.bdf,.gdf,.set' }}
        onChange={handleFileChange}
      />
      <Button
        variant="contained"
        color="primary"
        onClick={handleUpload}
        disabled={selectedFiles.length === 0}
        sx={{ mt: 2 }}
      >
        Upload and Analyze
      </Button>
      {selectedFiles.length > 0 && (
        <Typography variant="body2" sx={{ mt: 1 }}>
          {selectedFiles.length} file(s) selected
        </Typography>
      )}
    </Box>
  );
}

export default DataUpload;