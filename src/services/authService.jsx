import { api } from './api.js';

const authService = {
  async login(email, senha) {
    try {
      const response = await api.post('/auth/login', {
        email,
        senha
      });

      if (response.data.success && response.data.data) {
        localStorage.setItem('currentUser', JSON.stringify({
          userId: response.data.data.userId,
          nome: response.data.data.nome,
          email: response.data.data.email,
          role: response.data.data.role
        }));
      }
      return response.data;

    } catch (error) {
      if (error.response) {
        const message = error.response.data?.message ||
          error.response.data?.error ||
          'Credenciais inválidas.';
        throw new Error(message);
      } else if (error.request) {
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        throw new Error('Erro ao realizar login.');
      }
    }
  },

  async logout() {
    try {
      await api.post('/auth/logout');
      localStorage.removeItem('currentUser');
      return true;
    } catch (error) {
      localStorage.removeItem('currentUser');
      console.error('Erro no logout:', error);
      throw new Error(error.response?.data?.message || 'Erro ao realizar logout.');
    }
  },

  async checkAuthStatus() {
    try {
      const response = await api.get('/auth/me');

      if (response.data.success && response.data.data) {
        localStorage.setItem('currentUser', JSON.stringify({
          userId: response.data.data.id,
          nome: response.data.data.nome,
          email: response.data.data.email,
          role: response.data.data.role
        }));
        return response.data.data;
      }

      return null;
    } catch (error) {
      localStorage.removeItem('currentUser');
      return null;
    }
  },

  getCurrentUserLocal() {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }
};

export default authService;