import ApiClient from "./api";

let apiInterface = {
  login: ApiClient.login,
  register: ApiClient.register,
  testCall: ApiClient.testCall
};

export default apiInterface;
