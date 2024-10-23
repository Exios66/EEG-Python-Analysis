import pytest
from EEG import app, process_eeg_data

@pytest.fixture
def client():
    app.config['TESTING'] = True
    with app.test_client() as client:
        yield client

def test_process_eeg_data():
    with pytest.raises(ValueError, match="EEG file not found"):
        process_eeg_data('nonexistent_file.edf')

def test_get_eeg_data(client):
    response = client.get('/api/eeg-data')
    assert response.status_code == 401  # Unauthorized due to @login_required

# Add more tests as needed
