import { api } from './api';

const financeiroService = {
    // --- LISTAGENS ---
    async listarMovimentacoes() {
        const response = await api.get('/movFinanceira/listar');
        return response.data?.data || [];
    },

    async listarMovimentacoesEmpresa() {
        const response = await api.get('/movFinanceira/listar/empresa');
        return response.data?.data || [];
    },

    async listarMovimentacoesObra(idObra) {
        const response = await api.get(`/movFinanceira/listar/obra/${idObra}`);
        return response.data?.data || [];
    },

    async listarMovimentacoesCliente(idCliente) {
        const response = await api.get(`/movFinanceira/listar/cliente/${idCliente}`);
        return response.data?.data || [];
    },

    // --- SALDOS ---
    async getSaldoEmpresa() {
        const response = await api.get('/movFinanceira/saldo/empresa');
        return response.data?.data || 0;
    },

    async getSaldoObra(idObra) {
        const response = await api.get(`/movFinanceira/saldo/obra/${idObra}`);
        return response.data?.data || 0;
    },

    async getSaldoCliente(idCliente) {
        const response = await api.get(`/movFinanceira/saldo/cliente/${idCliente}`);
        return response.data?.data || 0;
    },

    // --- CRUD ---
    async cadastrar(payload) {
        const response = await api.post('/movFinanceira/cadastrar', payload);
        return response.data;
    },

    async atualizar(id, payload) {
        const response = await api.put(`/movFinanceira/alterar/${id}`, payload);
        return response.data;
    },

    async deletar(id) {
        const response = await api.delete(`/movFinanceira/deletar/${id}`);
        return response.data;
    }
};

export default financeiroService;