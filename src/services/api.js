import axios from 'axios';
import Cookies from 'js-cookie';

// 1. Cria a instância base do Axios com a URL do seu backend
const api = axios.create({
  baseURL: 'http://localhost:8080', // Certifique-se que esta é a porta correta
  withCredentials: true, // Essencial para o envio de cookies em pedidos cross-origin
});

// 2. Intercetor de Pedidos: A magia acontece aqui
// Este código é executado ANTES de cada pedido da API ser enviado
api.interceptors.request.use(
  (config) => {
    // Tenta obter o token do cookie chamado 'JWT_TOKEN'
    const token = Cookies.get('JWT_TOKEN'); 

    // Se o token existir, adiciona-o ao cabeçalho Authorization
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config; // Retorna a configuração modificada para o Axios continuar o pedido
  },
  (error) => {
    // Em caso de erro na configuração do pedido, rejeita a promessa
    return Promise.reject(error);
  }
);

export { api };