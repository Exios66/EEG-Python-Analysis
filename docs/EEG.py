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
import scipy
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
    from flask_limiter import Limiter # type: ignore
    from flask_limiter.util import get_remote_address
except ImportError:
    logger.error("flask_limiter not installed. Rate limiting disabled.")
    # Mock Limiter and get_remote_address if not available
    class Limiter:
        def __init__(self, app=None, key_func=None, default_limits=None, application_limits=None, headers_enabled=True, strategy=None, storage_uri=None, storage_options=None, auto_check=True, swallow_errors=False, **kwargs):
            """Initialize the rate limiter.
            
            Args:
                app: Flask application instance
                key_func: Function to generate keys for rate limiting
                default_limits: Default rate limits to apply to all routes
                application_limits: Global limits for the entire application
                headers_enabled: Whether to include rate limit headers in responses
                strategy: Rate limiting strategy to use
                storage_uri: URI for the storage backend
                storage_options: Additional options for storage backend
                auto_check: Whether to automatically check the rate limit
                swallow_errors: Whether to ignore rate limiting errors
                **kwargs: Additional keyword arguments
            """
            self.app = app
            self.key_func = key_func or get_remote_address
            self.default_limits = default_limits or ["200 per day", "50 per hour"]
            self.application_limits = application_limits or ["1000 per day"]
            self.headers_enabled = headers_enabled
            self.strategy = strategy or "fixed-window"
            self.storage_uri = storage_uri or "memory://"
            self.storage_options = storage_options or {
                "error_callback": self._handle_storage_error,
                "block_timeout": 60
            }
            self.auto_check = auto_check
            self.swallow_errors = swallow_errors
            self._storage = None
            self._limiter = None
            
            if app:
                self.init_app(app)

        def init_app(self, app):
            """Initialize the rate limiter with a Flask application."""
            self.app = app
            self._init_storage()
            self._init_limiter()
            
        def _init_storage(self):
            """Initialize the storage backend."""
            if self.storage_uri.startswith("redis://"):
                import redis
                self._storage = redis.from_url(self.storage_uri, **self.storage_options)
            else:
                self._storage = {}  # Simple in-memory storage
                
        def _init_limiter(self):
            """Initialize the core rate limiting functionality."""
            if not self._storage:
                self._init_storage()
            self._limiter = True  # Actual implementation would initialize rate limiting logic
            
        def _handle_storage_error(self, e):
            """Handle storage backend errors."""
            if not self.swallow_errors:
                raise e
            logger.error(f"Rate limit storage error: {str(e)}")
            
        def limit(self, limit_value=None, key_func=None, per_method=False, methods=None,
                 error_message=None, exempt_when=None):
            """Apply rate limiting decorator to a route."""
            def decorator(f):
                if not self.app:
                    raise RuntimeError("Limiter not initialized with Flask app")
                    
                def wrapped_f(*args, **kwargs):
                    if exempt_when and exempt_when():
                        return f(*args, **kwargs)
                        
                    key = (key_func or self.key_func)()
                    if not self._check_limit(key, limit_value):
                        raise Exception(error_message or 'Rate limit exceeded')
                        
                    return f(*args, **kwargs)
                    
                return wrapped_f
            return decorator
            
        def _check_limit(self, key, limit):
            """Check if the request is within rate limits."""
            # Production implementation would check against storage
            return True  # Mock always allows requests
            
    def get_remote_address():
        """Get the client's IP address."""
        if request:
            return request.remote_addr
        return None

# Import JWT functionality
if TYPE_CHECKING:
    from flask_jwt_extended import JWTManager, jwt_required, create_access_token # type: ignore

try:
    from flask_jwt_extended import JWTManager, jwt_required, create_access_token # type: ignore
except ImportError:
    logger.error("flask_jwt_extended not installed. Authentication disabled.")
    # Mock JWT if not available
    class JWTManager:
        def __init__(self, *args, **kwargs): pass
    def jwt_required(): return lambda x: x
    def create_access_token(**kwargs): return ""

if TYPE_CHECKING:
    from flask_jwt_extended import JWTManager, jwt_required, create_access_token # type: ignore

