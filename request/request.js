const axios = require('axios');

// create an axios instance
const instance = axios.create({
  baseURL: 'https://operateapi.homary.com', // url = base url + request url
  // withCredentials: true, // send cookies when cross-domain requests
  timeout: 100000, // request timeout
});

// request interceptor
instance.interceptors.request.use((config) =>
  // 在发送请求之前做些什么
  config,
(error) =>
  // 对请求错误做些什么
  Promise.reject(error));

// response interceptor
instance.interceptors.response.use((response) =>
  // 对响应数据做点什么
  response,
(error) =>
  // 对响应错误做点什么
  Promise.reject(error));

module.exports = instance;
