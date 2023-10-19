const swaggerjsDoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi:"3.0.0",
    info: {
      title: "Bank of Kigali demo Api",
      version: "0.1.0",
      description: "Kyc ",
    },
    paths: {
      "/": {
        get: {
          tags: ["App"],
          description: "Welcome to Api demo",
          responses: {
            200: {
              description: "welcome to bank of Kigali",
            },
          },
        },
      },
    },
  },
  apis: ["/app.js"],
};

const swagger = swaggerjsDoc(options);

module.exports = swagger;
