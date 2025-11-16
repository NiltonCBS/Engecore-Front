import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import LogoEngecore from "/src/assets/images/logo engecore amarela.svg";
import { toast } from 'react-toastify';
import authService from "../services/authService.jsx";

export default function SingIn() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      await authService.login(email, senha);
      toast.success('Login realizado com sucesso!');
      navigate("/dashboard");
    } catch (err) {
      toast.error('Erro ao fazer login');
      setError(err.message);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-700 via-yellow-800 to-gray-900 flex items-center justify-center p-4">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Painel Esquerdo - Logo */}
        <div className="md:w-1/2 bg-gradient-to-br from-gray-900 via-black to-gray-800 p-12 flex flex-col justify-center items-center relative overflow-hidden">
          {/* Efeitos de fundo abstratos */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-0 left-0 w-96 h-96 bg-yellow-500 rounded-full filter blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-80 h-80 bg-yellow-600 rounded-full filter blur-3xl"></div>
          </div>
          
          <div className="relative z-10 text-center">
            <div className="mb-8 flex justify-center">
              <img 
                src={LogoEngecore} 
                alt="Logo Engecore" 
                className="w-48 h-auto object-contain"
              />
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Bem-vindo de volta
            </h1>
            <p className="text-gray-300 text-lg">
              Acesse sua conta e<br />gerencie seus projetos
            </p>
          </div>
        </div>

        {/* Painel Direito - Formulário */}
        <div className="md:w-1/2 p-12 flex flex-col justify-center bg-gray-50">
          <Card color="transparent" shadow={false} className="w-full max-w-md mx-auto">
            <Typography variant="h3" color="blue-gray" className="font-bold mb-2">
              Acesse sua conta
            </Typography>
            <Typography color="gray" className="font-normal text-gray-600 mb-8">
              Insira seus dados para acessar sua conta.
            </Typography>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2 font-medium">
                  E-mail
                </Typography>
                <Input
                  size="lg"
                  placeholder="name@mail.com"
                  className="!border-gray-300 focus:!border-yellow-500 focus:!ring-yellow-500 rounded-lg bg-white"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              
              <div>
                <Typography variant="h6" color="blue-gray" className="mb-2 font-medium">
                  Senha
                </Typography>
                <Input
                  type="password"
                  size="lg"
                  placeholder="••••••••"
                  className="!border-gray-300 focus:!border-yellow-500 focus:!ring-yellow-500 rounded-lg bg-white"
                  labelProps={{
                    className: "before:content-none after:content-none",
                  }}
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                />
              </div>

              <Button 
                className="mt-6 bg-black hover:bg-gray-800 text-white shadow-lg rounded-lg py-3 font-semibold transition-all duration-200" 
                fullWidth 
                type="submit"
              >
                Entrar
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Typography variant="small" className="text-gray-600">
                Esqueceu sua senha?{" "}
                <Link to="/recuperar-senha" className="text-yellow-800 hover:text-black font-semibold">
                  Recuperar
                </Link>
              </Typography>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}