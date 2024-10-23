from flask import Flask, jsonify, request
from flask_cors import CORS
from flask_socketio import SocketIO, emit
from flask_login import LoginManager, UserMixin, login_user, login_required, current_user
import numpy as np
import mne
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

app = Flask(__name__)
app.config['SECRET_KEY'] = 'your-secret-key'  # Change this to a random secret key
CORS(app)
socketio = SocketIO(app, cors_allowed_origins="*")
login_manager = LoginManager()
login_manager.init_app(app)
limiter = Limiter(app, key_func=get_remote_address)

class User(UserMixin):
    def __init__(self, id):
        self.id = id

@login_manager.user_loader
def load_user(user_id):
    return User(user_id)

@app.route('/login', methods=['POST'])
def login():
    # This is a basic example. In a real application, you'd verify credentials against a database
    username = request.json.get('username')
    password = request.json.get('password')
    if username == 'admin' and password == 'password':
        user = User(username)
        login_user(user)
        return jsonify({'success': True})
    return jsonify({'success': False}), 401

def process_eeg_data(file_path):
    try:
        raw = mne.io.read_raw_edf(file_path, preload=True)
        raw.filter(l_freq=1, h_freq=40)
        data, times = raw[:, :]
        channels = {ch_name: data[i, :].tolist() for i, ch_name in enumerate(raw.ch_names)}
        return {'time': times.tolist(), 'channels': channels}
    except FileNotFoundError:
        raise ValueError("EEG file not found")
    except Exception as e:
        raise ValueError(f"Error processing EEG data: {str(e)}")

@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('process_eeg')
@login_required
def process_eeg(data):
    # Process EEG data in real-time
    # This is a placeholder, replace with actual processing
    processed_data = np.random.rand(10, 100).tolist()
    emit('eeg_data', {'data': processed_data})

@app.route('/api/eeg-data', methods=['GET', 'POST'])
@login_required
@limiter.limit("5 per minute")
def get_eeg_data():
    if request.method == 'POST':
        if 'file' not in request.files:
            return jsonify({'error': 'No file part'}), 400
        file = request.files['file']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        if file:
            try:
                file_path = 'temp_eeg_file.edf'  # Save uploaded file temporarily
                file.save(file_path)
                eeg_data = process_eeg_data(file_path)
                return jsonify(eeg_data)
            except ValueError as e:
                return jsonify({'error': str(e)}), 400
    else:  # GET request
        file_path = 'path/to/your/eeg_file.edf'
        try:
            eeg_data = process_eeg_data(file_path)
            return jsonify(eeg_data)
        except ValueError as e:
            return jsonify({'error': str(e)}), 400
        except Exception as e:
            return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    socketio.run(app, debug=True, ssl_context='adhoc')  # This enables HTTPS
