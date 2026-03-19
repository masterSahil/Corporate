// import React, { useContext, useEffect, useState } from 'react'
// import { AuthContext } from '../context/ContextApi';
// import { checkLoginApi } from '../auth/Auth';
// import axios from 'axios';

// const Dashboard = () => {

//   const [role, setRole] = useState("employee");

//   const auth_context = useContext(AuthContext)

//   const verifyLogin_Role = async () => {
//     const login_result = await checkLoginApi();
//     auth_context.setLoggedIn(login_result);
//     const role_check = await axios.get(`${import.meta.env.VITE_API_KEY}/check-role`, {withCredentials: true});
//     setRole(role_check.data.role);
//   }

//   useEffect(() => {
//     verifyLogin_Role();
//   }, [])

//   return (
//     <>
//       <div>Dashboard</div>

//       <p>{role}</p>
//     </>
//   )
// }

// export default Dashboard