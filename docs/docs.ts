import swaggerJsdoc from "swagger-jsdoc";

const options = {
  swaggerDefinition: {
    info: {
      title: 'Hello World',
      version: '1.0.0',
    },
  },
  apis: ['../routes/*.js'],
};

export const swaggerDocs = swaggerJsdoc(options);