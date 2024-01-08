import { Auth } from "@aws-amplify/auth";

Auth.configure({
  userPoolId: "eu-central-1_3eveV5e63",
  userPoolWebClientId: "entpg6o91bssi0nvmlo40mtjb",
  region: "eu-central-1",
});

export { Auth };
