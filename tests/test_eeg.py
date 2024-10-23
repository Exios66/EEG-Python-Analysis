import os
import pytest
import numpy as np
from unittest.mock import patch, MagicMock
from werkzeug.security import generate_password_hash
from EEG import app, process_eeg_data, User, EEGData, db

@pytest.fixture
def client():
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'
    with app.test_client() as client:
        with app.app_context():
            db.create_all()
        yield client
        with app.app_context():
            db.drop_all()

@pytest.fixture
def auth_client(client):
    with app.app_context():
        user = User(
            username='testuser',
            email='test@test.com',
            password=generate_password_hash('password123')
        )
        db.session.add(user)
        db.session.commit()
        
    client.post('/login', data={
        'username': 'testuser',
        'password': 'password123'
    })
    return client

def test_process_eeg_data_file_not_found():
    with pytest.raises(ValueError, match="EEG file not found"):
        process_eeg_data('nonexistent_file.edf')

def test_process_eeg_data_invalid_format():
    with open('test.txt', 'w') as f:
        f.write('invalid data')
    
    with pytest.raises(ValueError, match="Invalid EEG file format"):
        process_eeg_data('test.txt')
    
    os.remove('test.txt')

@patch('EEG.mne.io.read_raw_edf')
def test_process_eeg_data_success(mock_read_raw):
    # Mock EEG data
    mock_data = np.random.rand(10, 1000)
    mock_raw = MagicMock()
    mock_raw.get_data.return_value = mock_data
    mock_raw.info = {'sfreq': 250, 'ch_names': ['EEG1', 'EEG2']}
    mock_read_raw.return_value = mock_raw

    result = process_eeg_data('valid.edf')
    
    assert isinstance(result, dict)
    assert 'data' in result
    assert 'sampling_rate' in result
    assert 'channel_names' in result
    assert result['sampling_rate'] == 250
    np.testing.assert_array_equal(result['data'], mock_data)

def test_get_eeg_data_unauthorized(client):
    response = client.get('/api/eeg-data')
    assert response.status_code == 401

def test_get_eeg_data_no_data(auth_client):
    response = auth_client.get('/api/eeg-data')
    assert response.status_code == 404
    assert b'No EEG data found' in response.data

def test_get_eeg_data_success(auth_client):
    # Add test EEG data to database
    with app.app_context():
        eeg_data = EEGData(
            user_id=1,
            data=np.random.rand(10, 1000).tolist(),
            sampling_rate=250,
            channel_names=['EEG1', 'EEG2']
        )
        db.session.add(eeg_data)
        db.session.commit()

    response = auth_client.get('/api/eeg-data')
    assert response.status_code == 200
    data = response.get_json()
    assert 'data' in data
    assert 'sampling_rate' in data
    assert 'channel_names' in data
    assert data['sampling_rate'] == 250

def test_upload_eeg_data(auth_client):
    with open('test.edf', 'wb') as f:
        f.write(b'dummy eeg data')
    
    response = auth_client.post('/api/upload-eeg', data={
        'file': (open('test.edf', 'rb'), 'test.edf')
    })
    
    os.remove('test.edf')
    assert response.status_code == 200
    data = response.get_json()
    assert 'message' in data
    assert data['message'] == 'EEG data uploaded successfully'
