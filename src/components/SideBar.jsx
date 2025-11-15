import LogoEngecore from "/src/assets/images/logo engecore branca.svg";
import { NavLink, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { toast } from 'react-toastify'; 

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const [isProdutosOpen, setIsProdutosOpen] = useState(false);
    const [isUsersOpen, setIsUsersOpen] = useState(false);
    const [isObrasOpen, setIsObrasOpen] = useState(false);
    // NOVO NOME E NOVO ESTADO
    const [isEstoqueOpen, setIsEstoqueOpen] = useState(false);
    const [isFinanceiroOpen, setIsFinanceiroOpen] = useState(false);
    const [isCotacoesOpen, setIsCotacoesOpen] = useState(false);

    useEffect(() => {
        const path = location.pathname;

        setIsProdutosOpen(path.startsWith('/produtos'));
        setIsUsersOpen(path.startsWith('/users'));
        setIsObrasOpen(path.startsWith('/obras'));
        // LÓGICA SEPARADA
        setIsEstoqueOpen(path.startsWith('/estoque'));
        setIsFinanceiroOpen(path.startsWith('/financeiro'));
        setIsCotacoesOpen(path.startsWith('/cotacoes'));
    }, [location.pathname]);

    const toggleProdutos = () => setIsProdutosOpen(!isProdutosOpen);
    const toggleUsers = () => setIsUsersOpen(!isUsersOpen);
    const toggleObras = () => setIsObrasOpen(!isObrasOpen);
    const toggleCotacoes = () => setIsCotacoesOpen(!isCotacoesOpen);

    // FUNÇÕES SEPARADAS
    const toggleEstoque = () => setIsEstoqueOpen(!isEstoqueOpen);
    const toggleFinanceiro = () => setIsFinanceiroOpen(!isFinanceiroOpen);

const handleLogout = async () => {
        try {
            await authService.logout();
            toast.success("Logout realizado com sucesso!");
            navigate("/"); // Redireciona para a tela de login
        } catch (error) {
            toast.error("Erro ao fazer logout.");
        }
    };

    return (
        <div className="fixed inset-y-0 left-0 w-64 bg-black shadow-xl z-50 flex flex-col">
            {/* Logo */}
            <div className="flex px-4 h-16 bg-cordes-blue">
                <img
                    src={LogoEngecore}
                    alt="Logo Engecore"
                    className="w-20 h-auto object-contain rounded-lg mt-6"
                />
            </div>

            {/* Navegação com scroll */}
            <nav className="mt-8 px-4 flex-1 overflow-y-auto scrollbar-hide">
                <div className="space-y-2">
                    <NavLink
                        to="/dashboard"
                        className={({ isActive }) =>
                            `flex items-center px-4 py-3 rounded-lg transition-colors group ${isActive
                                ? "bg-gray-700 text-white"
                                : "text-gray-300 hover:bg-gray-700 hover:text-white"
                            }`
                        }
                    >
                        <i className="fas fa-home mr-3 group-hover:text-white"></i>
                        Dashboard
                    </NavLink>

                    {/* Menu Clientes */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleUsers}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-users mr-3 group-hover:text-white"></i>
                                Clientes
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isUsersOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isUsersOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/users/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lista de Clientes
                            </NavLink>
                            <NavLink to="/users/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Adicionar Cliente
                            </NavLink>
                        </div>
                    </div>

                    {/* Menu Obras */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleObras}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-building mr-3 group-hover:text-white"></i>
                                Obras
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isObrasOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isObrasOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/obras/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lista de Obras
                            </NavLink>
                            <NavLink to="/obras/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Adicionar Obra
                            </NavLink>
                            {/*<NavLink to="/obras/categorias" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-tags mr-3"></i>
                                Categorias Obras
                            </NavLink>*/ }
                        </div>
                    </div>

                    {/* Menu Produtos */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleProdutos}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-box mr-3 group-hover:text-white"></i>
                                Produtos
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isProdutosOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isProdutosOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/produtos/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lista de Produtos
                            </NavLink>
                            <NavLink to="/produtos/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Adicionar Produto
                            </NavLink>
                         
                        </div>
                    </div>

                    {/* Menu Estoque - CORRIGIDO */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleEstoque}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-boxes-stacked mr-3 group-hover:text-white"></i>
                                Estoque
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isEstoqueOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isEstoqueOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/estoque/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Movimentações
                            </NavLink>
                            <NavLink to="/estoque/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Nova Movimentação
                            </NavLink>
                        </div>
                    </div>
                    
                    {/* Menu Financeiro - CORRIGIDO */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleFinanceiro}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-brazilian-real-sign mr-3 group-hover:text-white"></i>
                                Financeiro
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isFinanceiroOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isFinanceiroOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/financeiro/listar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list mr-3"></i>
                                Lançamentos
                            </NavLink>
                            <NavLink to="/financeiro/adicionar" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-plus mr-3"></i>
                                Novo Lançamento
                            </NavLink>
                        </div>
                    </div>

                    {/* Menu Cotações */}
                    <div>
                        <button
                            type="button"
                            onClick={toggleCotacoes}
                            className="flex items-center justify-between w-full px-4 py-3 rounded-lg transition-colors group text-gray-300 hover:bg-gray-700 hover:text-white"
                        >
                            <div className="flex items-center">
                                <i className="fas fa-comments-dollar mr-3 group-hover:text-white"></i>
                                Cotações
                            </div>
                            <i className={`fas fa-chevron-down transition-transform duration-200 ${isCotacoesOpen ? "rotate-180" : ""}`}></i>
                        </button>
                        <div className={`ml-4 mt-2 space-y-1 transition-all duration-200 overflow-hidden ${isCotacoesOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}>
                            <NavLink to="/cotacoes" end className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-list-alt mr-3"></i>
                                Lista / Nova Cotação
                            </NavLink>
                            <NavLink to="/cotacoes/detalhes" className={({ isActive }) => `flex items-center px-4 py-2 rounded-lg transition-colors text-sm ${isActive ? "bg-gray-600 text-white" : "text-gray-400 hover:bg-gray-600 hover:text-white"}`}>
                                <i className="fas fa-search-dollar mr-3"></i>
                                Detalhes da Cotação
                            </NavLink>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="p-4 bg-gray-800 flex-shrink-0">
                <div className="flex items-center space-x-3">
                    <i className="fas fa-user-circle text-white text-3xl"></i>
                    <div>
                        <p className="text-white text-sm font-medium">John Admin</p>
                        <p className="text-gray-400 text-xs">Administrator</p>
                    </div>
                </div>

                {/* 3. Adicionar o botão aqui */}
                <button
                    onClick={handleLogout}
                    className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 rounded-lg transition-colors group text-gray-300 hover:bg-red-700 hover:text-white"
                >
                    <i className="fas fa-sign-out-alt"></i>
                    Sair
                </button>
            </div>
        </div>
    );
}