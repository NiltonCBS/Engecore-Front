import { api } from './api.js';

const AUTH_COOKIE_NAME = 'JWT_TOKEN';

const authService = {
  // Função para fazer o login
  async login(email, senha) {
  try {
    const response = await api.post('/auth/login', { 
      email, 
      senha   // 🔥 importante: backend espera "rawPassword"
    });
    
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Erro ao realizar login.');
  }
},

  // Função para fazer o logout
  async logout() {
    try {
      await api.post('/auth/logout');
      
      // Para garantir, você pode remover o cookie do frontend,
      // embora o backend já invalide o token.
      document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; path=/;`;
      
      return true;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao realizar logout.');
    }
  },

  // Função para verificar se o usuário está autenticado
  isAuthenticated() {
    // Verifica se o cookie de autenticação existe
    const cookies = document.cookie.split(';').map(cookie => cookie.trim());
    return cookies.some(cookie => cookie.startsWith(`${AUTH_COOKIE_NAME}=`));
  },
};

export default authService;