#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
Advanced EEG Analysis and Processing Pipeline

This script provides comprehensive EEG data analysis capabilities including:
1. Data loading and preprocessing
2. Advanced filtering and artifact removal
3. Time-frequency analysis
4. Feature extraction
5. Statistical analysis
6. REST API endpoints for frontend integration
7. Real-time processing capabilities
8. Export functionality for visualization

Author: MVT Nexus Team
"""

import os
import mne
import numpy as np
import pandas as pd
import scipy.signal
from scipy.stats import zscore
from sklearn.preprocessing import StandardScaler
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import threading
import queue
import time
from pathlib import Path
import matplotlib.pyplot as plt
from werkzeug.utils import secure_filename

# Initialize Flask app for API
app = Flask(__name__)
CORS(app)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'eeg', 'edf', 'bdf', 'gdf', 'set'}

# Create uploads directory if it doesn't exist
UPLOAD_FOLDER = 'uploads'
Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

def allowed_file(filename):
    """Check if the file has an allowed extension."""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

class EEGProcessor:
    def __init__(self):
        self.raw = None
        self.filtered_data = None
        self.epochs = None
        self.features = {}
        self.processing_queue = queue.Queue()
        self.is_processing = False

    def load_eeg_data(self, file_path, file_type='auto'):
        """
        Load EEG data using MNE with extended format support.
        """
        try:
            if file_type == 'auto':
                self.raw = mne.io.read_raw(file_path, preload=True, verbose=False)
            else:
                self.raw = mne.io.read_raw(file_path, preload=True, verbose=False,
                                           file_type=file_type)
            return True
        except Exception as e:
            print(f"Error loading EEG data: {e}")
            return False

    def preprocess_data(self, l_freq=1.0, h_freq=40.0, notch_freq=50.0):
        """
        Comprehensive preprocessing pipeline.
        """
        try:
            # Apply bandpass filter
            self.filtered_data = self.raw.copy().filter(l_freq=l_freq, h_freq=h_freq)
            
            # Apply notch filter for power line noise
            self.filtered_data.notch_filter(freqs=notch_freq)
            
            # Detect and remove bad channels
            self.filtered_data.interpolate_bads(reset_bads=True)
            
            # Apply ICA for artifact removal
            ica = mne.preprocessing.ICA(n_components=0.95, random_state=42)
            ica.fit(self.filtered_data)
            
            # Automatically detect and remove eye blink artifacts
            eog_indices, eog_scores = ica.find_bads_eog(self.filtered_data)
            ica.exclude = eog_indices
            ica.apply(self.filtered_data)
            
            return True
        except Exception as e:
            print(f"Error in preprocessing: {e}")
            return False

    def extract_features(self):
        """
        Extract comprehensive set of EEG features.
        """
        try:
            # Calculate power spectral density
            psd, freqs = mne.time_frequency.psd_welch(self.filtered_data,
                                                      fmin=1, fmax=40,
                                                      n_fft=2048)
            
            # Extract band powers
            bands = {
                'delta': (1, 4),
                'theta': (4, 8),
                'alpha': (8, 13),
                'beta': (13, 30),
                'gamma': (30, 40)
            }
            
            self.features['band_powers'] = {}
            for band, (fmin, fmax) in bands.items():
                freq_mask = (freqs >= fmin) & (freqs <= fmax)
                self.features['band_powers'][band] = np.mean(psd[:, freq_mask], axis=1).tolist()
            
            # Calculate connectivity metrics
            self.features['connectivity'] = self._calculate_connectivity()
            
            # Extract temporal features
            self.features['temporal'] = self._extract_temporal_features()
            
            return True
        except Exception as e:
            print(f"Error in feature extraction: {e}")
            return False

    def _calculate_connectivity(self):
        """Calculate various connectivity metrics between channels."""
        try:
            data = self.filtered_data.get_data()
            n_channels = data.shape[0]
            connectivity = np.zeros((n_channels, n_channels))
            
            for i in range(n_channels):
                for j in range(n_channels):
                    connectivity[i, j] = np.corrcoef(data[i, :], data[j, :])[0, 1]
            
            return connectivity.tolist()
        except Exception as e:
            print(f"Error in connectivity calculation: {e}")
            return None

    def _extract_temporal_features(self):
        """Extract temporal domain features."""
        try:
            data = self.filtered_data.get_data()
            features = {
                'mean': np.mean(data, axis=1).tolist(),
                'std': np.std(data, axis=1).tolist(),
                'kurtosis': scipy.stats.kurtosis(data, axis=1).tolist(),
                'skewness': scipy.stats.skew(data, axis=1).tolist()
            }
            return features
        except Exception as e:
            print(f"Error in temporal feature extraction: {e}")
            return None

    def export_results(self, output_dir):
        """
        Export analysis results to various formats.
        """
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Export features as JSON
            with open(output_path / 'features.json', 'w') as f:
                json.dump(self.features, f)
            
            # Export raw data plots
            fig = self.filtered_data.plot(show=False)
            fig.savefig(output_path / 'raw_data.png')
            plt.close(fig)
            
            # Export PSD plots
            fig, ax = plt.subplots(figsize=(10, 6))
            self.filtered_data.plot_psd(ax=ax, show=False)
            fig.savefig(output_path / 'psd.png')
            plt.close(fig)
            
            return True
        except Exception as e:
            print(f"Error in exporting results: {e}")
            return False

# Flask API routes
@app.route('/api/process', methods=['POST'])
def process_eeg():
    """API endpoint to process EEG data from a given file path."""
    try:
        processor = EEGProcessor()
        file_path = request.json['file_path']
        
        if processor.load_eeg_data(file_path):
            processor.preprocess_data()
            processor.extract_features()
            return jsonify({
                'status': 'success',
                'features': processor.features
            })
        else:
            return jsonify({
                'status': 'error',
                'message': 'Failed to process EEG data'
            }), 400
    except Exception as e:
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/upload', methods=['POST'])
def upload_file():
    """API endpoint to handle file uploads from the frontend."""
    try:
        if 'files[]' not in request.files:
            return jsonify({'status': 'error', 'message': 'No files part in the request'}), 400

        files = request.files.getlist('files[]')
        if not files:
            return jsonify({'status': 'error', 'message': 'No files selected'}), 400

        results = []

        for file in files:
            if file and allowed_file(file.filename):
                filename = secure_filename(file.filename)
                file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
                file.save(file_path)

                # Process the file
                processor = EEGProcessor()
                if processor.load_eeg_data(file_path):
                    processor.preprocess_data()
                    processor.extract_features()
                    # Optionally, you can export the results
                    # processor.export_results(output_dir)

                    results.append({
                        'filename': filename,
                        'features': processor.features
                    })
                else:
                    results.append({
                        'filename': filename,
                        'error': 'Failed to process EEG data'
                    })
            else:
                results.append({
                    'filename': file.filename,
                    'error': 'File type not allowed'
                })

        return jsonify({'status': 'success', 'results': results})
    except Exception as e:
        print(f"Error in file upload: {e}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

def start_api_server(port=5000):
    """Start the Flask API server."""
    app.run(host='0.0.0.0', port=port)

if __name__ == "__main__":
    # Start API server
    start_api_server()
    print("EEG Analysis System initialized and ready for processing.")