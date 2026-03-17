import os
import json
from groq import Groq
from backend.app.core.config import settings

class AIService:
    def __init__(self):
        # GROQ_API_KEY will be loaded from environment variable in production
        self.api_key = settings.GROQ_API_KEY
        self.client = None
        try:
            if self.api_key:
                self.client = Groq(api_key=self.api_key)
                print("Groq client initialized")
            else:
                print("GROQ_API_KEY not found in settings")
        except Exception as e:
            print(f"Failed to initialize Groq client: {e}")
            self.client = None
        self.model = "llama3-70b-8192"
        
        # List of available specializations in our system
        self.available_specializations = [
            "Cardiologist",
            "Neurologist",
            "Gastroenterologist",
            "Orthopedist",
            "Dermatologist",
            "Ophthalmologist",
            "General Practitioner",
            "Pediatrician",
            "Urologist",
            "Gynaecologist"
        ]

    def predict_specialization(self, symptoms: str):
        """
        Predicts doctor specialization based on symptoms text using Groq LLM.
        """
        if not symptoms or len(symptoms.strip()) < 3:
            return {"specialization": "General Practitioner", "confidence": 0.5}
            
        if not self.client:
            # Fallback if API key is missing
            return {"specialization": "General Practitioner", "confidence": 0.5}

        system_prompt = f"""You are a medical triage assistant. Your task is to analyze patient symptoms and recommend the most appropriate medical specialist from the following list:
{', '.join(self.available_specializations)}.

Rules:
1. Always respond in JSON format.
2. The JSON must contain exactly two keys: 'specialization' (string) and 'confidence' (float between 0 and 1).
3. If multiple specialists could apply, choose the most relevant primary one.
4. If the symptoms are vague, choose 'General Practitioner'.
5. Only use specializations from the provided list.
"""
        # scikit-learn removed for lighter deployment

        try:
            chat_completion = self.client.chat.completions.create(
                messages=[
                    {"role": "system", "content": system_prompt},
                    {"role": "user", "content": f"Symptoms: {symptoms}"}
                ],
                model=self.model,
                response_format={"type": "json_object"}
            )
            
            result = json.loads(chat_completion.choices[0].message.content)
            
            # Basic validation
            if result.get("specialization") not in self.available_specializations:
                result["specialization"] = "General Practitioner"
                
            return {
                "specialization": result.get("specialization", "General Practitioner"),
                "confidence": result.get("confidence", 0.8)
            }
        except Exception as e:
            print(f"Groq AI Error: {e}")
            return {"specialization": "General Practitioner", "confidence": 0.5}

    def calculate_wait_time(self, queue_length: int, avg_consultation_time: int, current_hour: int):
        """
        Predicts wait time using a simplified domain calculation.
        """
        hour_impact = 1.0
        if 8 <= current_hour <= 10: # Morning rush
            hour_impact = 1.2
        elif 16 <= current_hour <= 18: # Evening rush
            hour_impact = 1.1

        base_prediction = queue_length * avg_consultation_time * hour_impact
        return int(round(base_prediction))

ai_service = AIService()
