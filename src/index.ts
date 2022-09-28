import { Agent } from "https";

import { Strategy, initialize, isEnabled, Unleash } from "unleash-client";

interface ConfigParams {
    readonly unleashServerUrl: string;
    readonly baseUrl: string;
    readonly unleashClientApiKey: string;
}
class BaseUrlStrategy extends Strategy {
    baseUrl: string;
    constructor(baseUrl: string) {
        super("BaseUrl");
        this.baseUrl = baseUrl;
    }

    isEnabled(parameters: { baseUrl: string }): boolean {
        const allowedList = new Set(
            parameters.baseUrl.split(",").map(url => url.trim().toLowerCase())
        );
        const url = this.baseUrl.toLowerCase();
        const { hostname } = new URL(url);
        return allowedList.has(url) || allowedList.has(hostname);
    }
}

export const getInstance = (config: ConfigParams) => {
    const { unleashServerUrl, baseUrl, unleashClientApiKey } = config;
    const unleash = initialize({
        url: unleashServerUrl,
        appName: new URL(baseUrl).hostname,
        strategies: [new BaseUrlStrategy(baseUrl)],
        //to leverage reuse of HTTP connections
        httpOptions: { agent: url => new Agent({ keepAlive: true }) },
        customHeaders: {
            Authorization: unleashClientApiKey,
        },
    });
    return unleash;
};
