import React, { useState } from "react";
import {
  Card,
  Input,
  Button,
  Typography,
} from "@material-tailwind/react";
import { Link, useNavigate } from "react-router-dom";
import LogoEngecore from "/src/assets/images/engecore.svg";
import { toast } from 'react-toastify';
//import authService from "../services/authService.jsx"; // Importe o serviço

export default function SingIn() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(""); // Limpa o erro anterior

    try {
      //await authService.login(email, senha);
      // Se o login for bem-sucedido, redirecione para o dashboard
      toast.success('Login realizado com sucesso!');
      navigate("/dashboard");
    } catch (err) {
      // Se houver um erro, exiba a mensagem
      toast.error('Erro ao fazer login');
      setError(err.message);
    }
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      <div className="flex-1 flex items-center justify-center bg-black m-3 rounded-lg shadow-[16px_0px_15px_rgba(0,0,0,0.6)]">
        <div className="w-full max-w-xs md:max-w-sm">
          <img src={LogoEngecore} alt="Logo Engecore" className="w-full h-auto object-contain rounded-lg" />
        </div>
      </div>
      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-6 text-center m-3">
        <Card color="transparent" shadow={false} className="p-8 w-full max-w-md">
          <Typography variant="h4" color="blue-gray">
            Acesse sua conta
          </Typography>
          <Typography color="gray" className="mt-1 font-normal text-yellow-900">
            Insira seus dados para acessar sua conta.
          </Typography>

          {error && (
            <Typography color="red" className="mt-4 font-normal">
              {error}
            </Typography>
          )}
          
          <form className="mt-8 mb-2" onSubmit={handleSubmit}>
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                E-mail
              </Typography>
              <Input
                size="lg"
                placeholder="name@mail.com"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Senha
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
              />
            </div>
            <Button className="mt-6 text-yellow-900" fullWidth type="submit">
              Entrar
            </Button>
            <Typography color="gray" className="mt-4 text-center font-normal">
              Não tem uma conta?{" "}
              <Link to="/register" className="font-medium text-gray-900 hover:text-yellow-900 underline">
                Cadastre-se
              </Link>
            </Typography>
          </form>
        </Card>
      </div>
    </div>
  );
}