import axios from "axios";

export const checkLoginApi = async () => {
  const token = sessionStorage.getItem("token");
  if (!token) return false;
  try {
    const res = await axios.get("/check-auth", {headers: { Authorization: `Bearer ${token}` }});
    return res.data.authenticated;
  } catch {
    return false;
  }
};