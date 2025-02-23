import { FrontendApi, Configuration } from "@ory/kratos-client"

const kratosEndpoint = "/api/kratos" 

export const kratos = new FrontendApi(
  new Configuration({
    basePath: kratosEndpoint,
    baseOptions: {
      withCredentials: true,
    }
  })
)