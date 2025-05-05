import React, { useEffect, useState } from "react";
import { useAuth } from "../Contexts/AuthContext";
import { useHistory } from "react-router-dom";
import { IonIcon, IonSpinner, useIonRouter } from "@ionic/react";
import { eye, eyeOff } from "ionicons/icons";
import "./Login.css";
import RenderRegisterComponent from "../components/RenderRegisterComponent";
import LmtsLogo from "../Assets/LmtsLogo.png";
import logoReverseRedondaWhite from "../Assets/logoReverseRedondaWhite.png";
import SECRETARIA_MUNICIPAL_DAS_MULHERES from "../Assets/SECRETARIA_MUNICIPAL_DAS_MULHERES.png";
import ACS from "../Assets/ACS.png";
import { FieldValues, useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import InputErrorMessage from "../components/inputErrorMessage";
import { maskCpf, unMaskNumbers } from "../utils/mask";
import { isValidCPF } from "../utils/utils";

export enum LoginScreens {
  LOGIN,
  REGISTER,
}

const schema = z.object({
  identifier: z.union([
    z.string().email("Email ou CPF inválido"),
    z
      .string()
      .min(11, "CPF deve ter 11 dígitos")
      .max(14, "CPF muito longo")
      .refine((value) => {
        const unmasked = unMaskNumbers(value);
        return unmasked.length === 11;
      }, "CPF inválido"),
  ]),
  password: z
    .string()
    .nonempty("A senha não pode ficar vazia.")
    .min(8, "A senha deve ter pelo menos 8 dígitos."),
});

type FormData = z.infer<typeof schema>;

const Login: React.FC = () => {
  const { login, user } = useAuth();
  const history = useHistory();
  const ionRouter = useIonRouter();

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [screenState, setScreenState] = useState<LoginScreens>(
    LoginScreens.LOGIN
  );
  const {
    handleSubmit,
    register,
    formState: { errors },
    setError,
    setValue,
    watch,
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  // useEffect(() => {
  //   if (user) {
  //      history.replace("/tabs/tab1");
  //   }
  // }, [user, history]);

  const identifierValue = watch("identifier");

  useEffect(() => {
    const onlyNumbers = identifierValue.replace(/\D/g, "");
    const canBeCPF = onlyNumbers.length === 11 && /^\d+$/.test(identifierValue);
    if (canBeCPF) setValue("identifier", maskCpf(identifierValue));
    else setValue("identifier", identifierValue);
  }, [identifierValue]);

  const handleLogin = async (data: FieldValues) => {
    setLoading(true);

    let { identifier, password } = data;
    const onlyNumbers = identifierValue.replace(/\D/g, "");
    const isCPF = onlyNumbers.length === 11 && isValidCPF(onlyNumbers);
    if (isCPF) identifier = unMaskNumbers(identifier);

    const response = await login(identifier, password);

    if (response.success && response.data) {
      history.replace(
        response.data.isOnboardingViewed ? "/tabs/tab1" : "/onboarding"
      );
    } else {
      if (
        response.message ===
        "Este e-mail ainda não foi confirmado. Reenviamos um novo código."
      ) {
        ionRouter.push(
          `/confirmacao-codigo?identifier=${encodeURIComponent(identifier)}`,
          "forward"
        );
        return;
      }

      setError("root", { message: "Credenciais inválidas. Tente novamente." });
    }

    setLoading(false);
  };

  const renderLoginComponent = () => {
    return (
      <>
        <h2 className="login-title">Entrar na sua conta</h2>
        <div>
          <form onSubmit={handleSubmit(handleLogin)}>
            <div className="input-group">
              <label htmlFor="identifier">E-mail ou CPF</label>
              <input
                type="text"
                className="Input-Login"
                placeholder="Email ou CPF"
                {...register("identifier")}
                aria-invalid={errors.password ? "true" : "false"}
              />
              {errors.identifier && errors.identifier.message && (
                <InputErrorMessage message={errors.identifier.message} />
              )}
            </div>

            <div className="input-group">
              <label htmlFor="password">Senha</label>
              <div className="password-input-container">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Senha"
                  className="Input-Login"
                  {...register("password")}
                  aria-invalid={errors.password ? "true" : "false"}
                />
                <IonIcon
                  icon={showPassword ? eyeOff : eye}
                  onClick={() => setShowPassword(!showPassword)}
                  className="toggle-password-icon"
                />
              </div>
              {errors.password && errors.password.message && (
                <InputErrorMessage message={errors.password.message} />
              )}
            </div>

            {errors.root && errors.root.message && (
              <InputErrorMessage message={errors.root.message} />
            )}

            <button type="submit" className="login-button" disabled={loading}>
              {loading ? (
                <IonSpinner name="crescent" color="light" />
              ) : (
                "Entrar"
              )}
            </button>
          </form>
          <p className="signup-prompt">
            Ainda não tem uma conta?{" "}
            <span
              className="signup-link"
              onClick={() => handleChangeScreen(LoginScreens.REGISTER)}
            >
              Cadastre-se aqui
            </span>
          </p>
          <div className="parceiros-box">
            <p className="parceiros-tittle">Parceiros:</p>
            <div className="parceiros">
              <div className="parceiro">
                <img src={LmtsLogo} alt="" className="lmts" />
                {/* <div className="caption">Legenda</div> */}
              </div>
              <div className="parceiro">
                <img
                  src={SECRETARIA_MUNICIPAL_DAS_MULHERES}
                  alt=""
                  className="secretaria"
                />
                {/* <div className="caption">Legenda</div> */}
              </div>
              <div className="parceiro">
                <img src={ACS} alt="" className="ACS" />
                {/* <div className="caption">Legenda</div> */}
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  const handleChangeScreen = (screen: LoginScreens) => {
    setScreenState(screen);
  };

  return (
    <div className="login-container">
      <div className="logoLogin-container">
        <img src={logoReverseRedondaWhite} />
        <h3>Conecta Elas</h3>
      </div>
      <div
        className={`login-box ${
          screenState === LoginScreens.REGISTER && "full"
        }`}
      >
        {screenState === LoginScreens.LOGIN && renderLoginComponent()}
        {screenState === LoginScreens.REGISTER && (
          <RenderRegisterComponent handleChangeScreen={handleChangeScreen} />
        )}
      </div>
    </div>
  );
};

export default Login;
