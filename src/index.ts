import { Agent } from "http";

import { Strategy, initialize, isEnabled, Unleash } from "unleash-client";
class BaseUrlStrategy extends Strategy {
  baseUrl: string;
  constructor(baseUrl: string) {
    super("BaseUrl");
    this.baseUrl = baseUrl;
  }

  isEnabled(parameters: { baseUrl: string }): boolean {
    const allowedList = new Set(
      parameters.baseUrl.split(",").map((url) => url.trim().toLowerCase())
    );
    const url = (this.baseUrl as string).toLowerCase();
    const { hostname } = new URL(url);
    return allowedList.has(url) || allowedList.has(hostname);
  }
}

function getInstance(
  unleashServerUrl?: string,
  baseUrl?: string,
  unleashClientApiKey?: string
) {
  const unleash =
    !!unleashServerUrl && !!unleashClientApiKey
      ? initialize({
          url: unleashServerUrl,
          appName: new URL(baseUrl as string).hostname,
          instanceId: "1",
          strategies: [new BaseUrlStrategy(baseUrl as string)],
          //Extra parameter is added as a part of reusing the HTTP connection.
          httpOptions: { agent: (url) => new Agent({ keepAlive: true }) },
          customHeaders: {
            Authorization: unleashClientApiKey,
          },
        })
      : null;
  return unleash;
}

export default getInstance;
