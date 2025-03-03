import axios from 'axios';

const endPoint = 'http://localhost:3001';

const apiConfig = (flag = false) => {
  if (localStorage.getItem('accessToken')) {
    return {
      headers: {
        Authorization: `bearer ${localStorage.getItem('accessToken')}`,
        'Content-Type': flag
          ? 'multipart/form-data'
          : 'application/json',
      },
      method: 'PUT,DELETE,POST,GET,OPTION',
    };
  }
  return { withCredentials: false };
};

let navigateRef: any = null;

export const setNavigate = (navigateInstance: any) => {    //store navigate instance
  navigateRef = navigateInstance;
};

axios.interceptors.response.use(
  (response) => response,  // successful thai to return response 
  (error) => {
    if (
      error.response &&
      error.response.status === 401 &&
      error.response.data?.error?.name === 'TokenExpiredError' &&   // ?. error chaining operator
      localStorage.getItem('accessToken')
    ) {
      if (navigateRef) {
        navigateRef('/login');
      }
    } else if (
      error.response &&
      error.response.status === 401 &&
      localStorage.getItem('accessToken')
    ) {
      if (navigateRef) {
        navigateRef('/login');
      }
    }
    return Promise.reject(error);
  }
);

export const getApi = (url?: string, params?: any) => {
  return axios.get(`${endPoint}${url}`, {
    params: params,
    ...apiConfig(),
  });
};

export const postApi = (url: string, apiData?: any, flag?: boolean) => {
  return axios.post(`${endPoint}${url}`, apiData, apiConfig(flag));
};

export const putApi = (url: string, apiData: any, flag?: boolean) => {
  return axios.put(`${endPoint}${url}`, apiData, apiConfig(flag));
};

export const deleteApi = (url: string) => {
  return axios.delete(`${endPoint}${url}`, apiConfig());
};

export const deleteApiWithData = (url: string, apiData?: any) => {
  return axios.delete(`${endPoint}${url}`, {
    data: apiData,
    ...apiConfig(),
  });
};