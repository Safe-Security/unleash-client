# unleash-client

This package provides the Unleash configuration used in Safe Security.

## Motivation

Currently in Safe Security, all the services that leverage Unleash functionality required to define the unleash communication mechanism which lead to boilerplate code in each of the services.
Adhering to the DRY (Don't Repeat Yourself) principle, the common configuration has been extracted out as part of this repository and made available for consumption via NPM package.

## Installation

```bash
npm install unleash-client-safe-security
```

```bash
yarn add unleash-client-safe-security
```

## Usage

The introduction of this package makes it very easy for clients to consume & leverage the unleash capabilities.

In Javascript:

```js
const { getInstance } = require("unleash-client-safe-security");

const unleash = getInstance({
    unleashServerUrl: <unleash-url>,
    baseUrl: <app-url>,
    unleashClientApiKey: "zaCELgL.0imfnc8mVLWwsAawjYr4Rx-Af50DDqtlx",
});
```

In Typescript:

```typescript
import { getInstance } from "unleash-client-safe-security";

const unleash = getInstance({
  unleashServerUrl: <unleash-url>,
    baseUrl: <app-url>,
    unleashClientApiKey: "zaCELgL.0imfnc8mVLWwsAawjYr4Rx-Af50DDqtlx",
    unleashAppName: "my-app.com",
    parameters: {
       tenantUrl: {
         valueFromMethod: getTenantUrl(),
         fallback: process.env.TENANT_URL
       }
    }
});
```
