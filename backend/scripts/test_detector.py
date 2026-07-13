import streamlit as st
import requests

st.set_page_config(page_title="SentinelXAi Dashboard", layout="wide")
st.title("🛡️ SentinelXAi Security Dashboard")

# યુઝર ઇનપુટ
st.sidebar.header("Network Traffic Monitor")
packet_size = st.sidebar.number_input("Packet Size", value=100)
duration = st.sidebar.number_input("Duration (s)", value=2)
failed_logins = st.sidebar.number_input("Failed Logins", value=0)

if st.sidebar.button("Analyze Traffic"):
    # બેકએન્ડને કોલ કરો
    payload = {"packet_size": packet_size, "duration": duration, "failed_logins": failed_logins}
    response = requests.post("http://127.0.0.1:8000/api/v1/detector/analyze", json=payload)
    
    if response.status_code == 200:
        result = response.json()
        if result["is_attack"]:
            st.error(result["message"])
        else:
            st.success(result["message"])
    else:
        st.error("Error connecting to backend!")