import { Navigate, Outlet } from "react-router-dom";
import authService from "../services/authService";

const PrivateRoutes = () => {
  // Verifica se existe usuário logado usando seu serviço existente
  const user = authService.getCurrentUserLocal();

  // Se tiver usuário, renderiza as rotas filhas (Outlet)
  // Se não tiver, redireciona para o login ("/")
  return user ? <Outlet /> : <Navigate to="/" replace />;
};

export default PrivateRoutes;