import { useNavigate } from "react-router-dom";
import { AuthContext } from "./context/ContextApi";
import { useEffect, useState } from "react";
import { checkLoginApi } from "./auth/Auth";
import axios from "axios";
import { toast, Toaster } from "./ui/Toaster";
import { RefreshCw } from "lucide-react";
import MainRoutes from "./MainRoutes";
import { GoogleOAuthProvider } from '@react-oauth/google';

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const verifyLogin_Role = async () => {
    try {
      const token = sessionStorage.getItem("token");

      if (!token) {
        setLoggedIn(false);
        setLoading(false);
        navigate("/");
        return;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_KEY}/check-role`,
        { headers: { Authorization: `Bearer ${token}` }});

      const user = res.data.user;
      if (user.isDeleted) {
        sessionStorage.removeItem("token");
        setLoggedIn(false);
        setRole(null);
        navigate("/");
        return;
      }

      setLoggedIn(true);
      setRole(user.role);
    } catch (error) {
      sessionStorage.removeItem("token");
      setLoggedIn(false);
      setRole(null);
      navigate("/");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyLogin_Role();
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-xl shadow-xl px-6 py-5 flex items-center gap-3">
          <RefreshCw className="animate-spin text-slate-700" size={22} />
          <span className="text-sm font-semibold text-slate-800"> Loading... </span>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, role, setRole }}>
      <GoogleOAuthProvider clientId={import.meta.env.VITE_CLIENT_ID}>
        <MainRoutes loggedIn={loggedIn} role={role} />
      </GoogleOAuthProvider>
      <Toaster />
    </AuthContext.Provider>
  );
}