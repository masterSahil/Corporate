import AuthPage from "./components/AuthPage";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import { AuthContext } from "./context/ContextApi";
import { useEffect, useState } from "react";
import NotFound from "./components/NotFound";
import { checkLoginApi } from "./auth/Auth";
import SA_Dashboard from "./pages/SuperAdmins/SA_Dashboard";
import axios from "axios";
import AddAdmin from "./pages/Admins/AddAdmins";
import AddProduct from "./pages/Products/AddProducts";
import AddReward from "./pages/Rewards/AddRewards";
import AddEmployee from "./pages/Employees/AddEmployee";
import Settings from "./components/Setting";
import ViewAdmins from "./pages/Admins/ViewAdmins";
import ViewEmployees from "./pages/Employees/ViewEmployee";
import ViewProduct from './pages/Products/ViewProducts'
import ViewRewards from "./pages/Rewards/ViewRewards";
import SoftDeletedAdmins from "./pages/Admins/DeletedAdmins";
import SoftDeletedEmployees from "./pages/Employees/DeletedEmployee";
import SoftDeletedProducts from "./pages/Products/DeletedProducts";
import UpdateProduct from "./pages/Products/UpdateProduct";
import SoftDeletedRewards from "./pages/Rewards/DeletedRewards";
import UpdateAdmin from "./pages/Admins/UpdateAdmin";
import UpdateEmployee from "./pages/Employees/UpdateEmployee";

export default function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  // const verifyLogin_Role = async () => {
  //   const login_result = await checkLoginApi();
  //   setLoggedIn(login_result);
  //   const role_check = await axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, {withCredentials: true});
  //   setRole(role_check.data.role);
  //   console.log(role_check.data.role);
  // }

  const verifyLogin_Role = async () => {
    try {
      const login_result = await checkLoginApi();

      if (!login_result) {
        setLoggedIn(false); 
        setLoading(false);
        return;
      }
      setLoggedIn(true);

      const role_check = await axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, {withCredentials: true});
      setRole(role_check.data.role);
    } catch (error) {
      if (error.response?.status === 401) {
        setLoggedIn(false);
        setRole(null);
      } else {
        console.log(error);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    verifyLogin_Role();
  }, [])

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ loggedIn, setLoggedIn, role, setRole }}>
      <Router>
        <Routes>
          <Route path="/" element={loggedIn ? <Navigate to="/dashboard" /> : <AuthPage />} />

          {/* Dashboard - All Logged In Users */}
          <Route path="/dashboard" element={loggedIn ? <SA_Dashboard /> : <Navigate to="/" />} />

          {/* Admins Manage - Super Admin Only */}
          <Route path="/admins/add" element={loggedIn && role === "super_admin" ? <AddAdmin /> : 
          <Navigate to="/" />} />

          <Route path="/admins/manage" element={loggedIn && role === "super_admin" ? <ViewAdmins /> : <Navigate to="/" />} />

          <Route path="/admins/deleted" element={loggedIn && role === "super_admin" ? <SoftDeletedAdmins /> : <Navigate to="/" />} />

          <Route path="/admins/update/:id" element={loggedIn && role === "super_admin" ? <UpdateAdmin /> : <Navigate to="/" />} />

          {/* Employees Manage - Super Admin & Admin */}
          <Route path="/employees/add" element={loggedIn && (role === "super_admin" || role === "admin") ? <AddEmployee /> : <Navigate to="/" />} />

          <Route path="/employees/manage" element={loggedIn && (role === "super_admin" || role === "admin") ? <ViewEmployees /> : <Navigate to="/" />} />

          <Route path="/employees/update/:id" element={loggedIn && (role === "super_admin" || role === "admin") ? <UpdateEmployee /> : <Navigate to="/" />} />

          <Route path="/employees/deleted" element={loggedIn && (role === "super_admin" || role === "admin") ? <SoftDeletedEmployees /> : <Navigate to="/" />} />

          {/* Products Manage - Super Admin & Admin */}
          <Route path="/products/add" element={loggedIn && (role === "super_admin" || role === "admin") ? <AddProduct /> : <Navigate to="/" />} />

          <Route path="/products/manage" element={loggedIn && (role === "super_admin" || role === "admin") ? <ViewProduct /> : <Navigate to="/" />} />

          <Route path="/products/deleted" element={loggedIn && (role === "super_admin" || role === "admin") ? <SoftDeletedProducts /> : <Navigate to="/" />} />

          <Route path="/products/update/:id" element={loggedIn && (role === "super_admin" || role === "admin") ? <UpdateProduct /> : <Navigate to="/" />} />

          {/* Rewards Manage - Super Admin & Admin */}
          <Route path="/rewards/add" element={loggedIn && (role === "super_admin" || role === "admin") ? <AddReward /> : <Navigate to="/" />} />

          <Route path="/rewards/manage" element={loggedIn && (role === "super_admin" || role === "admin") ? <ViewRewards /> : <Navigate to="/" />} />

          <Route path="/rewards/deleted" element={loggedIn && (role === "super_admin" || role === "admin") ? <SoftDeletedRewards /> : <Navigate to="/" />} />

          {/* Settings */}
          <Route path="/settings" element={loggedIn ? <Settings /> : <Navigate to="/" />} />

          {/* Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthContext.Provider>
  );
}