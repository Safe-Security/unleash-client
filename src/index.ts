import { Agent } from "https";

import { Strategy, initialize, isEnabled, Unleash } from "unleash-client";

interface configParams {
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

const getInstance = (config: configParams) => {
    const { unleashServerUrl, baseUrl, unleashClientApiKey } = config;
    const unleash = initialize({
        url: unleashServerUrl,
        appName: new URL(baseUrl).hostname,
        strategies: [new BaseUrlStrategy(baseUrl)],
        //Extra parameter is added as a part of reusing the HTTP connection.
        httpOptions: { agent: url => new Agent({ keepAlive: true }) },
        customHeaders: {
            Authorization: unleashClientApiKey,
        },
    });
    return unleash;
};
export default getInstance;
