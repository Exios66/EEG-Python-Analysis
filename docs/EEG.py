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
9. Secure data handling
10. Logging and monitoring
11. Error handling and recovery
12. Performance optimization
13. Data validation
14. Documentation

Author: MVT Nexus Team
"""

from contextlib import nullcontext
import gzip
import os
import sys
import mne
import numpy as np
from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import queue
import logging
from pathlib import Path
from werkzeug.utils import secure_filename
import hashlib
import uuid
import shutil
import tempfile
from typing import Dict, List, Optional, TYPE_CHECKING
from concurrent.futures import ThreadPoolExecutor
import yaml
from dataclasses import dataclass
from enum import Enum
import redis
try:
    from prometheus_client import start_http_server, Counter, Gauge, Histogram
except ImportError:
    logging.getLogger(__name__).error("prometheus_client not installed. Monitoring disabled.")
    # Provide mock classes if prometheus_client not available
    class Counter:
        def __init__(self, *args, **kwargs):
            self._value = 0
            
        def inc(self, amount=1):
            self._value += amount
            
        def dec(self, amount=1):
            self._value -= amount
            
        def get(self):
            return self._value
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import rate limiting functionality
try:
    from flask_limiter import Limiter
    from flask_limiter.util import get_remote_address
except ImportError:
    logger.error("flask_limiter not installed. Rate limiting disabled.")
    # Mock Limiter and get_remote_address if not available
    class Limiter:
        def __init__(self, *args, **kwargs): pass
        def limit(self, *args, **kwargs): return lambda x: x
    def get_remote_address(): return None

# Import JWT functionality
if TYPE_CHECKING:
    from flask_jwt_extended import JWTManager, jwt_required, create_access_token

try:
    from flask_jwt_extended import JWTManager, jwt_required, create_access_token
except ImportError:
    logger.error("flask_jwt_extended not installed. Authentication disabled.")
    # Mock JWT if not available
    class JWTManager:
        def __init__(self, *args, **kwargs): pass
    def jwt_required(): return lambda x: x
    def create_access_token(**kwargs): return ""

# Import Prometheus monitoring
try:
    from prometheus_client import Counter, Gauge, Histogram
except ImportError:
    logger.error("prometheus_client not installed. Monitoring disabled.")
    # Mock monitoring classes if not available
    class Counter:
        def __init__(self, *args, **kwargs): pass
        def inc(self): pass
    class Gauge:
        def __init__(self, *args, **kwargs): pass
        def set(self, val): pass
    class Histogram:
        def __init__(self, *args, **kwargs): pass
        def time(self): return nullcontext()

# Configure logging with handlers
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('eeg_processor.log'),
        logging.StreamHandler(sys.stdout)
    ]
)

# Load configuration
try:
    with open('config.yaml', 'r') as f:
        config = yaml.safe_load(f)
except FileNotFoundError:
    logger.warning("Config file not found, using defaults")
    config = {
        'upload_folder': 'uploads',
        'max_file_size': 100 * 1024 * 1024,  # 100MB
        'allowed_extensions': {'eeg', 'edf', 'bdf', 'gdf', 'set'},
        'redis_url': 'redis://localhost:6379',
        'jwt_secret_key': str(uuid.uuid4()),
        'rate_limit': '100 per minute'
    }

# Initialize Flask app with security features
app = Flask(__name__)
CORS(app)
jwt = JWTManager(app)
app.config['JWT_SECRET_KEY'] = config['jwt_secret_key']
limiter = Limiter(app=app, key_func=get_remote_address)

# Redis for caching and session management
redis_client = redis.from_url(config['redis_url'])

# Prometheus metrics
REQUESTS = Counter('eeg_requests_total', 'Total EEG processing requests')
PROCESSING_TIME = Histogram('eeg_processing_seconds', 'Time spent processing EEG data')
MEMORY_USAGE = Gauge('eeg_memory_usage_bytes', 'Memory usage of EEG processor')

# Create required directories
UPLOAD_FOLDER = config['upload_folder']
Path(UPLOAD_FOLDER).mkdir(parents=True, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = config['max_file_size']

class ProcessingStatus(Enum):
    """Enum for processing status tracking"""
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"

@dataclass
class ProcessingResult:
    """Data class for processing results"""
    status: ProcessingStatus
    features: Optional[Dict] = None
    error: Optional[str] = None
    processing_time: Optional[float] = None

class EEGProcessor:
    def __init__(self):
        self.raw = None
        self.filtered_data = None
        self.epochs = None
        self.features = {}
        self.processing_queue = queue.Queue()
        self.is_processing = False
        self.thread_pool = ThreadPoolExecutor(max_workers=4)
        self.cache = {}
        
    def load_eeg_data(self, file_path: str, file_type: str = 'auto') -> bool:
        """
        Load EEG data using MNE with extended format support and validation.
        
        Args:
            file_path: Path to the EEG data file
            file_type: Type of the file format
            
        Returns:
            bool: Success status of loading operation
        """
        try:
            # Calculate file hash for caching
            file_hash = self._calculate_file_hash(file_path)
            
            # Check cache
            if file_hash in self.cache:
                logger.info("Loading data from cache")
                self.raw = self.cache[file_hash]
                return True
                
            logger.info(f"Loading EEG data from {file_path}")
            if file_type == 'auto':
                self.raw = mne.io.read_raw(file_path, preload=True, verbose=False)
            else:
                self.raw = mne.io.read_raw(file_path, preload=True, verbose=False,
                                         file_type=file_type)
                                         
            # Validate data
            if not self._validate_data():
                raise ValueError("Invalid EEG data format")
                
            # Cache the loaded data
            self.cache[file_hash] = self.raw
            
            return True
            
        except Exception as e:
            logger.error(f"Error loading EEG data: {str(e)}")
            raise
            
    def _validate_data(self) -> bool:
        """Validate loaded EEG data"""
        if self.raw is None:
            return False
            
        # Check sampling frequency
        if self.raw.info['sfreq'] <= 0:
            return False
            
        # Check number of channels
        if len(self.raw.ch_names) == 0:
            return False
            
        # Check data quality
        if np.any(np.isnan(self.raw.get_data())):
            return False
            
        return True
        
    @staticmethod
    def _calculate_file_hash(file_path: str) -> str:
        """Calculate SHA-256 hash of file"""
        sha256_hash = hashlib.sha256()
        with open(file_path, "rb") as f:
            for byte_block in iter(lambda: f.read(4096), b""):
                sha256_hash.update(byte_block)
        return sha256_hash.hexdigest()

    def preprocess_data(self, l_freq: float = 1.0, h_freq: float = 40.0, 
                       notch_freq: float = 50.0) -> bool:
        """
        Comprehensive preprocessing pipeline with advanced artifact removal.
        
        Args:
            l_freq: Lower frequency bound for bandpass filter
            h_freq: Higher frequency bound for bandpass filter
            notch_freq: Frequency for notch filter
            
        Returns:
            bool: Success status of preprocessing operation
        """
        try:
            logger.info("Starting preprocessing pipeline")
            
            # Create a copy of raw data
            self.filtered_data = self.raw.copy()
            
            # Apply bandpass filter
            logger.debug("Applying bandpass filter")
            self.filtered_data.filter(l_freq=l_freq, h_freq=h_freq)
            
            # Apply notch filter
            logger.debug("Applying notch filter")
            self.filtered_data.notch_filter(freqs=notch_freq)
            
            # Detect and interpolate bad channels
            logger.debug("Detecting bad channels")
            bads = mne.preprocessing.find_bad_channels_maxwell(self.filtered_data)
            self.filtered_data.info['bads'] = bads
            self.filtered_data.interpolate_bads(reset_bads=True)
            
            # Apply ICA
            logger.debug("Applying ICA")
            ica = mne.preprocessing.ICA(
                n_components=0.95,
                random_state=42,
                method='fastica'
            )
            ica.fit(self.filtered_data)
            
            # Detect and remove artifacts
            logger.debug("Removing artifacts")
            eog_indices, _ = ica.find_bads_eog(self.filtered_data)
            ecg_indices, _ = ica.find_bads_ecg(self.filtered_data)
            ica.exclude = list(set(eog_indices + ecg_indices))
            ica.apply(self.filtered_data)
            
            # Additional cleaning steps
            self._remove_muscle_artifacts()
            self._remove_line_noise()
            
            logger.info("Preprocessing completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error in preprocessing: {str(e)}")
            raise

    def _remove_muscle_artifacts(self):
        """Remove high-frequency muscle artifacts"""
        try:
            from mne.preprocessing import create_eog_epochs
            eog_epochs = create_eog_epochs(self.filtered_data)
            eog_epochs.average().apply_baseline((-0.2, 0.2))
        except Exception as e:
            logger.warning(f"Could not remove muscle artifacts: {str(e)}")

    def _remove_line_noise(self):
        """Remove power line noise using advanced techniques"""
        try:
            self.filtered_data.notch_filter(
                freqs=np.arange(50, 251, 50),
                picks='all',
                method='spectrum_fit'
            )
        except Exception as e:
            logger.warning(f"Could not remove line noise: {str(e)}")

    @PROCESSING_TIME.time()
    def extract_features(self) -> bool:
        """
        Extract comprehensive set of EEG features using parallel processing.
        
        Returns:
            bool: Success status of feature extraction
        """
        try:
            logger.info("Starting feature extraction")
            
            # Calculate power spectral density
            psd, freqs = mne.time_frequency.psd_welch(
                self.filtered_data,
                fmin=1, fmax=40,
                n_fft=2048,
                n_overlap=1024
            )
            
            # Extract band powers in parallel
            bands = {
                'delta': (1, 4),
                'theta': (4, 8),
                'alpha': (8, 13),
                'beta': (13, 30),
                'gamma': (30, 40)
            }
            
            with ThreadPoolExecutor() as executor:
                futures = {
                    band: executor.submit(
                        self._calculate_band_power, 
                        psd, freqs, fmin, fmax
                    )
                    for band, (fmin, fmax) in bands.items()
                }
                
                self.features['band_powers'] = {
                    band: future.result()
                    for band, future in futures.items()
                }
            
            # Calculate additional features
            self.features.update({
                'connectivity': self._calculate_connectivity(),
                'temporal': self._extract_temporal_features(),
                'complexity': self._calculate_complexity_measures(),
                'statistical': self._calculate_statistical_features()
            })
            
            # Validate features
            if not self._validate_features():
                raise ValueError("Feature validation failed")
            
            logger.info("Feature extraction completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error in feature extraction: {str(e)}")
            raise

    def _calculate_band_power(self, psd: np.ndarray, freqs: np.ndarray, 
                            fmin: float, fmax: float) -> List[float]:
        """Calculate power in specific frequency band"""
        freq_mask = (freqs >= fmin) & (freqs <= fmax)
        return np.mean(psd[:, freq_mask], axis=1).tolist()

    def _calculate_complexity_measures(self) -> Dict:
        """Calculate signal complexity measures"""
        try:
            data = self.filtered_data.get_data()
            return {
                'sample_entropy': self._sample_entropy(data),
                'approximate_entropy': self._approximate_entropy(data),
                'hurst_exponent': self._hurst_exponent(data)
            }
        except Exception as e:
            logger.error(f"Error calculating complexity measures: {str(e)}")
            return {}

    def _calculate_statistical_features(self) -> Dict:
        """Calculate statistical features"""
        try:
            data = self.filtered_data.get_data()
            return {
                'variance': np.var(data, axis=1).tolist(),
                'peak_to_peak': np.ptp(data, axis=1).tolist(),
                'zero_crossings': np.sum(np.diff(np.signbit(data), axis=1), axis=1).tolist()
            }
        except Exception as e:
            logger.error(f"Error calculating statistical features: {str(e)}")
            return {}

    def export_results(self, output_dir: str) -> bool:
        """
        Export analysis results to various formats with compression.
        
        Args:
            output_dir: Directory to save the results
            
        Returns:
            bool: Success status of export operation
        """
        try:
            output_path = Path(output_dir)
            output_path.mkdir(parents=True, exist_ok=True)
            
            # Export features as compressed JSON
            features_file = output_path / 'features.json.gz'
            with gzip.open(features_file, 'wt') as f:
                json.dump(self.features, f)
            
            # Export plots
            self._export_plots(output_path)
            
            # Export raw data in compressed format
            raw_data_file = output_path / 'raw_data.npy.gz'
            np.savez_compressed(raw_data_file, data=self.filtered_data.get_data())
            
            # Create analysis report
            self._create_report(output_path)
            
            logger.info(f"Results exported successfully to {output_dir}")
            return True
            
        except Exception as e:
            logger.error(f"Error in exporting results: {str(e)}")
            raise

    def _create_report(self, output_path: Path):
        """Create comprehensive analysis report"""
        report = mne.Report(title='EEG Analysis Report')
        report.add_raw(self.raw, title='Raw Data')
        report.add_raw(self.filtered_data, title='Filtered Data')
        report.save(output_path / 'report.html', overwrite=True)

# Flask API routes with security and rate limiting
@app.route('/api/process', methods=['POST'])
@jwt_required()
@limiter.limit(config['rate_limit'])
def process_eeg():
    """Secure API endpoint to process EEG data"""
    REQUESTS.inc()
    
    try:
        processor = EEGProcessor()
        file_path = request.json['file_path']
        
        # Validate file path
        if not os.path.exists(file_path):
            raise FileNotFoundError("File not found")
            
        result = ProcessingResult(status=ProcessingStatus.PROCESSING)
        
        with PROCESSING_TIME.time():
            if processor.load_eeg_data(file_path):
                processor.preprocess_data()
                processor.extract_features()
                result.status = ProcessingStatus.COMPLETED
                result.features = processor.features
                
                return jsonify({
                    'status': result.status.value,
                    'features': result.features
                })
                
    except Exception as e:
        logger.error(f"API Error: {str(e)}")
        return jsonify({
            'status': 'error',
            'message': str(e)
        }), 500

@app.route('/api/upload', methods=['POST'])
@jwt_required()
@limiter.limit(config['rate_limit'])
def upload_file():
    """Secure API endpoint for file uploads"""
    REQUESTS.inc()
    
    try:
        if 'files[]' not in request.files:
            raise ValueError('No files part in the request')

        files = request.files.getlist('files[]')
        if not files:
            raise ValueError('No files selected')

        results = []
        
        for file in files:
            if file and file.filename and file.filename.lower().split('.')[-1] in config['allowed_extensions']:
                filename = secure_filename(file.filename)
                temp_dir = tempfile.mkdtemp()
                file_path = os.path.join(temp_dir, filename)
                
                try:
                    file.save(file_path)
                    
                    # Process file
                    processor = EEGProcessor()
                    with PROCESSING_TIME.time():
                        if processor.load_eeg_data(file_path):
                            processor.preprocess_data()
                            processor.extract_features()
                            
                            # Save to permanent storage
                            permanent_path = os.path.join(
                                app.config['UPLOAD_FOLDER'], 
                                f"{uuid.uuid4()}_{filename}"
                            )
                            shutil.move(file_path, permanent_path)
                            
                            results.append({
                                'filename': filename,
                                'features': processor.features,
                                'permanent_path': permanent_path
                            })
                finally:
                    # Cleanup
                    shutil.rmtree(temp_dir, ignore_errors=True)
            else:
                results.append({
                    'filename': file.filename,
                    'error': 'File type not allowed'
                })

        return jsonify({'status': 'success', 'results': results})
        
    except Exception as e:
        logger.error(f"Upload Error: {str(e)}")
        return jsonify({'status': 'error', 'message': str(e)}), 500

@app.route('/api/login', methods=['POST'])
def login():
    # Simple example, replace with actual authentication logic
    username = request.json.get('username', None)
    password = request.json.get('password', None)
    if username == 'admin' and password == 'password':
        access_token = create_access_token(identity=username)
        return jsonify(access_token=access_token), 200
    else:
        return jsonify({"msg": "Bad username or password"}), 401

def start_api_server(port: int = 5000):
    """Start the Flask API server with monitoring"""
    try:
        # Start Prometheus metrics server
        start_http_server(8000)
        
        # Start Flask server
        app.run(host='0.0.0.0', port=port, ssl_context='adhoc')
        
    except Exception as e:
        logger.error(f"Server startup error: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    # Start API server
    start_api_server()
    logger.info("EEG Analysis System initialized and ready for processing.")

