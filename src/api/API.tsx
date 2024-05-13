import axios, { AxiosInstance, AxiosResponse } from "axios";
import { toast } from "react-toastify";
import {
  CustomerSignInResult,
  MyCustomerDraft,
  MyCustomerSignin,
} from "types/API/Customer";
import toastOptions from "../helpers/toastOptions";

class API {
  protected instance: AxiosInstance | undefined;

  constructor() {
    this.createAPI();
  }

  private async createAPI(customerData?: MyCustomerDraft): Promise<void> {
    const token = localStorage.getItem("ACCES_TOKEN");
    if (!token || customerData) {
      this.getToken(customerData).then(() => this.createAPI());
    } else {
      const { access_token: accessToken, token_type: tokenType } =
        JSON.parse(token);
      this.instance = axios.create({
        baseURL: `${process.env.CTP_API_URL}/${process.env.CTP_PROJECT_KEY}`,
        headers: { Authorization: `${tokenType} ${accessToken}` },
        responseType: "json",
      });
    }
  }

  private async getToken(customerData?: MyCustomerDraft): Promise<void> {
    try {
      const auth = {
        username: process.env.CTP_CLIENT_ID ?? "",
        password: process.env.CTP_CLIENT_SECRET ?? "",
      };
      const response = customerData
        ? await axios.post(
            `${process.env.CTP_AUTH_URL}/oauth/${process.env.CTP_PROJECT_KEY}/customers/token`,
            null,
            {
              params: {
                grant_type: "password",
                scope: process.env.CTP_SCOPES,
                username: customerData.email,
                password: customerData.password,
              },
              auth,
            }
          )
        : await axios.post(
            `${process.env.CTP_AUTH_URL}/oauth/${process.env.CTP_PROJECT_KEY}/anonymous/token`,
            null,
            {
              params: {
                grant_type: "client_credentials",
                scope: process.env.CTP_SCOPES,
              },
              auth,
            }
          );
      if (response.status === 200) {
        localStorage.setItem("ACCES_TOKEN", JSON.stringify(response.data));
      } else {
        toast.error(
          `Error fetching token: ${response.status} ${response.statusText}`
        );
      }
    } catch (error) {
      if (error instanceof Error)
        toast.error(`Error fetching token: ${error.message}`);
    }
  }

  public async createCustomer(customerData: MyCustomerDraft): Promise<void> {
    this.instance
      ?.post("/me/signup", customerData)
      .then((response) => {
        if (response.status === 201) {
          this.createAPI(customerData);
          toast.success("Registration was successful", toastOptions);
        } else
          toast.error(
            `Something went wrong during the registration process. Please, should try again later.`,
            toastOptions
          );
      })
      .catch((error) =>
        toast.error(
          error.response.status === 400
            ? `Error registration user: re-registration of an already registered user.\n
               Please, login or use another email address.`
            : `Something went wrong during the registration process. Please, should try again later.`,
          toastOptions
        )
      );
  }

  public async signInCustomer(customerData: MyCustomerSignin): Promise<void> {
    this.createAPI(customerData).then(() => {
      if (this.instance)
        toast
          .promise(
            this.instance.post("/me/login/", customerData),
            {
              pending: "Please wait.",
              success: {
                render(props) {
                  const response = props.data as AxiosResponse;
                  if (response.status === 200) {
                    const { customer } = response.data as CustomerSignInResult;
                    return `Welcome ${customer.firstName ?? ""} ${customer.lastName ?? ""}!`;
                  }
                  throw new Error(
                    "Something went wrong during the registration process. Please, should try again later."
                  );
                },
              },
              error: {
                render(props) {
                  return `${props.data}`;
                },
              },
            },
            toastOptions
          )
          .catch(console.log);
    });
  }
}
const clientAPI = new API();
export default clientAPI;
