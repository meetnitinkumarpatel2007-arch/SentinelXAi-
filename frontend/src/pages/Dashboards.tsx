// frontend/src/pages/Dashboards.tsx
import { useState, useEffect } from 'react';

export const AnalystDashboard = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(true);

export const AnalystDashboard = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isScanning, setIsScanning] = useState(true);
  
  // 👉 PASTE IT RIGHT HERE:
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  // Polls the FastAPI endpoint...
  const fetchLiveAlerts = async () => {
    

  // Polls the FastAPI endpoint for live database alerts
  const fetchLiveAlerts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/detector/alerts");
      const data = await response.json();
      if (data.alerts) {
        setAlerts(data.alerts);
      }
    } catch (error) {
      console.error("Failed to reach database:", error);
    }
  };

  useEffect(() => {
    if (!isScanning) return;

    fetchLiveAlerts();
    const pollingInterval = setInterval(() => {
      fetchLiveAlerts();
    }, 2000);

    return () => clearInterval(pollingInterval);
  }, [isScanning]);

  return (
    <div className="p-8 bg-slate-950 text-green-400 min-h-screen font-mono">
      <div className="flex justify-between items-center mb-8 border-b border-green-800 pb-4">
        <div>
          <h1 className="text-3xl font-bold">SOC Analyst Terminal</h1>
          <p className="text-slate-400 mt-2">Monitoring Core Software Telemetry Stream (Simulated Loopback)...</p>
        </div>
        
        <button 
          onClick={() => setIsScanning(!isScanning)}
          className={`font-bold py-2 px-4 rounded transition-colors ${
            isScanning 
              ? "bg-green-900/50 text-green-400 border border-green-500 shadow-[0_0_10px_rgba(34,197,94,0.2)]" 
              : "bg-slate-800 text-slate-400 border border-slate-700"
          }`}
        >
          {isScanning ? "📡 Live Scan: ACTIVE" : "⏸ Live Scan: PAUSED"}
        </button>
      </div>

      <div className="space-y-4">
        {alerts.length === 0 ? (
          <div className="p-4 border border-green-900 bg-black rounded text-green-700">
            [OK] System nominal. No network anomalies found in the database logs.
          </div>
        ) : (
          alerts.map((alert) => (
            <div 
              key={alert.id} 
              className={`p-6 border-2 rounded-lg transition-all transform animate-in fade-in duration-300 ${
                alert.status === 'blocked' 
                  ? 'border-orange-500 bg-orange-950/30' 
                  : 'border-red-500 bg-red-950/30'
              }`}
            >
              <div className="flex justify-between items-start mb-2">
                <h2 className={`text-2xl font-bold ${alert.status === 'blocked' ? 'text-orange-500' : 'text-red-500'}`}>
                  {alert.status === 'blocked' ? '[🛡️] THREAT MITIGATED: PATHWAY BLOCKED' : '[!] CRITICAL THREAT INTERCEPTED'}
                </h2>
                <span className="text-sm text-slate-400">
                  Time: {new Date(alert.created_at).toLocaleTimeString()}
                </span>
              </div>
              
              <p className={alert.status === 'blocked' ? 'text-orange-400 mb-4' : 'text-red-400 mb-4'}>
                AI Confidence Rating: {(alert.anomaly_score * 100).toFixed(1)}%
              </p>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                <div className={`p-4 bg-black/50 border rounded ${alert.status === 'blocked' ? 'border-orange-800' : 'border-red-800'}`}>
                  <h3 className="text-gray-400 mb-1">MITRE ATT&CK Tactic</h3>
                  <p className={`font-bold ${alert.status === 'blocked' ? 'text-slate-500 line-through' : 'text-orange-400'}`}>
                    {/* 🧠 DYNAMIC TACTIC RENDERING */}
                    {alert.mitre_tactic || "Lateral Movement"}
                  </p>
                </div>
                <div className={`p-4 bg-black/50 border rounded ${alert.status === 'blocked' ? 'border-orange-800' : 'border-red-800'}`}>
                  <h3 className="text-gray-400 mb-1">Technique</h3>
                  <p className={`font-bold ${alert.status === 'blocked' ? 'text-slate-500 line-through' : 'text-orange-400'}`}>
                    {/* 🧠 DYNAMIC TECHNIQUE RENDERING */}
                    {alert.mitre_technique || "T1210: Exploitation of Remote Services"}
                  </p>
                </div>
              </div>

              {alert.status === 'new' && (
                <div className="mt-4 p-4 bg-black/50 border border-red-800 rounded">
                  <h3 className="text-gray-400 mb-1">Orchestrator Routing Recommendation</h3>
                  <p className="text-white">Isolate the affected software pathway immediately. Forwarding incident metrics to CISO approval gates.</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

  return (
    <div className="p-6 bg-[#0f111a] text-white min-h-screen font-sans">
      
      {/* Your Dashboard Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">SOC Analyst Terminal</h1>
        
        {/* 🎬 WATCH DEMO BUTTON */}
<button
  onClick={() => setIsDemoOpen(true)}
  className="px-4 py-2 text-xs font-mono uppercase tracking-widest text-green-400 bg-green-950/30 border border-green-500/50 rounded-md hover:bg-green-900/50 hover:text-green-300 transition-all shadow-[0_0_15px_rgba(34,197,94,0.15)] active:scale-95"
>
  ▶ Watch Live SOAR Mitigation
</button>

{/* ⬛ DARK GLASSMORPHISM VIDEO MODAL */}
{isDemoOpen && (
  <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 animate-in fade-in duration-300">
    
    {/* Modal Container */}
    <div className="relative w-full max-w-5xl bg-slate-900 rounded-xl border border-slate-700 shadow-[0_0_50px_rgba(16,185,129,0.15)] overflow-hidden">
      
      {/* Top Header / Close Button */}
      <div className="flex justify-between items-center p-3 bg-slate-950 border-b border-slate-800">
        <span className="text-xs font-mono text-slate-400 tracking-widest uppercase">
          SYS_PLAYBACK: Autonomous Mitigation Loop
        </span>
        <button
          onClick={() => setIsDemoOpen(false)}
          className="text-slate-400 hover:text-red-400 bg-slate-800/50 hover:bg-red-950/50 rounded px-3 py-1 text-xs font-mono transition-colors border border-transparent hover:border-red-900/50"
        >
          [ CLOSE ]
        </button>
      </div>

      {/* The Actual Video Player */}
      <div className="w-full aspect-video bg-black flex items-center justify-center">
        <video 
          src="/system-demo.mp4" 
          controls 
          autoPlay 
          className="w-full h-full object-contain"
        >
          Your browser does not support the video tag.
        </video>
      </div>
      
    </div>
  </div>
)}


      </div>

      {/* The rest of your dashboard widgets and tables go here... */}
      

export const CisoDashboard = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);

  const fetchLiveAlerts = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/detector/alerts");
      const data = await response.json();
      if (data.alerts) setAlerts(data.alerts);
    } catch (error) {
      console.error("Failed to fetch live alerts:", error);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    fetchLiveAlerts();
    const pollingInterval = setInterval(() => {
      fetchLiveAlerts();
    }, 3000);
    return () => clearInterval(pollingInterval);
  }, []);

  const handleThreatAction = async (alertId: string | number, actionStatus: string) => {
    try {
      await fetch(`http://127.0.0.1:8000/api/v1/detector/alerts/${alertId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: actionStatus })
      });
      fetchLiveAlerts();
    } catch (error) {
      console.error("Failed to update threat status:", error);
    }
  };

  return (
    <div className="p-8 bg-slate-950 text-slate-200 min-h-screen font-mono">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <h1 className="text-3xl font-bold text-white">CISO Command Center</h1>
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
          </span>
          <span className="text-sm text-green-400">Live Database Sync Active</span>
        </div>
      </div>

      <div className="space-y-6">
        <h2 className="text-xl font-semibold text-slate-300">Active Threat Management (SOAR)</h2>
        
        {isFetching && alerts.length === 0 ? (
          <p className="text-slate-500">Connecting to database...</p>
        ) : alerts.length === 0 ? (
          <div className="p-6 border border-slate-800 bg-slate-900 rounded text-center text-slate-500">
            No active threats require approval at this time.
          </div>
        ) : (
          <div className="grid gap-4">
            {alerts.map((alert) => {
              if (alert.status === 'dismissed') return null;
              const isBlocked = alert.status === 'blocked';

              return (
                <div key={alert.id} className={`p-5 border rounded-lg flex justify-between items-center transition-all ${isBlocked ? 'border-orange-500 bg-orange-950/20' : 'border-red-800 bg-red-950/20'}`}>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-xs font-bold px-2 py-1 rounded uppercase text-white ${isBlocked ? 'bg-orange-600' : 'bg-red-600'}`}>
                        {isBlocked ? 'NETWORK ISOLATED' : 'NEW THREAT'}
                      </span>
                      <span className="text-sm text-slate-400">
                        ID: {String(alert.id).substring(0, 8)}...
                      </span>
                    </div>
                    <p className={`text-lg font-bold ${isBlocked ? 'text-orange-400 line-through' : 'text-red-400'}`}>
                      {/* 🧠 DYNAMIC TACTIC RENDERING FOR CISO */}
                      {alert.mitre_tactic || "Lateral Movement"} Detected (Confidence: {(alert.anomaly_score * 100).toFixed(1)}%)
                    </p>
                  </div>
                  
                  <div className="flex gap-3">
                    {isBlocked ? (
                      <button 
                        onClick={() => handleThreatAction(alert.id, 'new')}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded font-bold transition-colors">
                        Restore Network (Unblock)
                      </button>
                    ) : (
                      <button 
                        onClick={() => handleThreatAction(alert.id, 'blocked')}
                        className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded font-bold transition-colors">
                        Approve Network Block
                      </button>
                    )}
                    
                    <button 
                      onClick={() => handleThreatAction(alert.id, 'dismissed')}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded font-bold transition-colors">
                      Dismiss
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
  

export const CeoDashboard = () => {
  const [alerts, setAlerts] = useState<any[]>([]);
  
  const fetchMetrics = async () => {
    try {
      const response = await fetch("http://127.0.0.1:8000/api/v1/detector/alerts");
      const data = await response.json();
      if (data.alerts) setAlerts(data.alerts);
    } catch (error) {
      console.error("Failed to fetch metrics:", error);
    }
  };

  useEffect(() => {
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 3000); 
    return () => clearInterval(interval);
  }, []);

  const totalThreats = alerts.length;
  const blockedThreats = alerts.filter(a => a.status === 'blocked').length;
  const activeThreats = alerts.filter(a => a.status === 'new').length;

  const systemStatus = activeThreats > 0 ? "CRITICAL: ATTACK IN PROGRESS" : "SECURE: ALL SYSTEMS NOMINAL";
  const statusColor = activeThreats > 0 ? "text-red-500" : "text-green-500";
  const statusBg = activeThreats > 0 ? "bg-red-950/30 border-red-800" : "bg-green-950/30 border-green-800";

  return (
    <div className="p-8 bg-slate-950 text-slate-200 min-h-screen font-sans">
      <div className="flex justify-between items-center mb-8 border-b border-slate-700 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Executive Security Overview</h1>
          <p className="text-slate-400 mt-1">SentinelX AI Autonomous Threat Mitigation System</p>
        </div>
        <div className={`px-4 py-2 border rounded-full font-bold transition-colors ${statusBg} ${statusColor}`}>
          System Status: {systemStatus}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="p-6 bg-slate-900 border border-slate-700 rounded-lg shadow-lg">
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Total Threats Detected</h3>
          <p className="text-5xl font-bold text-white">{totalThreats}</p>
        </div>
        
        <div className="p-6 bg-slate-900 border border-orange-900/50 rounded-lg shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">🛡️</div>
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Threats Auto-Mitigated</h3>
          <p className="text-5xl font-bold text-orange-400">{blockedThreats}</p>
        </div>
        
        <div className="p-6 bg-slate-900 border border-red-900/50 rounded-lg shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-6xl">⚠️</div>
          <h3 className="text-slate-400 text-sm font-semibold uppercase tracking-wider mb-2">Pending CISO Approvals</h3>
          <p className="text-5xl font-bold text-red-500">{activeThreats}</p>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-bold text-white mb-4">Recent Security Incidents</h2>
        <div className="bg-slate-900 rounded-lg border border-slate-700 overflow-hidden shadow-xl">
          <table className="w-full text-left">
            <thead className="bg-slate-800 border-b border-slate-700">
              <tr>
                <th className="p-4 text-slate-300 font-semibold">Time</th>
                <th className="p-4 text-slate-300 font-semibold">Incident Type</th>
                <th className="p-4 text-slate-300 font-semibold">AI Confidence</th>
                <th className="p-4 text-slate-300 font-semibold">Resolution Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {alerts.slice(0, 5).map(alert => (
                <tr key={alert.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="p-4 text-slate-400">{new Date(alert.created_at).toLocaleTimeString()}</td>
                  {/* 🧠 DYNAMIC TACTIC RENDERING FOR CEO */}
                  <td className="p-4 text-white font-medium">{alert.mitre_tactic || "Unauthorized Access Attempt"}</td>
                  <td className="p-4 text-slate-300">{(alert.anomaly_score * 100).toFixed(1)}%</td>
                  <td className="p-4">
                    {alert.status === 'blocked' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-900/50 text-orange-400 border border-orange-800">
                        RESOLVED (BLOCKED)
                      </span>
                    ) : alert.status === 'new' ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-900/50 text-red-400 border border-red-800 animate-pulse">
                        ACTION REQUIRED
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-800 text-slate-400 border border-slate-700">
                        DISMISSED
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {alerts.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500 font-mono">No recent incidents. System is secure.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};                                          
