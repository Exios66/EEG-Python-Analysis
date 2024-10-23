import numpy as np
import pandas as pd
import mne

# Create synthetic EEG data
sfreq = 256  # Sampling frequency in Hz
t = np.arange(0, 10, 1/sfreq)  # 10 seconds of data
n_channels = 8
channel_names = ['Fp1', 'Fp2', 'F3', 'F4', 'C3', 'C4', 'O1', 'O2']

# Generate synthetic signals
def create_synthetic_eeg():
    # Base signal (alpha rhythm at 10 Hz)
    alpha = np.sin(2 * np.pi * 10 * t)
    
    # Add other frequency components
    theta = 0.5 * np.sin(2 * np.pi * 6 * t)  # theta rhythm
    beta = 0.3 * np.sin(2 * np.pi * 20 * t)  # beta rhythm
    
    # Add noise
    noise = 0.1 * np.random.randn(len(t))
    
    return alpha + theta + beta + noise

# Create data for each channel
data = np.array([create_synthetic_eeg() for _ in range(n_channels)])

# Create MNE RawArray object
info = mne.create_info(ch_names=channel_names, sfreq=sfreq, ch_types='eeg')
raw = mne.io.RawArray(data, info)

# Save as CSV
df = pd.DataFrame(data.T, columns=channel_names)
df.insert(0, 'Time', t)
df.to_csv('examples/raw_eeg_data.csv', index=False)

# Create events data
events = pd.DataFrame({
    'Time': [1, 3, 5, 7, 9],
    'Event_Type': ['Stimulus', 'Response', 'Stimulus', 'Response', 'Stimulus'],
    'Event_Value': [1, 1, 2, 2, 3]
})
events.to_csv('examples/events.csv', index=False)

# Create channel info
channel_info = pd.DataFrame({
    'Channel': channel_names,
    'Type': ['EEG'] * n_channels,
    'Unit': ['uV'] * n_channels,
    'Reference': ['Cz'] * n_channels
})
channel_info.to_csv('examples/channel_info.csv', index=False)

# Create preprocessing parameters
preprocessing_params = pd.DataFrame({
    'Parameter': ['lowcut', 'highcut', 'notch_freq', 'resample_freq'],
    'Value': [1.0, 40.0, 50.0, 256.0],
    'Unit': ['Hz', 'Hz', 'Hz', 'Hz']
})
preprocessing_params.to_csv('examples/preprocessing_params.csv', index=False)

# Create artifact annotations
artifacts = pd.DataFrame({
    'Start_Time': [0.5, 2.5, 4.5],
    'End_Time': [1.0, 3.0, 5.0],
    'Type': ['Blink', 'Movement', 'Muscle'],
    'Channel': ['Fp1', 'All', 'C3']
})
artifacts.to_csv('examples/artifacts.csv', index=False)

# Create feature extraction parameters
feature_params = pd.DataFrame({
    'Feature': ['delta', 'theta', 'alpha', 'beta', 'gamma'],
    'Min_Freq': [0.5, 4, 8, 13, 30],
    'Max_Freq': [4, 8, 13, 30, 45],
    'Method': ['bandpower'] * 5
})
feature_params.to_csv('examples/feature_params.csv', index=False)

# Create example extracted features
times = np.arange(0, 10, 0.5)  # Feature values every 0.5 seconds
features = pd.DataFrame({
    'Time': times,
    'delta_power': np.random.rand(len(times)),
    'theta_power': np.random.rand(len(times)),
    'alpha_power': np.random.rand(len(times)),
    'beta_power': np.random.rand(len(times)),
    'gamma_power': np.random.rand(len(times))
})
features.to_csv('examples/extracted_features.csv', index=False)

# Create connectivity matrix
connectivity = pd.DataFrame(
    np.random.rand(len(channel_names), len(channel_names)),
    columns=channel_names,
    index=channel_names
)
connectivity.to_csv('examples/connectivity.csv')

# Create statistical measures
stats = pd.DataFrame({
    'Channel': channel_names,
    'Mean': np.random.rand(n_channels),
    'Std': np.random.rand(n_channels),
    'Kurtosis': np.random.rand(n_channels),
    'Skewness': np.random.rand(n_channels),
    'Line_Noise': np.random.rand(n_channels),
    'Signal_Quality': np.random.rand(n_channels)
})
stats.to_csv('examples/statistics.csv', index=False)