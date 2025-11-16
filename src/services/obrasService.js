// services/obrasService.js
import { api } from './api';

const obrasService = {
  
  // Listar todas as obras
  async listarObras() {
    try {
      const response = await api.get('/obras/listar');
      return response.data?.data || [];
    } catch (error) {
      console.error('Erro ao listar obras:', error.response || error);
      throw error;
    }
  },

  // Buscar obra por ID (com dados completos) - ENDPOINT CORRETO: /obras/{id}
  async buscarObraPorId(id) {
    try {
      const response = await api.get(`/obras/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao buscar obra por ID:', error.response || error);
      throw error;
    }
  },

  // Cadastrar nova obra
  async cadastrarObra(obraData) {
    try {
      const response = await api.post('/obras/cadastrar', obraData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao cadastrar obra:', error.response || error);
      throw error;
    }
  },

  // Atualizar obra existente
  async atualizarObra(id, obraData) {
    try {
      const response = await api.put(`/obras/alterar/${id}`, obraData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao atualizar obra:', error.response || error);
      throw error;
    }
  },

  // Atualizar unidades da obra
  async atualizarUnidades(id, unidadesData) {
    try {
      const response = await api.put(`/obras/alterar/unidades/${id}`, unidadesData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao atualizar unidades:', error.response || error);
      throw error;
    }
  },

  // Validar documentação da obra
  async validarDocumentacao(id, status) {
    try {
      const response = await api.put(`/obras/validarDocumentos/${id}`, status);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao validar documentação:', error.response || error);
      throw error;
    }
  },

  // Deletar obra
  async deletarObra(id) {
    try {
      const response = await api.delete(`/obras/deletar/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar obra:', error.response || error);
      throw error;
    }
  },

  // Listar clientes para dropdown
  async listarClientes() {
    try {
      const response = await api.get('/cliente/listar');
      return response.data?.data || [];
    } catch (error) {
      console.error('Erro ao listar clientes:', error.response || error);
      return [];
    }
  },

  // Listar funcionários para dropdown
  async listarFuncionarios() {
    try {
      const response = await api.get('/funcionario/listar');
      return response.data?.data || [];
    } catch (error) {
      console.error('Erro ao listar funcionários:', error.response || error);
      return [];
    }
  },

  // Buscar CEP via ViaCEP
  async buscarCep(cep) {
    try {
      const numeros = cep.replace(/\D/g, '');
      if (numeros.length !== 8) {
        throw new Error('CEP inválido');
      }

      const response = await fetch(`https://viacep.com.br/ws/${numeros}/json/`);
      const data = await response.json();

      if (data.erro) {
        throw new Error('CEP não encontrado');
      }

      return {
        rua: data.logradouro || '',
        bairro: data.bairro || '',
        cidade: data.localidade || '',
        estado: data.uf || '',
      };
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      throw error;
    }
  },

  // ==================== FASES ====================

  // Cadastrar fase
  async cadastrarFase(faseData) {
    try {
      const response = await api.post('/obras/fases/cadastrar', faseData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao cadastrar fase:', error.response || error);
      throw error;
    }
  },

  // Atualizar fase
  async atualizarFase(id, faseData) {
    try {
      const response = await api.put(`/obras/fases/alterar/${id}`, faseData);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao atualizar fase:', error.response || error);
      throw error;
    }
  },

  // Buscar fase por ID
  async buscarFasePorId(id) {
    try {
      const response = await api.get(`/obras/fases/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      console.error('Erro ao buscar fase:', error.response || error);
      throw error;
    }
  },

  // Listar todas as fases
  async listarFases() {
    try {
      const response = await api.get('/obras/fases/listar');
      return response.data?.data || [];
    } catch (error) {
      console.error('Erro ao listar fases:', error.response || error);
      return [];
    }
  },

  // Listar fases por obra
  async listarFasesPorObra(obraId) {
    try {
      const response = await api.get(`/obras/fases/listar/${obraId}`);
      return response.data?.data || [];
    } catch (error) {
      console.error('Erro ao listar fases da obra:', error.response || error);
      return [];
    }
  },

  // Deletar fase
  async deletarFase(id) {
    try {
      const response = await api.delete(`/obras/fases/deletar/${id}`);
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar fase:', error.response || error);
      throw error;
    }
  },

  // ==================== FORMATAÇÃO ====================

  // Formatar dados da obra para envio ao backend
  formatarObraParaEnvio(obraForm, currentUserId) {
    return {
      nomeObra: obraForm.nomeObra,
      clienteId: parseInt(obraForm.clienteId),
      responsavelId: obraForm.responsavelId ? parseInt(obraForm.responsavelId) : currentUserId,
      status: obraForm.status || 'PLANEJAMENTO',
      tipo: obraForm.tipo,
      endereco: {
        rua: obraForm.endereco?.rua || '',
        numero: obraForm.endereco?.numero || '',
        complemento: obraForm.endereco?.complemento || '',
        bairro: obraForm.endereco?.bairro || '',
        cidade: obraForm.endereco?.cidade || '',
        estado: obraForm.endereco?.estado || '',
        cep: obraForm.endereco?.cep?.replace(/\D/g, '') || ''
      },
      totalUnidades: parseInt(obraForm.totalUnidades) || 0,
      unidadesConcluidas: parseInt(obraForm.unidadesConcluidas) || 0,
      valorTotal: parseFloat(obraForm.valorTotal) || 0,
      valorLiberado: parseFloat(obraForm.valorLiberado) || 0,
      pagosFornecedores: parseFloat(obraForm.pagosFornecedores) || 0,
      custoPorUnidade: parseFloat(obraForm.custoPorUnidade) || 0,
      faixaRenda: obraForm.faixaRenda || null,
      documentacaoAprovada: obraForm.documentacaoAprovada || false,
      programaSocial: obraForm.programaSocial || null,
      dataInicio: obraForm.dataInicio || null,
      dataPrevistaConclusao: obraForm.dataPrevistaConclusao || null,
      dataConclusaoReal: obraForm.dataConclusaoReal || null,
      fases: obraForm.fases || []
    };
  },

  // Formatar dados da obra recebidos do backend para edição
  formatarObraParaEdicao(obraBackend) {
    return {
      idObra: obraBackend.id,
      nomeObra: obraBackend.nome || obraBackend.nomeObra || '',
      clienteId: obraBackend.clienteId || '',
      responsavelId: obraBackend.responsavelId || '',
      status: obraBackend.status || 'PLANEJAMENTO',
      tipo: obraBackend.tipo || obraBackend.categoria || '',
      endereco: {
        rua: obraBackend.endereco?.rua || '',
        numero: obraBackend.endereco?.numero || '',
        complemento: obraBackend.endereco?.complemento || '',
        bairro: obraBackend.endereco?.bairro || '',
        cidade: obraBackend.endereco?.cidade || '',
        estado: obraBackend.endereco?.estado || '',
        cep: obraBackend.endereco?.cep || ''
      },
      dataInicio: obraBackend.dataInicio || '',
      dataPrevistaConclusao: obraBackend.dataPrevistaConclusao || obraBackend.previsaoTermino || '',
      valorTotal: obraBackend.valorTotal || obraBackend.valorContrato || 0,
      totalUnidades: obraBackend.totalUnidades || 0,
      unidadesConcluidas: obraBackend.unidadesConcluidas || obraBackend.progresso || 0,
      valorLiberado: obraBackend.valorLiberado || 0,
      pagosFornecedores: obraBackend.pagosFornecedores || 0,
      custoPorUnidade: obraBackend.custoPorUnidade || 0,
      faixaRenda: obraBackend.faixaRenda || null,
      documentacaoAprovada: obraBackend.documentacaoAprovada || false,
      programaSocial: obraBackend.programaSocial || null,
      dataConclusaoReal: obraBackend.dataConclusaoReal || null,
      fases: obraBackend.fases || []
    };
  }
};

export default obrasService;