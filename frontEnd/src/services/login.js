import axios from "axios";
const BaseUrl = "/api/login";

const login = async (Credentials) => {
  const response = await axios.post("/api/login", Credentials);
  return response.data;
};

export default { login };
