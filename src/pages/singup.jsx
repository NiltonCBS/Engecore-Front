import { 
  Card,
  Input,
  Checkbox,
  Button,
  Typography,
} from "@material-tailwind/react";

import { Link } from "react-router-dom";
 
import LogoEngecore from "/src/assets/images/logo engecore amarela.svg";
 
export default function SimpleRegistrationForm() {
  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Formulário */}
      <div className="flex-1 flex items-center justify-center p-3 text-center">
        <Card color="transparent" shadow={false} className="p-3 w-full max-w-md">
          <Typography variant="h4" color="blue-gray">
            Registre-se
          </Typography>
          <Typography color="gray" className="mt-1 font-normal">
            Prazer em conhecê-lo! Digite seus dados para criar sua conta.
          </Typography>
          
          <form className="mt-8 mb-2">
            <div className="mb-1 flex flex-col gap-6">
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Nome Completo:
              </Typography>
              <Input
                size="lg"
                placeholder="Seu nome completo"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Digite seu E-mail
              </Typography>
              <Input
                size="lg"
                placeholder="name@mail.com"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Digite sua Senha
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
              <Typography variant="h6" color="blue-gray" className="-mb-3">
                Confirme sua Senha
              </Typography>
              <Input
                type="password"
                size="lg"
                placeholder="********"
                className="!border-t-blue-gray-200 focus:!border-t-gray-900"
                labelProps={{
                  className: "before:content-none after:content-none",
                }}
              />
            </div>
            <Checkbox
              label={
                <Typography
                  variant="small"
                  color="gray"
                  className="flex items-center font-normal"
                >
                  Eu concordo com os
                  <a
                    href="#"
                    className="font-medium transition-colors hover:text-gray-900 underline"
                  >
                    &nbsp;Termos e Condições
                  </a>
                </Typography>
              }
              containerProps={{ className: "-ml-2.5" }}
            />
            <Button className="mt-6 text-yellow-900" fullWidth>
              Cadastre-se
            </Button>
            <Typography color="gray" className="mt-4 text-center font-normal">
              Já tem uma conta?{" "}
              <Link to="/" className="font-medium text-gray-900 hover:text-yellow-900 underline">
                Entrar
              </Link>
            </Typography>
          </form>
        </Card>
      </div>

      {/* Logo */}
      <div className="flex-1 flex items-center justify-center bg-black m-3 rounded-lg">
       <div className=" max-w-xs md:max-w-sm ">
                 <img src={LogoEngecore} alt="Logo Engecore" className="w-40 h-auto object-contain rounded-lg  " />
        </div>
      </div>
    </div>
  );
}
