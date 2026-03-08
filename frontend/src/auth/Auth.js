import axios from "axios";

export const checkLoginApi = async () => {
  try {
    const res = await axios.get(`${import.meta.env.VITE_API_KEY}/check-auth`, { withCredentials: true });
    return res.data.authenticated || false;
  } catch (err) {
    return false;
  }
};