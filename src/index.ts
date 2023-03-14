import * as http from "http";
import * as https from "https";

import { Strategy, initialize, Unleash } from "unleash-client";

interface ParameterConfig {
    /**
     * TODO: This should also support a static value
     */
    [key: string]:
        | {
              valueFromMethod: <T>(arg: string) => T;
              fallback?: string;
          }
        | {
              valueFromMethod?: <T>(arg: string) => T;
              fallback: string;
          };
}
interface ConfigParams {
    readonly unleashServerUrl: string;
    readonly unleashClientApiKey: string;
    readonly unleashAppName: string;
    parameters: ParameterConfig;
}

const httpAgent = new http.Agent({
    keepAlive: true,
});

const httpsAgent = new https.Agent({
    keepAlive: true,
});

const getDefaultAgent = (url: URL) =>
    url.protocol === "https:" ? httpsAgent : httpAgent;

/**
 * It returns the tenantUrl from the parameterConfig.tenantUrl.fallback property if the valueFromMethod
 * property is not a function or if the valueFromMethod function does not return a string
 * @param {ParameterConfig} parameterConfig - ParameterConfig
 * @returns A function that takes a parameterConfig object and returns tenantUrl.
 */
const getTenantUrl = (parameterConfig: ParameterConfig) => {
    let tenantUrl = parameterConfig.tenantUrl.fallback;
    const { valueFromMethod } = parameterConfig.tenantUrl;
    try {
        if (
            typeof valueFromMethod === "function" &&
            typeof valueFromMethod<string>("tenantUrl") === "string"
        ) {
            tenantUrl = valueFromMethod<string>("tenantUrl");
        }
    } catch {}
    return tenantUrl as string;
};

class BaseUrlStrategy extends Strategy {
    parameterConfig: ParameterConfig;

    constructor(parameters: ParameterConfig) {
        super("BaseUrl");
        this.parameterConfig = parameters;
    }

    isEnabled(parameters: { baseUrl: string }): boolean {
        /**
         * TODO: This should be a generalized method to get any parameter
         */
        let url = getTenantUrl(this.parameterConfig);

        const allowedList = new Set(
            parameters.baseUrl.split(",").map(url => url.trim().toLowerCase())
        );

        const allowedHostname = new Set<string>();

        /* Trying to get the hostname from the url. */
        [...allowedList].forEach(url => {
            try {
                const { hostname } = new URL(url);
                allowedHostname.add(hostname);
            } catch (error) {
                error;
            }
        });

        /* This is a check to see if the url is in the allowed list. */
        if (url) {
            const { hostname } = new URL(url);
            const result =
                allowedList.has(url.trim().toLowerCase()) ||
                allowedList.has(hostname) ||
                allowedHostname.has(hostname);

            if (
                !result &&
                this.parameterConfig.alternateUrl &&
                this.parameterConfig.alternateUrl.fallback
            ) {
                const alternateUrl = this.parameterConfig.alternateUrl.fallback;
                const { hostname } = new URL(alternateUrl);
                return (
                    allowedList.has(alternateUrl.trim().toLowerCase()) ||
                    allowedList.has(hostname) ||
                    allowedHostname.has(hostname)
                );
            }

            return result;
        }

        console.error("No base URL can be retrieved from the parameters");
        return false;
    }
}

export const getInstance = (
    config: ConfigParams,
    refreshInterval: number = 60_000
): Unleash => {
    const {
        unleashServerUrl,
        unleashClientApiKey,
        unleashAppName,
        parameters,
    } = config;

    const unleash = initialize({
        url: unleashServerUrl,
        refreshInterval,
        appName: unleashAppName,
        strategies: [new BaseUrlStrategy(parameters)],
        //to leverage reuse of HTTP connections
        httpOptions: { agent: getDefaultAgent },
        customHeaders: {
            Authorization: unleashClientApiKey,
        },
    });
    return unleash;
};
