import Ajv from 'ajv';

const ajv = new Ajv();

const schema = {
  type: 'array',
  items: { $ref: '#/definitions/jobs' },
  definitions: {
    jobs: {
      type: 'object',
      properties: {
        name: {
          type: 'string',
        },
        data: {
          type: 'object',
        },
        opts: {
          type: 'object',
        },
      },
    },
  },
};

export const validateJobs = (jobs) => ajv.validate(schema, jobs);
