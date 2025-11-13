// services/dashboardService.js
import { api } from './api';

const dashboardService = {

  async getMovimentacoes() {
    try {
      const response = await api.get('/movfinanceira/listar');

      const movimentacoes = response.data?.data || [];

      if (movimentacoes.length === 0) {
        console.warn('Nenhuma movimentação retornada pela API');
        return [];
      }

      // Agrupa por mês e separa receitas/despesas
      const movimentacoesPorMes = {};
      
      movimentacoes.forEach(mov => {
        const data = mov.dataMovimento; // Nome correto do campo na DTO
        if (!data) {
          console.warn('Movimentação sem data:', mov);
          return;
        }

        const mes = new Date(data).getMonth() + 1;
        
        if (!movimentacoesPorMes[mes]) {
          movimentacoesPorMes[mes] = { mes, receita: 0, despesa: 0 };
        }
        
        const valor = Number(mov.valor) || 0;
        
        if (mov.tipo === 'RECEITA') {
          movimentacoesPorMes[mes].receita += valor;
        } else if (mov.tipo === 'DESPESA') {
          movimentacoesPorMes[mes].despesa += valor;
        }
      });

      const resultado = Object.values(movimentacoesPorMes);
      return resultado;
      
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error.response || error);
      return [];
    }
  },

  // Buscar apenas receitas
  async getReceitas() {
    try {
      const response = await api.get('/movfinanceira/listar/empresa');
      const movimentacoes = response.data?.data || [];
      return movimentacoes.filter(mov => mov.tipo === 'RECEITA');
    } catch (error) {
      console.error('Erro ao buscar receitas:', error.response || error);
      return [];
    }
  },

  // Buscar apenas despesas
  async getDespesas() {
    try {
      const response = await api.get('/movfinanceira/listar/empresa');
      const movimentacoes = response.data?.data || [];
      return movimentacoes.filter(mov => mov.tipo === 'DESPESA');
    } catch (error) {
      console.error('Erro ao buscar despesas:', error.response || error);
      return [];
    }
  },

  async getObras() {
    try {
      const response = await api.get('/obras/listar');
      return response.data?.data || [];
    } catch (error) {
      console.error('Erro ao buscar obras:', error.response || error);
      return [];
    }
  },

  async getClientesStatus() {
    try {
      const [ativosResponse, inativosResponse] = await Promise.all([
        api.get('/usuarios/listar/ativos').catch(() => ({ data: { data: [] } })),
        api.get('/usuarios/listar/inativos').catch(() => ({ data: { data: [] } }))
      ]);

      const ativosData = ativosResponse.data?.data || [];
      const inativosData = inativosResponse.data?.data || [];

      const countAtivos = ativosData.filter(u => u.role === 'ROLE_CLIENTE').length;
      const countInativos = inativosData.filter(u => u.role === 'ROLE_CLIENTE').length;

      return {
        ativos: countAtivos,
        inativos: countInativos,
        total: countAtivos + countInativos
      };
    } catch (error) {
      console.error('Erro ao buscar status de clientes:', error.response || error);
      return { ativos: 0, inativos: 0, total: 0 };
    }
  },

  async getEstoque() {
    try {
      const response = await api.get('/dashboard/estoque');
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao buscar estoque:', error.response || error);
      return [];
    }
  },
};

export default dashboardService;