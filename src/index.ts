import * as http from "http";
import * as https from "https";

import { Strategy, initialize, Unleash } from "unleash-client";

interface ParameterConfig {
    /**
     * TODO: This should also support a static value
     */
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

            if (!result && this.parameterConfig.tenantUrl.fallback) {
                const fallbackUrl = this.parameterConfig.tenantUrl.fallback;
                const { hostname } = new URL(fallbackUrl);
                return (
                    allowedList.has(fallbackUrl.trim().toLowerCase()) ||
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

    if (unleash.listenerCount("error") === 0) {
        unleash.on("error", (error: Error) => {
            console.error(error.message);
        });
    }

    return unleash;
};

const DEFAULT_READY_TIMEOUT_MS = 5_000;

/**
 * Policy for what getInstanceAsync does when the Unleash client fails to
 * synchronize with the server within the timeout:
 *   - "throw": reject with UnleashReadyTimeoutError so the caller can decide to
 *     fail startup (fail-fast). The library never calls process.exit itself.
 *   - "proceed": resolve with the client anyway, whose cache is empty so every
 *     isEnabled() returns false until the next successful refresh (fail-open).
 */
export type OnReadyTimeout = "throw" | "proceed";

export class UnleashReadyTimeoutError extends Error {
    constructor(readyTimeoutMs: number) {
        super(
            `Unleash client not synchronized after ${readyTimeoutMs}ms; refusing to proceed with empty feature-flag cache`
        );
        this.name = "UnleashReadyTimeoutError";
    }
}

/**
 * Returns an Unleash client that has synchronized with the server, so the
 * first isEnabled() call reflects real toggles instead of an empty cache.
 *
 * Note on connection errors: an Unleash "error" event (e.g. ECONNREFUSED) does
 * NOT reject this promise early — it is logged by the error handler and the
 * client keeps retrying. The promise only settles when the client synchronizes
 * or the readyTimeoutMs elapses, at which point the onTimeout policy applies.
 */
export const getInstanceAsync = async (
    config: ConfigParams,
    refreshInterval: number = 60_000,
    readyTimeoutMs: number = DEFAULT_READY_TIMEOUT_MS,
    onTimeout: OnReadyTimeout = "throw"
): Promise<Unleash> => {
    const unleash = getInstance(config, refreshInterval);

    await new Promise<void>((resolve, reject) => {
        if (unleash.isSynchronized()) {
            console.log("Unleash client already synchronized");
            resolve();
            return;
        }

        const onSynchronized = () => {
            clearTimeout(timeout);
            console.log("Unleash client synchronized, feature toggles loaded");
            resolve();
        };

        const timeout = setTimeout(() => {
            unleash.off("synchronized", onSynchronized);
            if (onTimeout === "throw") {
                reject(new UnleashReadyTimeoutError(readyTimeoutMs));
                return;
            }
            console.warn(
                "Unleash client not synchronized after timeout, proceeding with empty cache"
            );
            resolve();
        }, readyTimeoutMs);

        unleash.once("synchronized", onSynchronized);
    });

    return unleash;
};

export { Unleash } from "unleash-client";
export type { ConfigParams };
