import time
import requests
import random
import threading

# The URL to your local FastAPI server
API_URL = "http://127.0.0.1:8000/api/v1/detector"

# Global state to track if the CISO has blocked this software stream
is_blocked = False

def check_soar_firewall_status():
    """Continuously polls the database to check if a block order has been issued."""
    global is_blocked
    while True:
        try:
            response = requests.get(f"{API_URL}/alerts")
            if response.status_code == 200:
                alerts = response.json().get("alerts", [])
                
                # Active blocking logic check
                if any(alert.get("status") == "blocked" for alert in alerts):
                    if not is_blocked:
                        print("\n🧱 [SOAR ACTION] AI-Driven Firewall Rule Applied. Traffic Dropped.")
                        is_blocked = True
                else:
                    if is_blocked:
                        print("\n✅ [SOAR ACTION] Firewall Exception Granted. Resuming Network Stream.")
                        is_blocked = False
                        
        except requests.exceptions.ConnectionError:
            pass
            
        time.sleep(2)

def stream_software_telemetry():
    """Generates pure software network logs to pass through the AI loop."""
    global is_blocked
    packet_count = 0
    
    print("🚀 Local Network Telemetry Simulator: ACTIVE")
    print("Streaming synthetic logs directly to FastAPI AI Engine...\n")
    
    while True:
        if is_blocked:
            print("❌ Connection Refused: Software Node Isolated.", end="\r")
            time.sleep(1)
            continue
            
        packet_count += 1
        
        # Every 10th packet simulates an anomalies/APT threat pattern
        if packet_count % 10 == 0:
            print("\n😈 [SIMULATION] Injecting Suspicious Network Activity...")
            payload = {
                "features": [0.8, 1.2, 3.5, 0.1],
                "raw_log": "unauthorized remote access attempt - malicious"
            }
        else:
            # Standard background traffic
            print(f"[{time.strftime('%H:%M:%S')}] Telemetry Packet #{packet_count} - Status: 200 OK")
            payload = {
                "features": [random.uniform(0, 0.2) for _ in range(4)],
                "raw_log": "standard user https traffic"
            }

        try:
            requests.post(f"{API_URL}/analyze", json=payload)
        except requests.exceptions.ConnectionError:
            print("⚠️ Cannot connect to FastAPI server. Ensure uvicorn is running.")
            
        time.sleep(2)

if __name__ == "__main__":
    # Run the database state checker in a background thread
    state_thread = threading.Thread(target=check_soar_firewall_status, daemon=True)
    state_thread.start()
    
    try:
        stream_software_telemetry()
    except KeyboardInterrupt:
        print("\n🛑 Simulator Stopped.")