import swaggerJSDoc from "swagger-jsdoc";

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "bank of kigali",
      version: "0.1.0",
      description: "welcome to the well documented gdsc-dekut backend",
    },
    paths: {
      "/app": {
        get: {
          tags: ["app"],
          description: "the main route",
          responses: {
            200: {
              description: "user logged in successfully",
            },
            404: {
              description: "user does not exists",
            },
            500: {
              description: "something went wrong",
            },
          },
        },
      },
      "/users": {
        get: {
          tags: ["app"],
          description: "get all the users",

          responses: {
            200: {
              description: "user logged in successfully",
            },
            404: {
              description: "user does not exists",
            },
            500: {
              description: "something went wrong",
            },
          },
        },
      },
    },
  },
  apis: ["./*/.js"],
};

export const swagger = swaggerJSDoc(options);
