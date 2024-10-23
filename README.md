# EEG Analysis and Visualization Platform

![GitHub Pages](https://github.com/Exios66/EEG-Python-Analysis/actions/workflows/pages/pages-build-deployment/badge.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/node-14%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-17.0%2B-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/flask-2.0%2B-000000.svg?logo=flask)](https://flask.palletsprojects.com/)
[![MNE](https://img.shields.io/badge/MNE-Python-blue.svg)](https://mne.tools/stable/index.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## Features

- Advanced EEG data processing and analysis
- Real-time visualization
- Interactive analysis controls
- Support for multiple EEG file formats
- Comprehensive feature extraction
- Statistical analysis capabilities
- Modern web-based interface

## System Requirements

- Python 3.8+
- Node.js 14+
- npm 6+

## Installation

### Backend Setup

1. Create a Python virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Install Python dependencies:

```bash
pip install -r requirements.txt
```

### Frontend Setup

1. Navigate to the frontend directory:

```bash
cd frontend
```

2. Install Node.js dependencies:

```bash
npm install
```

## Usage

### Starting the Backend Server

1. Activate the Python virtual environment:

```bash
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

2. Start the Flask server:

```bash
python EEG.py
```

The backend server will start on <http://localhost:5000>

### Starting the Frontend Application

1. In a new terminal, navigate to the frontend directory:

```bash
cd frontend
```

2. Start the development server:

```bash
npm start
```

The frontend application will start on <http://localhost:3000>

## Analysis Pipeline

The platform implements a comprehensive EEG analysis pipeline:

1. **Data Loading**
   - Support for multiple EEG file formats (.edf, .fif, .set)
   - Automatic format detection
   - Data validation

2. **Preprocessing**
   - Bandpass filtering (configurable frequency range)
   - Notch filtering for power line noise
   - Bad channel detection and interpolation
   - ICA-based artifact removal

3. **Feature Extraction**
   - Spectral analysis (band powers)
   - Temporal features
   - Connectivity metrics
   - Statistical measures

4. **Visualization**
   - Raw signal plots
   - Processed signal visualization
   - Spectral analysis plots
   - Interactive data exploration
   - Real-time updates

## API Endpoints

The backend provides the following REST API endpoints:

- `POST /api/process`
  - Process uploaded EEG data
  - Parameters:
    - file_path: Path to the EEG data file
    - settings: Processing parameters

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support and questions, please open an issue in the GitHub repository.

## Acknowledgments

- MNE Python for EEG processing capabilities
- React for the frontend framework
- Chart.js for visualization components
