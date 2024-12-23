export interface DecapCMSOptions {
  decapCMSSrcUrl?: string;
  decapCMSVersion?: string;
  adminDisabled?: boolean;
  adminRoute?: string;
  oauthDisabled?: boolean;
  oauthLoginRoute?: string;
  oauthCallbackRoute?: string;
}

const defaultOptions: DecapCMSOptions = {
  decapCMSSrcUrl: "",
  decapCMSVersion: "",
  adminDisabled: false,
  adminRoute: "/admin",
  oauthDisabled: false,
  oauthLoginRoute: "/oauth",
  oauthCallbackRoute: "/oauth/callback",
};