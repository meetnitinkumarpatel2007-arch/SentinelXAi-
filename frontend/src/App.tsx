import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AnalystDashboard, CisoDashboard, CeoDashboard } from './pages/Dashboards';
import { AuthForm } from './components/AuthForm'; 
import { useAuth } from './context/AuthContext';

const RoleBasedRouter = ({ userRole }: { userRole: string | undefined }) => {
  // 🛡️ Secondary Shield: Catches the split-second state delay to prevent UI flashing
  if (!userRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
         <div className="text-orange-500 font-mono text-xl animate-pulse">
            [!] Verifying Security Clearance...
         </div>
      </div>
    );
  }
  
  // Ensure the role is strictly matched regardless of how the database formats it
  const role = userRole.toLowerCase();
  
  if (role === 'analyst') return <AnalystDashboard />;
  if (role === 'ciso') return <CisoDashboard />;
  if (role === 'ceo') return <CeoDashboard />;
  
  // Failsafe: if the role is unrecognized, kick them back to login
  return <Navigate to="/" replace />;
};

function App() {
  // Pull isLoading alongside the user object
  const { user, isLoading } = useAuth(); 

  // 🛡️ THE BOUNCER: If we are still checking the token, freeze the routing!
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-green-500 font-mono text-xl animate-pulse">
          [!] Initializing SentinelX Security Protocols...
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            !user ? (
              <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4">
                <AuthForm />
              </div>
            ) : (
              <Navigate to="/dashboard" replace />
            )
          } 
        />

        <Route 
          path="/dashboard" 
          element={
            user ? (
              <RoleBasedRouter userRole={user.role} />
            ) : (
              <Navigate to="/" replace />
            )
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;