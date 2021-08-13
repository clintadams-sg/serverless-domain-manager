import chai = require("chai");
import "mocha";
import itParam = require("mocha-param");

import utilities = require("./test-utilities");
import {getRandomString, TEST_DOMAIN} from "./base";// tslint:disable-line

const expect = chai.expect;
const CONFIGS_FOLDER = "deploy";
const TIMEOUT_MINUTES = 10 * 60 * 1000; // 10 minutes in milliseconds
const RANDOM_STRING = getRandomString();

const testCases = [
    {
        testBasePath: "(none)",
        testDescription: "Creates domain as part of deploy",
        testDomain: `auto-domain-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "EDGE",
        testFolder: `${CONFIGS_FOLDER}/auto-domain`,
        testStage: "test",
    },
    {
        testBasePath: "(none)",
        testDescription: "Enabled with default values",
        testDomain: `enabled-default-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "EDGE",
        testFolder: `${CONFIGS_FOLDER}/enabled-default`,
        testStage: "test",
    },
    {
        createApiGateway: true,
        testBasePath: "(none)",
        testDescription: "Enabled with custom api gateway",
        testDomain: `enabled-custom-apigateway-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "EDGE",
        testFolder: `${CONFIGS_FOLDER}/enabled-custom-apigateway`,
        testStage: "test",
    },
    {
        testBasePath: "api",
        testDescription: "Enabled with custom basepath",
        testDomain: `enabled-basepath-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "EDGE",
        testFolder: `${CONFIGS_FOLDER}/enabled-basepath`,
        testStage: "test",
    },
    {
        testBasePath: "(none)",
        testDescription: "Enabled with custom stage and empty basepath",
        testDomain: `enabled-stage-basepath-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "EDGE",
        testFolder: `${CONFIGS_FOLDER}/enabled-stage-basepath`,
        testStage: "test",
    },
    {
        testBasePath: "api",
        testDescription: "Enabled with regional endpoint, custom basePath",
        testDomain: `enabled-regional-basepath-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "REGIONAL",
        testFolder: `${CONFIGS_FOLDER}/enabled-regional-basepath`,
        testStage: "test",
    },
    {
        testBasePath: "(none)",
        testDescription: "Enabled with regional endpoint, custom stage, empty basepath",
        testDomain: `enabled-regional-stage-basepath-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "REGIONAL",
        testFolder: `${CONFIGS_FOLDER}/enabled-regional-stage-basepath`,
        testStage: "test",
    },
    {
        testBasePath: "(none)",
        testDescription: "Create Web socket API and domain name",
        testDomain: `web-socket-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "REGIONAL",
        testFolder: `${CONFIGS_FOLDER}/web-socket`,
        testStage: "test",
    },
    {
        testBasePath: "(none)",
        testDescription: "Create HTTP API and domain name",
        testDomain: `http-api-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "REGIONAL",
        testFolder: `${CONFIGS_FOLDER}/http-api`,
        testStage: "$default",
    },
    {
        testBasePath: "(none)",
        testDescription: "Deploy regional domain with TLS 1.0",
        testDomain: `regional-tls-1-0-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "REGIONAL",
        testFolder: `${CONFIGS_FOLDER}/regional-tls-1-0`,
        testStage: "test",
    },
    {
        testBasePath: "api",
        testDescription: "Deploy with nested CloudFormation stack",
        testDomain: `basepath-nested-stack-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "EDGE",
        testFolder: `${CONFIGS_FOLDER}/basepath-nested-stack`,
        testStage: "test",
    },
    {
        testBasePath: "(none)",
        testDescription: "Deploy with latency routing",
        testDomain: `route-53-latency-routing-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "REGIONAL",
        testFolder: `${CONFIGS_FOLDER}/route-53-latency-routing`,
        testStage: "test",
    },
    {
        testBasePath: "(none)",
        testDescription: "Deploy with weighted routing",
        testDomain: `route-53-weighted-routing-${RANDOM_STRING}.${TEST_DOMAIN}`,
        testEndpoint: "REGIONAL",
        testFolder: `${CONFIGS_FOLDER}/route-53-weighted-routing`,
        testStage: "test",
    },
];

describe("Integration Tests", function() {
    this.timeout(TIMEOUT_MINUTES);

    describe("Configuration Tests", () => {
        // @ts-ignore
        itParam("${value.testDescription}", testCases, async (value) => {
            let restApiInfo;
            if (value.createApiGateway) {
                restApiInfo = await utilities.setupApiGatewayResources(RANDOM_STRING);
            }
            try {
                await utilities.createResources(value.testFolder, value.testDomain, RANDOM_STRING);
                const stage = await utilities.getStage(value.testDomain);
                expect(stage).to.equal(value.testStage);

                const basePath = await utilities.getBasePath(value.testDomain);
                expect(basePath).to.equal(value.testBasePath);

                const endpoint = await utilities.getEndpointType(value.testDomain);
                expect(endpoint).to.equal(value.testEndpoint);
            } finally {
                await utilities.destroyResources(value.testDomain, RANDOM_STRING);
                if (value.createApiGateway) {
                    await utilities.deleteApiGatewayResources(restApiInfo.restApiId);
                }
            }
        });
    });
});
