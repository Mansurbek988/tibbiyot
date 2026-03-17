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
        self.model = "llama-3.3-70b-versatile"
        
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

        system_prompt = f"""Siz malakali tibbiy triage yordamchisiz. Bemor yozgan simptomlarni tahlil qiling va quyidagi shifokorlar ro'yxatidan eng mosini tanlang:
{', '.join(self.available_specializations)}.

Qoidalar:
1. FAQAT JSON formatida javob bering.
2. JSONda 3 ta kalit bo'lishi shart:
   - 'specialization': Shifokor yo'nalishi (ingliz tilida ro'yxatdan tanlang).
   - 'confidence': Ishonchlilik darajasi (0.0 dan 1.0 gacha).
   - 'analysis': O'zbek tilida qisqa, lekin professional tibbiy tahlil. Simptomlarni shunchaki takrorlamang! Ehtimoliy sabablarni (tashxis emas, taxmin sifatida), tavsiyalarni va holatning jiddiyligini yozing. Masalan: 'Ko'z og'rig'i konyunktivit yoki charchoq alomati bo'lishi mumkin. Kompyuterda ishlashni kamaytirish va ko'z shifokori ko'rigidan o'tish tavsiya etiladi.'
3. Agar simptomlar tushunarsiz bo'lsa, 'General Practitioner'ni tanlang.
4. Javobingiz samimiy va professional bo'lsin.
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
                "confidence": result.get("confidence", 0.8),
                "analysis": result.get("analysis", "Simptomlaringiz bo'yicha umumiy ko'rikdan o'tish tavsiya etiladi.")
            }
        except Exception as e:
            print(f"Groq AI Error: {e}")
            return {
                "specialization": "Neurologist", # Fallback to an existing specialist for testing
                "confidence": 0.5,
                "analysis": "Simptomlaringiz bo'yicha umumiy mutaxassis ko'rigi tavsiya etiladi."
            }

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
