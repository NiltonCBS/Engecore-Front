import { api } from './api.js';
import Cookies from 'js-cookie';

const AUTH_COOKIE_NAME = 'JWT_TOKEN';

const authService = {
  /**
   * Realiza o login do usuário
   * @param {string} email - Email do usuário
   * @param {string} senha - Senha do usuário
   * @returns {Promise<Object>} Dados do usuário autenticado
   */
  async login(email, senha) {
    try {
      const response = await api.post('/auth/login', { 
        email,
        senha
      });
      
      return response.data;
    } catch (error) {
      // Tratamento de erros mais específico
      if (error.response) {
        // Erro com resposta do servidor
        const message = error.response.data?.message || 
                       error.response.data?.error ||
                       'Credenciais inválidas.';
        throw new Error(message);
      } else if (error.request) {
        // Erro de rede - sem resposta do servidor
        throw new Error('Não foi possível conectar ao servidor. Verifique sua conexão.');
      } else {
        // Erro na configuração da requisição
        throw new Error('Erro ao realizar login.');
      }
    }
  },

  /**
   * Realiza o logout do usuário
   * @returns {Promise<boolean>} True se logout foi bem-sucedido
   */
  async logout() {
    try {
      await api.post('/auth/logout');
      
      // Remove o cookie do frontend usando js-cookie
      Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
      
      // Fallback: remove usando método nativo (caso js-cookie falhe)
      document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; path=/; domain=${window.location.hostname}`;
      
      return true;
    } catch (error) {
      // Mesmo se o backend falhar, remove o cookie localmente
      Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
      document.cookie = `${AUTH_COOKIE_NAME}=; Max-Age=0; path=/;`;
      
      throw new Error(error.response?.data?.message || 'Erro ao realizar logout.');
    }
  },

  /**
   * Verifica se o usuário está autenticado
   * @returns {boolean} True se autenticado
   */
  isAuthenticated() {
    const token = Cookies.get(AUTH_COOKIE_NAME);
    return !!token;
  },

  /**
   * Obtém o token JWT do cookie
   * @returns {string|null} Token JWT ou null se não existir
   */
  getToken() {
    return Cookies.get(AUTH_COOKIE_NAME) || null;
  },

  /**
   * Verifica se o usuário tem permissão específica
   * @param {string} permission - Nome da permissão a verificar
   * @returns {Promise<boolean>} True se tem permissão
   */
  async hasPermission(permission) {
    try {
      const response = await api.get('/auth/permissions');
      return response.data?.permissions?.includes(permission) || false;
    } catch {
      return false;
    }
  },

  /**
   * Obtém informações do usuário atual
   * @returns {Promise<Object>} Dados do usuário
   */
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      return response.data;
    } catch (error) {
      throw new Error(error.response?.data?.message || 'Erro ao buscar dados do usuário.');
    }
  },

  /**
   * Valida se o token ainda é válido
   * @returns {Promise<boolean>} True se o token é válido
   */
  async validateToken() {
    if (!this.isAuthenticated()) {
      return false;
    }

    try {
      await api.get('/auth/validate');
      return true;
    } catch {
      // Remove token inválido
      Cookies.remove(AUTH_COOKIE_NAME, { path: '/' });
      return false;
    }
  }
};

export default authService;