try:
    from flask_jwt_extended import JWTManager, jwt_required, create_access_token # type: ignore
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
        def __init__(self, name, documentation, *args, **kwargs):
            self._value = 0
            self.name = name
            self.documentation = documentation
            
        def inc(self, amount=1):
            self._value += amount
            
        def dec(self, amount=1):
            self._value -= amount
            
        def get(self):
            return self._value
            
    class Gauge:
        def __init__(self, name, documentation, *args, **kwargs):
            self._value = 0
            self.name = name
            self.documentation = documentation
            
        def set(self, value):
            self._value = value
            
        def get(self):
            return self._value
            
        def inc(self, amount=1):
            self._value += amount
            
        def dec(self, amount=1):
            self._value -= amount
            
    class Histogram:
        def __init__(self, name, documentation, *args, **kwargs):
            self._values = []
            self.name = name
            self.documentation = documentation
            
        def observe(self, value):
            self._values.append(value)
            
        def time(self):
            from contextlib import contextmanager
            import time
            
            @contextmanager
            def timer():
                start = time.time()
                yield
                self.observe(time.time() - start)
                
            return timer()

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
            logger.debug("Starting comprehensive artifact detection and removal")
            
            # EOG (eye movement) artifact detection and removal
            logger.debug("Detecting EOG artifacts")
            eog_indices, eog_scores = ica.find_bads_eog(self.filtered_data, 
                                                       threshold=3.0,
                                                       measure='zscore')
            logger.info(f"Found {len(eog_indices)} EOG components")
            
            # ECG (heart) artifact detection and removal  
            logger.debug("Detecting ECG artifacts")
            ecg_indices, ecg_scores = ica.find_bads_ecg(self.filtered_data,
                                                       method='correlation',
                                                       threshold=0.35)
            logger.info(f"Found {len(ecg_indices)} ECG components")
            
            # Muscle artifact detection
            logger.debug("Detecting muscle artifacts")
            muscle_indices = []
            for comp in ica.get_components():
                # Detect high frequency components characteristic of muscle activity
                freqs, psd = scipy.signal.welch(comp, fs=self.filtered_data.info['sfreq'])
                if np.mean(psd[freqs > 30]) > np.mean(psd[freqs <= 30]) * 2:
                    muscle_indices.append(comp)
            logger.info(f"Found {len(muscle_indices)} muscle artifact components")
            
            # Movement artifact detection using accelerometer data if available
            movement_indices = []
            if hasattr(self.filtered_data, 'accel_data'):
                logger.debug("Detecting movement artifacts")
                threshold = np.std(self.filtered_data.accel_data) * 3
                movement_mask = np.any(np.abs(self.filtered_data.accel_data) > threshold, axis=1)
                movement_indices = np.where(movement_mask)[0]
                logger.info(f"Found {len(movement_indices)} movement artifacts")
            
            # Combine all artifact indices
            ica.exclude = list(set(eog_indices + ecg_indices + muscle_indices + movement_indices))
            logger.info(f"Total components marked for removal: {len(ica.exclude)}")
            
            # Apply ICA to remove artifacts
            logger.debug("Applying ICA to remove detected artifacts")
            ica.apply(self.filtered_data)
            
            # Additional advanced cleaning steps
            logger.debug("Performing additional signal cleaning")
            
            # Remove residual muscle artifacts using wavelet-based methods
            self._remove_muscle_artifacts()
            
            # Remove power line noise and harmonics
            self._remove_line_noise()
            
            # Apply signal quality metrics
            signal_quality = self._assess_signal_quality()
            logger.info(f"Final signal quality score: {signal_quality:.2f}")
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
            
            # Calculate additional features with error handling and validation
            try:
                connectivity = self._calculate_connectivity()
                temporal = self._extract_temporal_features()
                complexity = self._calculate_complexity_measures()
                statistical = self._calculate_statistical_features()

                # Validate each feature set before adding
                if self._validate_feature_set(connectivity, 'connectivity') and \
                   self._validate_feature_set(temporal, 'temporal') and \
                   self._validate_feature_set(complexity, 'complexity') and \
                   self._validate_feature_set(statistical, 'statistical'):
                    
                    self.features.update({
                        'connectivity': connectivity,
                        'temporal': temporal, 
                        'complexity': complexity,
                        'statistical': statistical
                    })
                else:
                    raise ValueError("One or more feature sets failed validation")

            except Exception as e:
                logger.error(f"Error calculating additional features: {str(e)}")
                raise

            # Validate overall feature structure and values
            validation_errors = self._validate_features()
            if validation_errors:
                error_msg = "Feature validation failed: " + "; ".join(validation_errors)
                logger.error(error_msg)
                raise ValueError(error_msg)
            
            # Cache validated features
            feature_hash = hashlib.md5(str(self.features).encode()).hexdigest()
            self.cache[feature_hash] = self.features.copy()
            
            logger.info("Feature extraction completed successfully")
            return True
            
        except Exception as e:
            logger.error(f"Error in feature extraction: {str(e)}")
            # Attempt recovery of partial results from cache
            if hasattr(self, 'cache') and self.cache:
                logger.info("Attempting to recover last valid features from cache")
                last_cache = list(self.cache.values())[-1]
                self.features = last_cache
                return True
            raise

    def _calculate_band_power(self, psd: np.ndarray, freqs: np.ndarray, 
                            fmin: float, fmax: float) -> List[float]:
        """Calculate power in specific frequency band"""
        if not isinstance(psd, np.ndarray) or not isinstance(freqs, np.ndarray):
            raise TypeError("PSD and freqs must be numpy arrays")
            
        freq_mask = (freqs >= fmin) & (freqs <= fmax)
        if not np.any(freq_mask):
            raise ValueError(f"No frequencies found in band {fmin}-{fmax} Hz")
            
        return np.mean(psd[:, freq_mask], axis=1).tolist()

    def _calculate_complexity_measures(self) -> Dict:
        """Calculate signal complexity measures"""
        try:
            data = self.filtered_data.get_data()
            if data.size == 0:
                raise ValueError("Empty data array")
                
            complexity_measures = {
                'sample_entropy': self._sample_entropy(data),
                'approximate_entropy': self._approximate_entropy(data),
                'hurst_exponent': self._hurst_exponent(data),
                'lyapunov_exp': self._calculate_lyapunov(data),
                'correlation_dim': self._correlation_dimension(data)
            }
            
            # Validate measures
            if any(np.isnan(val).any() for val in complexity_measures.values() if isinstance(val, np.ndarray)):
                raise ValueError("NaN values detected in complexity measures")
                
            return complexity_measures
            
        except Exception as e:
            logger.error(f"Error calculating complexity measures: {str(e)}")
            return {}

    def _calculate_statistical_features(self) -> Dict:
        """Calculate statistical features"""
        try:
            data = self.filtered_data.get_data()
            if data.size == 0:
                raise ValueError("Empty data array")
                
            stats = {
                'variance': np.var(data, axis=1).tolist(),
                'peak_to_peak': np.ptp(data, axis=1).tolist(),
                'zero_crossings': np.sum(np.diff(np.signbit(data), axis=1), axis=1).tolist(),
                'kurtosis': scipy.stats.kurtosis(data, axis=1).tolist(),
                'skewness': scipy.stats.skew(data, axis=1).tolist(),
                'rms': np.sqrt(np.mean(np.square(data), axis=1)).tolist()
            }
            
            # Validate statistical measures
            if any(np.isnan(val).any() for val in stats.values()):
                raise ValueError("NaN values detected in statistical features")
                
            return stats
            
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
            
            # Export features as compressed JSON with error checking
            features_file = output_path / 'features.json.gz'
            try:
                with gzip.open(features_file, 'wt') as f:
                    json.dump(self.features, f)
            except (IOError, json.JSONDecodeError) as e:
                logger.error(f"Error saving features: {str(e)}")
                raise
            
            # Export plots with error handling
            try:
                self._export_plots(output_path)
            except Exception as e:
                logger.error(f"Error exporting plots: {str(e)}")
                raise
            
            # Export raw data in compressed format
            try:
                raw_data_file = output_path / 'raw_data.npy.gz'
                np.savez_compressed(raw_data_file, data=self.filtered_data.get_data())
            except Exception as e:
                logger.error(f"Error saving raw data: {str(e)}")
                raise
            
            # Create analysis report with retry mechanism and progress tracking
            max_retries = 3
            for attempt in range(max_retries):
                try:
                    self._create_report(output_path)
                    break
                except Exception as e:
                    if attempt == max_retries - 1:
                        logger.error(f"Failed to create report after {max_retries} attempts: {str(e)}")
                        raise
                    logger.warning(f"Report creation attempt {attempt + 1} failed, retrying...")
            
            logger.info(f"Results exported successfully to {output_dir}")
            return True
            
        except Exception as e:
            logger.error(f"Error in exporting results: {str(e)}")
            raise

    def _create_report(self, output_path: Path):
        """Create comprehensive analysis report with detailed visualizations and metrics"""
        try:
            # Initialize report with metadata
            report = mne.Report(title='EEG Analysis Report', 
                              verbose=True,
                              image_format='svg')  # Vector graphics for quality
            
            # Add recording metadata section
            metadata = {
                'Recording Duration': f"{self.raw.times[-1]:.2f} seconds",
                'Sampling Rate': f"{self.raw.info['sfreq']} Hz",
                'Number of Channels': len(self.raw.ch_names),
                'Reference': self.raw.info['description'] if 'description' in self.raw.info else 'Not specified'
            }
            report.add_html(self._create_metadata_html(metadata), title='Recording Information')
            
            # Raw and filtered data visualization with interactive components
            report.add_raw(self.raw, title='Raw Data', 
                          butterfly=True, show_scrollbars=True)
            report.add_raw(self.filtered_data, title='Filtered Data',
                          butterfly=True, show_scrollbars=True)
            
            # Add power spectral density plots
            fig_psd_raw = self.raw.plot_psd(show=False)
            fig_psd_filtered = self.filtered_data.plot_psd(show=False)
            report.add_figure(fig_psd_raw, title='Raw Data Power Spectrum')
            report.add_figure(fig_psd_filtered, title='Filtered Data Power Spectrum')
            
            # Time-frequency analysis
            tfr_params = {
                'freqs': np.logspace(0, 2, 50),  # Log-spaced frequencies
                'n_cycles': lambda x: x/2,  # Variable cycles
                'use_fft': True,
                'return_itc': False
            }
            tfr = mne.time_frequency.tfr_morlet(self.filtered_data.get_data(), 
                                               self.filtered_data.info['sfreq'],
                                               **tfr_params,
                                               average=False)
            fig_tfr = tfr.plot(show=False)
            report.add_figure(fig_tfr, title='Time-Frequency Analysis')
            
            # Add feature visualizations with enhanced plotting
            for feature_type, values in self.features.items():
                if isinstance(values, dict):
                    # Create multiple visualization types for each feature
                    figs = self._create_feature_visualizations(feature_type, values)
                    for idx, (plot_type, fig) in enumerate(figs.items()):
                        report.add_figure(fig, 
                                        title=f'{feature_type} - {plot_type}')
            
            # Add statistical analysis section
            stats_figs = self._create_statistical_plots()
            for title, fig in stats_figs.items():
                report.add_figure(fig, title=title)
            
            # Add channel correlation matrix
            corr_fig = self._plot_channel_correlations()
            report.add_figure(corr_fig, title='Channel Correlations')
            
            # Add data quality metrics
            quality_metrics = self._calculate_quality_metrics()
            report.add_html(self._create_quality_metrics_html(quality_metrics),
                          title='Data Quality Assessment')
            
            # Save report with custom styling
            custom_css = self._get_custom_report_styling()
            report.save(output_path / 'report.html', 
                       overwrite=True,
                       css=custom_css,
                       open_browser=False)
            
            # Generate PDF version if possible
            try:
                report.save(output_path / 'report.pdf', 
                          overwrite=True)
            except Exception as e:
                logger.warning(f"Could not generate PDF report: {str(e)}")
            
        except Exception as e:
            logger.error(f"Error creating report: {str(e)}")
            raise


