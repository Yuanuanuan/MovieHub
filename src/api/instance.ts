import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import store from "@/store";

interface InstanceOptions {
  showLoading?: boolean;
}

interface ApiResponse {
  data: {
    results: [];
  };
}

function createInstance(options: InstanceOptions = {}) {
  const instance = axios.create({
    baseURL: import.meta.env.VITE_BASE_URL,
    headers: {
      accept: "application/json",
      Authorization: "Bearer " + import.meta.env.VITE_API_TOKEN,
    },
  });
  instance.interceptors.request.use((req) => requestInterceptors(req, options));
  instance.interceptors.response.use((res) =>
    responseInterceptorsSuccess(res, options)
  );
  instance.interceptors.response.use(
    (res) => res,
    (err) => responseInterceptorsError(err)
  );

  return instance;
}

function requestInterceptors(
  req: InternalAxiosRequestConfig<unknown>,
  options: InstanceOptions
) {
  if (options.showLoading) store.dispatch({ type: "ADD_REQUEST" });
  return req;
}

function responseInterceptorsSuccess(
  res: AxiosResponse<ApiResponse>,
  options: InstanceOptions
) {
  if (res.status) {
    if (options.showLoading) store.dispatch({ type: "MINUS_REQUEST" });
    return res;
  } else {
    const err = new AxiosError();
    err.response = res;
    throw err;
  }
}

function responseInterceptorsError(err: AxiosError<ApiResponse>) {
  throw err;
}

export const hideLoadingInstance = createInstance();

export default createInstance({ showLoading: true });
