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
    try {
        if (
            typeof valueFromMethod === "function" &&
            typeof valueFromMethod<string>("baseUrl") === "string"
        ) {
            baseUrl = valueFromMethod<string>("baseUrl");
        }
    } catch (error) {
        console.error(
            "Error occurred while getting the base URL from the valueFromMethod, using fallback value now!"
        );
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
        let url = getBaseUrl(this.parameterConfig);

        const allowedList = new Set(
            parameters.baseUrl.split(",").map(url => url.trim().toLowerCase())
        );
        const allowedHostname = new Set<string>();

        [...allowedList].forEach(url => {
            try {
                const hostname = new URL(url.toLowerCase().trim()).hostname;
                allowedHostname.add(hostname);
            } catch (error) {
                error;
            }
        });

        if (url) {
            const { hostname } = new URL(url.toLowerCase().trim());
            return allowedList.has(url) || allowedHostname.has(hostname);
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
