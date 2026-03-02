import AuthPage from "./components/AuthPage";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
// import Dashboard from "./components/Dashboard";
import { AuthContext } from "./context/ContextApi";
import { useContext, useEffect, useState } from "react";
import NotFound from "./components/NotFound";
import { checkLoginApi } from "./auth/Auth";
import SA_Dashboard from "./pages/SuperAdmins/SA_Dashboard";
import axios from "axios";
import AddAdmin from "./pages/Admins/AddAdmins";
import AddProduct from "./pages/Products/AddProducts";
import AddReward from "./pages/Rewards/AddRewards";
import AddEmployee from "./pages/Employees/AddEmployee";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState("employee");

  const verifyLogin_Role = async () => {
    const login_result = await checkLoginApi();
    setLoggedIn(login_result);
    const role_check = await axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, {withCredentials: true});
    setRole(role_check.data.role);
    console.log(role_check.data.role);
  }

  useEffect(() => {
    verifyLogin_Role();
  }, [])

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn }}>
      <Router>
        <Routes>
          <Route path="/" element={loggedIn ? <Navigate to="/dashboard" /> : <AuthPage />} />

          {/* Dashboard - All Logged In Users */}
          <Route path="/dashboard" element={loggedIn ? <SA_Dashboard /> : <Navigate to="/" />} />

          {/* Admins Manage - Super Admin Only */}
          <Route path="/admins/add" 
                 element={loggedIn && role === "super_admin" && <AddAdmin /> } />
          <Route path="/admins/manage" 
                 element={loggedIn && role === "super_admin" && <SA_Dashboard />} />

          {/* Employees Manage - Super Admin & Admin */}
          <Route path="/employees/add" 
                element={loggedIn && (role === "super_admin" || role === "admin") ? <AddEmployee /> : 
                <Navigate to="/" />} />
          <Route path="/employees/manage" 
                element={loggedIn && (role === "super_admin" || role === "admin") ? <SA_Dashboard /> : <Navigate to="/" />} />
          <Route path="/employees/deleted"
                element={loggedIn && (role === "super_admin" || role === "admin") ? <SA_Dashboard /> : <Navigate to="/" />} />

          {/* Products Manage - Super Admin & Admin */}
          <Route path="/products/add"
                element={loggedIn && (role === "super_admin" || role === "admin") ? <AddProduct /> : 
                <Navigate to="/" />} />
          <Route path="/products/manage"
                element={loggedIn && (role === "super_admin" || role === "admin") ? <SA_Dashboard /> : <Navigate to="/" />} />

          {/* Rewards Manage - Super Admin & Admin */}
          <Route path="/rewards/add"
                element={loggedIn && (role === "super_admin" || role === "admin") ? <AddReward /> : 
                <Navigate to="/" />} />
          <Route path="/rewards/manage"
                element={ loggedIn && (role === "super_admin" || role === "admin") ? <SA_Dashboard /> : <Navigate to="/" />} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}