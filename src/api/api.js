import axios from "axios";

function createApi() {
  const apiClient = axios.create({
    baseURL:
      process.env.REACT_APP_ENV === "production"
        ? "https://olmstead-ball-backend.herokuapp.com/"
        : "http://localhost:3000",
    responseType: "json",

  });

  // const setAuthHeader = () => {
  //   const { tokenType, accessToken } = JSON.parse(
  //     localStorage.getItem("token")
  //   );

  //   apiClient.defaults.headers.common[
  //     "Authorization"
  //   ] = `${tokenType} ${accessToken}`;
  // };

  const login = async (username, password, loginToken) => {
    const { data } = await apiClient.post("/auth/login", {
      username,
      password,
      loginToken,
    });
    return data;
  };

  const register = async (fields) => {
    const { data } = await apiClient.post("auth/register", fields);
    return data;
  };

  const testCall = async (fields) => {
    const { data } = await apiClient.get("users/test", fields);
    return data;
  };

  return {
    login,
    register,
    testCall,
  };
}

const apiClient = createApi();

export default apiClient;
