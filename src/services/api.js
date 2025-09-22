import axios from 'axios';

// Cria uma instância do Axios com configurações personalizadas
const api = axios.create({
  baseURL: 'http://localhost:8080', // Altere para a URL do seu backend em produção
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

export { api };