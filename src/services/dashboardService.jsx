// services/dashboardService.js
import { api } from './api';

const dashboardService = {

  async getMovimentacoes() {
    try {
      const response = await api.get('/movFinanceira/listar');

      const movimentacoes = response.data?.data || [];

      if (movimentacoes.length === 0) {
        console.warn('Nenhuma movimentação retornada pela API');
        return [];
      }

      // Agrupa por mês e separa receitas/despesas
      const movimentacoesPorMes = {};
      
      movimentacoes.forEach(mov => {
        const data = mov.dataMovimento;
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
      const obras = response.data?.data || [];
      
      console.log('🏗️ Response completa:', response.data); // DEBUG
      console.log('📦 Obras extraídas:', obras); // DEBUG
      
      return obras;
    } catch (error) {
      console.error('Erro ao buscar obras:', error.response || error);
      return [];
    }
  },

  // Nova função: Agrupa obras por mês de criação
  async getObrasPorMes() {
    try {
      const response = await api.get('/obras/listar');
      const obras = response.data?.data || [];

      if (obras.length === 0) {
        console.warn('Nenhuma obra retornada pela API');
        return [];
      }

      // Agrupa por mês de criação
      const obrasPorMes = {};
      
      obras.forEach(obra => {
        // Tenta pegar a data de criação da obra
        // Ajuste o nome do campo conforme sua DTO (pode ser dataCriacao, dataInicio, etc.)
        const data = obra.dataCriacao || obra.dataInicio || obra.createdAt;
        
        if (!data) {
          console.warn('Obra sem data:', obra);
          return;
        }

        const mes = new Date(data).getMonth() + 1;
        
        if (!obrasPorMes[mes]) {
          obrasPorMes[mes] = { mes, quantidade: 0 };
        }
        
        obrasPorMes[mes].quantidade += 1;
      });

      // Garante array de 12 meses
      const resultado = Array.from({ length: 12 }, (_, i) => {
        const mes = i + 1;
        return obrasPorMes[mes] || { mes, quantidade: 0 };
      });

      return resultado;
      
    } catch (error) {
      console.error('Erro ao buscar obras por mês:', error.response || error);
      return [];
    }
  },

  async getClientesStatus() {
    try {
      // Busca todos os usuários ativos e inativos
      const [ativosResponse, inativosResponse] = await Promise.all([
        api.get('/usuarios/listar/ativos').catch(() => ({ data: { data: [] } })),
        api.get('/usuarios/listar/inativos').catch(() => ({ data: { data: [] } }))
      ]);

      const ativosData = ativosResponse.data?.data || [];
      const inativosData = inativosResponse.data?.data || [];

      // Filtra apenas usuários com role ROLE_CLIENTE
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