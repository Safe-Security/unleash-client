import * as http from "http";
import * as https from "http";

import { Strategy, initialize, Unleash } from "unleash-client";

interface ParameterConfig {
    [key: string]: {
        valueFromMethod: <T>(arg: string) => T;
        fallback?: string;
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

const getBaseUrl = (parameterConfig: ParameterConfig) => {
    let baseUrl = parameterConfig.baseUrl.fallback;
    const { valueFromMethod } = parameterConfig.baseUrl;
    if (
        typeof valueFromMethod === "function" &&
        typeof valueFromMethod<string>("baseUrl") === "string"
    ) {
        try {
            baseUrl = valueFromMethod<string>("baseUrl");
        } catch (error) {
            console.error(
                "Error occurred while getting the base URL from the valueFromMethod",
                {
                    error,
                }
            );
        }
    }
    return baseUrl as string;
};

class BaseUrlStrategy extends Strategy {
    parameterConfig: ParameterConfig;

    constructor(parameters: ParameterConfig) {
        super("BaseUrl");
        this.parameterConfig = parameters;
    }

    isEnabled(parameters: { baseUrl: string }): boolean {
        let tenantUrl = getBaseUrl(this.parameterConfig);

        const allowedList = new Set(
            parameters.baseUrl.split(",").map(url => url.trim().toLowerCase())
        );
        if (tenantUrl) {
            const url = tenantUrl.toLowerCase();
            const { hostname } = new URL(tenantUrl);
            return allowedList.has(url) || allowedList.has(hostname);
        }
        console.error("No Tenant URL can be found");
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
