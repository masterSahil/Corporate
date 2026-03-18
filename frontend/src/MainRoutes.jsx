import { Route, Routes, Navigate } from "react-router-dom";

// Auth & Core Pages
import AuthPage from "./components/AuthPage";
import NotFound from "./components/NotFound";
import SuperAdmin from "./pages/Dashboards/SuperAdmin";
import Settings from "./components/Setting";
import SystemLogs from "./components/SystemLogs";

// Admins
import AddAdmin from "./pages/Admins/AddAdmins";
import ViewAdmins from "./pages/Admins/ViewAdmins";
import UpdateAdmin from "./pages/Admins/UpdateAdmin";
import SoftDeletedAdmins from "./pages/Admins/DeletedAdmins";

// Employees
import AddEmployee from "./pages/Employees/AddEmployee";
import ViewEmployees from "./pages/Employees/ViewEmployee";
import UpdateEmployee from "./pages/Employees/UpdateEmployee";
import SoftDeletedEmployees from "./pages/Employees/DeletedEmployee";

// Products
import AddProduct from "./pages/Products/AddProducts";
import ViewProduct from "./pages/Products/ViewProducts";
import UpdateProduct from "./pages/Products/UpdateProduct";
import SoftDeletedProducts from "./pages/Products/DeletedProducts";

// Rewards
import AddReward from "./pages/Rewards/AddRewards";
import ViewRewards from "./pages/Rewards/ViewRewards";
import UpdateReward from "./pages/Rewards/UpdateReward";
import SoftDeletedRewards from "./pages/Rewards/DeletedRewards";

// Orders
import AdminOrder from "./pages/Orders/AdminOrder";

// Employees Portal
import EmployeeDashboard from "./employee_pages/EmployeeDashboard";
import EmployeeStore from "./employee_pages/EmployeeStore";
import EmployeeCart from "./employee_pages/EmployeeCart";
import EmployeeDirectory from "./employee_pages/EmployeeDirectory";
import EmployeeProfile from "./employee_pages/EmployeeProfile";
import ProductDetails from "./employee_pages/ProductDetails";
import EmployeeRewards from "./employee_pages/EmployeeRewards";
import EmployeeOrder from "./employee_pages/EmployeeOrder";

const MainRoutes = ({ loggedIn, role }) => {
  return (
    <Routes>
      <Route path="/" 
        element={!loggedIn ? ( <AuthPage /> ) : role === "employee" ? 
          (<Navigate to="/employee/dashboard" replace />) : (<Navigate to="/dashboard" replace />)}/>

      {/* Dashboard - All Logged In Users */}
      <Route path="/dashboard" element={loggedIn && (role === "super_admin" || role === "admin") ? <SuperAdmin /> : <Navigate to="/" />} />

    {/* ==========================================
          ADMIN & SUPER ADMIN ROUTES
      ========================================== */}

      {/* Admins Manage - Super Admin Only */}
      <Route path="/admins/add" element={loggedIn && role === "super_admin" ? <AddAdmin /> : <Navigate to="/" />} />
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
      <Route path="/rewards/update/:id" element={loggedIn && (role === "super_admin" || role === "admin") ? <UpdateReward /> : <Navigate to="/" />} />

      {/* ==========================================
          EMPLOYEE PORTAL ROUTES
      ========================================== */}
      <Route path="/employee/dashboard" element={loggedIn && role === "employee" ? <EmployeeDashboard /> : <Navigate to="/" />} />
      <Route path="/employee/store" element={loggedIn && role === "employee" ? <EmployeeStore /> : <Navigate to="/" />} />
      <Route path="/employee/rewards" element={loggedIn && role === "employee" ? <EmployeeRewards /> : <Navigate to="/" />} />
      <Route path="/employee/store/:id" element={loggedIn && role === "employee" ? <ProductDetails /> : <Navigate to="/" />} />
      <Route path="/employee/cart" element={loggedIn && role === "employee" ? <EmployeeCart /> : <Navigate to="/" />} />
      <Route path="/employee/orders" element={loggedIn && role === "employee" ? <EmployeeOrder /> : <Navigate to="/" />} />
      <Route path="/employee/directory" element={loggedIn && role === "employee" ? <EmployeeDirectory /> : <Navigate to="/" />} />
      <Route path="/employee/settings" element={loggedIn && role === "employee" ? <EmployeeProfile /> : <Navigate to="/" />} />

      {/* Admin Orders */}
      <Route path="/checkout-orders" element={loggedIn && (role === "super_admin" || role === "admin") ? <AdminOrder /> : <Navigate to="/" />} />

      {/* System Logs */}
      <Route path="/system-logs" element={loggedIn && (role === "super_admin" || role === "admin") ? <SystemLogs /> : <Navigate to="/" />} />

      {/* Settings */}
      <Route path="/settings" element={loggedIn ? <Settings /> : <Navigate to="/" />} />

      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default MainRoutes;