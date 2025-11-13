import axios from 'axios';
import Cookies from 'js-cookie';

// 1. Cria a instância base do Axios com a URL do seu backend
const api = axios.create({
  baseURL: 'http://localhost:8080', // Certifique-se que esta é a porta correta
  withCredentials: true, // Essencial para o envio de cookies em pedidos cross-origin
   headers: {
    'Content-Type': 'application/json',
  }
});

// 2. Intercetor de Pedidos: A magia acontece aqui
// Este código é executado ANTES de cada pedido da API ser enviado
api.interceptors.request.use(
  (config) => {
    // Cookie é enviado automaticamente pelo withCredentials
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookies.remove('JWT_TOKEN', { path: '/' });
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export { api };