# logger

This package provides the Unleash configuration for used in Safe Security.

## Motivation

Currently in Safe Security, all the services that require logging functionality imported a library & configured it as per the service needs.
Although this seems _okay_ initially, it becomes a challenge to do this across multiple services as care needs to be taken to keep the
dependency versions consistent across, code reusability takes a back seat since the configuration is duplicated everywhere, and is prone to human errors.

In order to solve this problem, the `Unleash` library used currently has been encapsulated in this package along with the desired defaults set up so that
the client does not have to worry about setting up a verbose configuration in multiple files.

## Installation

```bash
npm install unleash-client-safe-security
```

```bash
yarn add unleash-client-safe-security
```

## Usage

The introduction of this package makes it very easy for clients to consume & leverage the logging capabilities.

In Javascript:

```js
const { getInstance } = require("unleash-client-safe-security");

const unleash = getInstance({
    unleashServerUrl: process.env.UNLEASH_SERVER_URL || "",
    baseUrl: process.env.BASE_URL || "",
    unleashClientApiKey: process.env.UNLEASH_CLIENT_API_KEY || "",
});
```

In Typescript:

```js
import { getInstance } from "unleash-client-safe-security";

const unleash = getInstance({
    unleashServerUrl: process.env.UNLEASH_SERVER_URL || "",
    baseUrl: process.env.BASE_URL || "",
    unleashClientApiKey: process.env.UNLEASH_CLIENT_API_KEY || "",
});
```
