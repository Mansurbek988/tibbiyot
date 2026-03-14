from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.svm import LinearSVC
from sklearn.pipeline import Pipeline
import numpy as np
import pickle
import os

class AIService:
    def __init__(self):
        # Initial training data for Symptom Triage (Mock dataset for starting)
        self.symptom_data = [
            ("heart hurts chest pain heavy breathing", "Cardiologist"),
            ("headache blurred vision neck pain", "Neurologist"),
            ("stomach ache nausea vomiting digestion", "Gastroenterologist"),
            ("bone break fracture joint pain", "Orthopedist"),
            ("skin rash itchy redness", "Dermatologist"),
            ("blurry eyes vision loss eye pain", "Ophthalmologist"),
            ("cough fever sore throat flu symptoms", "General Practitioner"),
        ]
        
        # Prepare Triage Model
        texts = [d[0] for d in self.symptom_data]
        labels = [d[1] for d in self.symptom_data]
        
        self.triage_pipeline = Pipeline([
            ('tfidf', TfidfVectorizer()),
            ('clf', LinearSVC())
        ])
        self.triage_pipeline.fit(texts, labels)

    def predict_specialization(self, symptoms: str):
        """
        Predicts doctor specialization based on symptoms text.
        """
        if not symptoms or len(symptoms.strip()) < 3:
            return {"specialization": "General Practitioner", "confidence": 0.5}
            
        prediction = self.triage_pipeline.predict([symptoms])[0]
        # LinearSVC doesn't provide easy confidence scores without calibration,
        # so we return a placeholder or use decision_function for more complexity.
        return {
            "specialization": prediction,
            "confidence": 0.85 # Simplified for demo
        }

    def calculate_wait_time(self, queue_length: int, avg_consultation_time: int, current_hour: int):
        """
        Predicts wait time using a simplified regression approach.
        In a real scenario, this would use a GradientBoostingRegressor
        trained on historical appointment data.
        """
        # Feature vector: [Queue Length, Avg Service Time, Hour of Day]
        # Hour of Day weight: morning/evening might be slower or faster
        hour_impact = 1.0
        if 8 <= current_hour <= 10: # Morning rush
            hour_impact = 1.2
        elif 16 <= current_hour <= 18: # Evening rush
            hour_impact = 1.1

        base_prediction = queue_length * avg_consultation_time * hour_impact
        
        # Adding a bit of "noise" to simulate complexity
        simulated_prediction = base_prediction * np.random.uniform(0.9, 1.1)
        
        return int(round(simulated_prediction))

ai_service = AIService()
