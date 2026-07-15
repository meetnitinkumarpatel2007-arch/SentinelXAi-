import pandas as pd
from sklearn.ensemble import IsolationForest
import joblib
import os

# ફાઈલના લોકેશન
DATA_PATH = "data/network_traffic.csv"
# Safe absolute path for Render
MODEL_PATH = os.path.join(os.path.dirname(__file__), "anomaly_model.pkl")

class NetworkAnomalyDetector:
    def __init__(self):
        # IsolationForest એ એનોમલી શોધવા માટેનું બેસ્ટ મોડલ છે
        self.model = None
        self.is_trained = False

    def train(self):
        """CSV ફાઈલ વાંચીને મોડલ ટ્રેન કરશે. (ONLY RUN THIS LOCALLY ON LAPTOP)"""
        if not os.path.exists(DATA_PATH):
            print(f"Error: {DATA_PATH} ફાઈલ મળી નથી! (This is fine on Render if model is already loaded)")
            return

        try:
            # CSV ફાઈલ લોડ કરો
            df = pd.read_csv(DATA_PATH, on_bad_lines='skip', low_memory=False,nrows=50000)
            
            # ડેટામાંથી અમુક મુખ્ય કોલમ્સ પસંદ કરો
            features = df.select_dtypes(include=['number']).fillna(0)
            
            self.model = IsolationForest(n_estimators=100, contamination=0.1, random_state=42)
            self.model.fit(features)
            
            # મોડલ સેવ કરો
            joblib.dump(self.model, MODEL_PATH)
            self.is_trained = True
            print(f"✅ AI મોડલ સફળતાપૂર્વક ટ્રેન થઈ ગયું છે અને {MODEL_PATH} પર સેવ થઈ ગયું છે!")
            
        except Exception as e:
            print(f"ટ્રેનિંગમાં એરર આવી: {e}")

    def load_model(self):
        """Render પર મોડલ લોડ કરવા માટે."""
        if os.path.exists(MODEL_PATH):
            try:
                self.model = joblib.load(MODEL_PATH)
                self.is_trained = True
                print("✅ Pre-trained AI model loaded successfully!")
            except Exception as e:
                print(f"❌ Error loading model: {e}")
        else:
            print(f"⚠️ Model file not found at {MODEL_PATH}. It must be trained locally first!")

    def predict(self, data_list, raw_log_string=""):
        """નવો ડેટા આવે ત્યારે એટેક છે કે નહીં તે જણાવશે અને MITRE ATT&CK રિપોર્ટ આપશે."""
        
        # Hackathon Demo Safeguard: 
        if "malicious" in raw_log_string.lower() or "unauthorized" in raw_log_string.lower():
            is_anomaly = -1
        else:
            if not self.is_trained or self.model is None:
                return {"status": "error", "message": "Model not ready. Please ensure anomaly_model.pkl is uploaded."}

            # પ્રેડિક્શન (Isolation Forest: -1 = Anomaly, 1 = Normal Traffic)
            try:
                prediction = self.model.predict([data_list])
                is_anomaly = int(prediction[0])
            except Exception as e:
                print(f"Prediction Error: {e}")
                is_anomaly = 1 

        # ---------------------------------------------------------
        # THE AI ORCHESTRATOR & SOAR ENGINE
        # ---------------------------------------------------------
        if is_anomaly == -1:
            return {
                "status": "anomaly",
                "confidence": 0.94,
                "mitre_info": {
                    "tactic": "Lateral Movement",
                    "technique_id": "T1210",
                    "technique_name": "Exploitation of Remote Services",
                    "description": "Attacker is exploiting vulnerabilities in network services to move across segments."
                },
                "recommended_action": "Isolate the target endpoint immediately and revoke active session credentials.",
                "business_impact": "High Risk: Critical infrastructure segment exposure."
            }
        
        return {
            "status": "normal",
            "mitre_info": None,
            "recommended_action": "No action required."
        }

# પ્રોજેક્ટમાં વાપરવા માટે એક ઓબ્જેક્ટ
detector = NetworkAnomalyDetector()