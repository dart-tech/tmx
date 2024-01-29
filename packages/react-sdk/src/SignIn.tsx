import { useForm, SubmitHandler } from "react-hook-form";
import { APP_CURRENT_STATE, useAppState } from "./AppContext.js";
import { useState } from "react";

type Inputs = {
  email: string;
  password: string;
};

export default function SignIn() {
  const { backendProvider, Resolvers, setAuth, app, setAppCurrentState } =
    useAppState();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [signInError, setSignInError] = useState<string | null>(null);
  const { register, handleSubmit } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    setIsSigningIn(true);
    setSignInError(null);
    try {
      const [user, error] = await backendProvider.signIn(data);
      if (user) {
        setAuth({
          user,
          isInitialized: true,
          isAuthenticated: true,
          errorInitializing: "",
          busyInitializing: false,
        });
        setAppCurrentState(APP_CURRENT_STATE.STALE);
      }
    } catch (error) {
      let message = "An error occurred.";
      if (error instanceof Error) {
        message = error.message;
      }
      setSignInError(message);
    } finally {
      setIsSigningIn(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        backgroundColor: "#0093E9",
        backgroundImage: "linear-gradient(160deg, #0093E9 0%, #80D0C7 100%)",
      }}
    >
      <Resolvers.Card
        style={{
          minWidth: "450px",
        }}
      >
        <Resolvers.CardHeader className="flex gap-3">
          <div className="flex flex-col">
            <p className="text-md">Sign In to {app?.name}</p>
            <p className="text-small text-default-500">{app?.description}</p>
          </div>
        </Resolvers.CardHeader>
        <Resolvers.Divider />
        <Resolvers.CardBody>
          <form onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Email address
              </label>
              <div className="mt-2">
                <Resolvers.Input
                  type="email"
                  {...register("email")}
                  placeholder="Email"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium leading-6 text-gray-900"
              >
                Password
              </label>
              <div className="mt-2">
                <Resolvers.Input
                  type="password"
                  placeholder="Password"
                  required
                  {...register("password", { required: true })}
                />
              </div>
            </div>
            <div>
              <Resolvers.Button
                isLoading={isSigningIn}
                type="submit"
                style={{
                  marginTop: "1rem",
                }}
              >
                Sign in
              </Resolvers.Button>
            </div>
            <div>
              {signInError && (
                <p className="text-red-500 text-xs italic">{signInError}</p>
              )}
            </div>
          </form>
        </Resolvers.CardBody>
      </Resolvers.Card>
    </div>
  );
}
