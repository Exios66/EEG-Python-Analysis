# EEG Visualization App

![GitHub Pages](https://github.com/Exios66/EEG-Python-Analysis/actions/workflows/pages/pages-build-deployment/badge.svg)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Python](https://img.shields.io/badge/python-3.8%2B-blue.svg)](https://www.python.org/downloads/)
[![Node.js](https://img.shields.io/badge/node-14%2B-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/react-17.0%2B-61DAFB.svg?logo=react)](https://reactjs.org/)
[![Flask](https://img.shields.io/badge/flask-2.0%2B-000000.svg?logo=flask)](https://flask.palletsprojects.com/)
[![MNE](https://img.shields.io/badge/MNE-Python-blue.svg)](https://mne.tools/stable/index.html)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](http://makeapullrequest.com)

## EEG Visualization App

## Overview

The EEG Visualization App is a comprehensive, user-friendly platform that integrates EEG data analysis with real-time visualization. It is designed to provide researchers, clinicians, and developers with an intuitive interface to preprocess, analyze, and visualize EEG data. This application leverages the power of Python, Node.js, React, and Flask to create a seamless and efficient workflow for EEG signal processing, offering both backend and frontend functionalities.

### Key Technologies:

	•	Python 3.8+: Used for backend data processing and EEG analysis.
	•	Node.js 14+: Enables the modern frontend and backend integration with real-time functionality.
	•	React 17.0+: Powers the dynamic and interactive user interface.
	•	Flask 2.0+: Facilitates a lightweight and scalable backend server.
	•	MNE-Python: A robust library for EEG processing, used for signal preprocessing, feature extraction, and artifact removal.

### Features

	•	Advanced EEG Data Processing: Seamlessly process large-scale EEG datasets with various analysis methods, including artifact removal and feature extraction.
	•	Real-Time Data Visualization: View live updates as EEG data is processed, offering a real-time perspective on data trends and findings.
	•	Interactive Analysis Controls: Adjust processing parameters and visual settings directly from the interface, allowing users to explore the data interactively.
	•	Multi-Format EEG Support: Upload and analyze EEG data from diverse file formats, such as .edf, .fif, and .set.
	•	Statistical Analysis: Generate statistical summaries, including spectral analysis and temporal features, to extract meaningful insights.
	•	Web-Based Interface: A clean, responsive interface accessible through modern web browsers, requiring no additional software installations.

System Requirements

The following components must be installed to run the EEG Visualization App:

Backend Requirements:

	•	Python: Version 3.8 or higher
	•	Flask: Version 2.0 or higher
	•	MNE-Python for EEG processing

Frontend Requirements:

	•	Node.js: Version 14 or higher
	•	npm: Version 6 or higher
	•	React: Version 17.0 or higher

Additional Tools:

	•	Modern web browser (Chrome, Firefox, Edge)

Installation

Follow these steps to install and configure both the backend and frontend components.

Backend Setup

	1.	Create a Python Virtual Environment:
	•	A virtual environment isolates Python dependencies from the global environment, ensuring compatibility.

python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate


	2.	Install Python Dependencies:
	•	Dependencies include Flask, MNE-Python, and other necessary libraries.

pip install -r requirements.txt



Frontend Setup

	1.	Navigate to the Frontend Directory:
	•	Move to the frontend directory to set up the web interface.

cd frontend


	2.	Install Node.js Dependencies:
	•	Install the required JavaScript libraries and packages for React.

npm install



Usage

This section details how to run the application after setup.

Starting the Backend Server

	1.	Activate the Python Virtual Environment:
	•	Ensure that the environment is active before starting the server.

source venv/bin/activate  # On Windows: venv\Scripts\activate


	2.	Run the Flask Backend:
	•	This starts the server to handle EEG data processing requests.

python EEG.py

	•	The backend server will run on: http://localhost:5000

Starting the Frontend Application

	1.	Open a New Terminal for the Frontend:
	•	The frontend and backend should run in separate terminals.

cd frontend


	2.	Start the React Development Server:

npm start

	•	The frontend will be accessible via: http://localhost:3000

Analysis Pipeline

This section breaks down the EEG data analysis pipeline in the app:

1. Data Loading:

	•	Supports popular EEG formats such as .edf, .fif, and .set.
	•	Automatically detects file format and validates data integrity before processing.

2. Preprocessing:

	•	Bandpass Filtering: Filters EEG signals within a configurable frequency range.
	•	Notch Filtering: Removes power line noise (e.g., 50/60 Hz) to clean the signal.
	•	Bad Channel Detection: Automatically detects bad channels and replaces them with interpolated data.
	•	Artifact Removal with ICA: Uses Independent Component Analysis (ICA) to eliminate artifacts such as eye movements.

3. Feature Extraction:

	•	Spectral Analysis: Calculates band powers (e.g., alpha, beta, theta waves).
	•	Temporal Features: Extracts time-domain characteristics from the EEG signals.
	•	Connectivity Metrics: Computes metrics such as coherence to assess the connection between different brain regions.
	•	Statistical Measures: Provides basic and advanced statistical summaries of the processed EEG data.

4. Visualization:

	•	Raw Signal Plots: Visualize raw EEG signals before and after preprocessing.
	•	Spectral Analysis Plots: Graphically represent power spectral densities.
	•	Interactive Exploration: Zoom, pan, and select specific time ranges or channels for closer analysis.
	•	Real-Time Updates: See the EEG signal processing results updated in real-time.

### API Endpoints

The backend exposes REST API endpoints for interacting with the app programmatically.

Endpoint: POST /api/process

	•	Description: Process uploaded EEG data and return the analysis results.
	•	Request Parameters:
	•	file_path: The path to the EEG file to be processed.
	•	settings: A JSON object containing user-defined processing parameters (e.g., filter settings, feature extraction options).
	•	Response:
	•	A JSON object with the processed EEG data and feature extraction results.

### Contributing

We welcome contributions from the community! To contribute:

	1.	Fork the Repository:
	•	Clone the repository to your GitHub account.

git clone https://github.com/Exios66/EEG-Python-Analysis.git


	2.	Create a Feature Branch:
	•	Work on a new feature or bug fix within a dedicated branch.

git checkout -b feature-name


	3.	Commit Your Changes:
	•	Ensure your code is well-documented and tested.

git commit -m "Add new feature"


	4.	Push to Your Branch:

git push origin feature-name


	5.	Create a Pull Request:
	•	Submit a Pull Request for review. Include a detailed description of your changes.

### License

This project is licensed under the MIT License. For full details, see the LICENSE file.

### Support

For any questions or issues, please open an issue on the GitHub repository, and we will respond promptly.

Acknowledgments

We would like to thank the following libraries and frameworks that have been integral to the development of this project:

	•	MNE Python: EEG processing library.
	•	React: Frontend framework.
	•	Chart.js: Visualization library.
	•	Flask: Backend web framework.
	•	Material-UI: Frontend component library for React.

## Running Tests

## Frontend Tests

To ensure that the React components are functioning correctly, use the following command to run the test suite:

      npm run test


This project is licensed under the MIT License - see the [LICENSE.md](LICENSE.md) file for details.

## Running Tests

### Frontend Tests
To run the React component tests:

```
npm run test
```
