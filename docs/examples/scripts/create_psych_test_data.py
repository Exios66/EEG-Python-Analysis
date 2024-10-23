import numpy as np
import pandas as pd
from scipy import stats
import os
import datetime
from faker import Faker

# Create directories
os.makedirs('examples/raw_data', exist_ok=True)
os.makedirs('examples/processed_data', exist_ok=True)

# Set random seed for reproducibility
np.random.seed(42)
fake = Faker()
Faker.seed(42)

def generate_demographics(n_participants):
    """Generate realistic demographic data"""
    demographics = []
    for _ in range(n_participants):
        age = np.random.normal(35, 12)  # Age distribution centered at 35
        age = max(18, min(80, int(age)))  # Clip between 18-80
        gender = np.random.choice(['M', 'F', 'Other'], p=[0.48, 0.48, 0.04])
        education = np.random.choice([
            'High School', 'Some College', 'Bachelor\'s', 
            'Master\'s', 'Doctorate'
        ], p=[0.25, 0.2, 0.35, 0.15, 0.05])
        demographics.append({
            'Age': age,
            'Gender': gender,
            'Education': education
        })
    return pd.DataFrame(demographics)

def generate_personality_data(n_participants=2000, n_items=100):
    """Generate Big Five personality inventory data with realistic correlations"""
    # Define trait clusters (items that should correlate)
    traits = {
        'Extraversion': list(range(0, 20)),
        'Agreeableness': list(range(20, 40)),
        'Conscientiousness': list(range(40, 60)),
        'Neuroticism': list(range(60, 80)),
        'Openness': list(range(80, 100))
    }
    
    # Generate base random data
    data = np.random.normal(0, 1, (n_participants, n_items))
    
    # Add correlations within trait clusters
    for trait_items in traits.values():
        base = np.random.normal(0, 1, n_participants)
        for item in trait_items:
            data[:, item] = 0.7 * base + 0.3 * data[:, item]
    
    # Convert to 1-5 scale
    data = stats.norm.cdf(data) * 4 + 1
    data = np.round(data)
    
    # Create DataFrame
    columns = [f'Item_{i+1}' for i in range(n_items)]
    df = pd.DataFrame(data, columns=columns)
    
    # Add participant info
    df['Participant_ID'] = [fake.uuid4() for _ in range(n_participants)]
    demographics = generate_demographics(n_participants)
    df = pd.concat([df, demographics], axis=1)
    
    # Add timestamp and completion time
    base_date = datetime.datetime(2023, 1, 1)
    df['Timestamp'] = [base_date + datetime.timedelta(minutes=i*30) for i in range(n_participants)]
    df['Completion_Time_Sec'] = np.random.normal(900, 180, n_participants).round()  # ~15 min average
    
    return df

def generate_cognitive_data(n_participants=1500):
    """Generate cognitive test data with realistic patterns and correlations"""
    # Base cognitive ability factor
    g_factor = np.random.normal(0, 1, n_participants)
    
    # Generate correlated cognitive scores
    data = {
        'Participant_ID': [fake.uuid4() for _ in range(n_participants)],
        'Verbal_Reasoning': (0.7 * g_factor + 0.3 * np.random.normal(0, 1, n_participants)) * 15 + 100,
        'Numerical_Reasoning': (0.7 * g_factor + 0.3 * np.random.normal(0, 1, n_participants)) * 15 + 100,
        'Abstract_Reasoning': (0.7 * g_factor + 0.3 * np.random.normal(0, 1, n_participants)) * 15 + 100,
        'Processing_Speed': (0.5 * g_factor + 0.5 * np.random.normal(0, 1, n_participants)) * 15 + 100,
        'Working_Memory': (0.6 * g_factor + 0.4 * np.random.normal(0, 1, n_participants)) * 15 + 100
    }
    
    df = pd.DataFrame(data)
    demographics = generate_demographics(n_participants)
    df = pd.concat([df, demographics], axis=1)
    
    # Add response times and error rates
    df['Mean_Response_Time_ms'] = np.random.gamma(shape=30, scale=20, size=n_participants)
    df['Error_Rate'] = stats.beta.rvs(2, 12, size=n_participants)
    
    # Add testing conditions
    df['Testing_Environment'] = np.random.choice(
        ['Lab', 'Remote', 'Clinical'], 
        size=n_participants, 
        p=[0.4, 0.4, 0.2]
    )
    
    return df

def generate_psychometric_calculator_data(n_scores=1000):
    """Generate diverse test score distributions for calculator testing"""
    # Generate mixture of distributions to simulate different test scenarios
    distributions = [
        # Normal distribution (standard case)
        np.random.normal(75, 10, n_scores // 3),
        # Bimodal distribution (e.g., distinct groups)
        np.concatenate([
            np.random.normal(60, 8, n_scores // 6),
            np.random.normal(85, 8, n_scores // 6)
        ]),
        # Skewed distribution (e.g., ceiling/floor effects)
        stats.skewnorm.rvs(5, loc=70, scale=15, size=n_scores // 3)
    ]
    
    scores = np.concatenate(distributions)
    np.random.shuffle(scores)
    scores = np.clip(scores, 0, 100).round(2)
    
    df = pd.DataFrame({
        'Scores': scores,
        'Test_Type': np.random.choice(
            ['Aptitude', 'Achievement', 'Placement'], 
            size=len(scores),
            p=[0.4, 0.4, 0.2]
        ),
        'Administration_Date': [
            fake.date_between(start_date='-1y', end_date='today') 
            for _ in range(len(scores))
        ]
    })
    
    return df

# Generate and save all data
personality_data = generate_personality_data()
personality_data.to_csv('examples/raw_data/personality_test_data.csv', index=False)
personality_data.describe().to_csv('examples/processed_data/personality_test_summary.csv')

cognitive_data = generate_cognitive_data()
cognitive_data.to_csv('examples/raw_data/cognitive_test_data.csv', index=False)
cognitive_data.describe().to_csv('examples/processed_data/cognitive_test_summary.csv')

calculator_data = generate_psychometric_calculator_data()
calculator_data.to_csv('examples/raw_data/psychometric_calculator_data.csv', index=False)
calculator_data.describe().to_csv('examples/processed_data/calculator_data_summary.csv')

print("Psychological test data files have been created:")
print("\nRaw data files in 'examples/raw_data/':")
print("- personality_test_data.csv")
print("- cognitive_test_data.csv") 
print("- psychometric_calculator_data.csv")
print("\nSummary statistics in 'examples/processed_data/'")
print("\nExample scores from psychometric calculator data:")
print(f"Scores: {', '.join(map(str, calculator_data['Scores'].head(10)))}")
print("(showing first 10 scores)")
