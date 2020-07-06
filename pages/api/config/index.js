import nextConnect from 'next-connect';
import { authenticateRequst } from '../../../lib/auth/middleware';

export default nextConnect()
  .use(authenticateRequst)
  .get(async (_, res) => {
    try {
      const data = {
        REDIS_URL: process.env.REDIS_URL,
        DATABASE_URL: process.env.DATABASE_URL,
      };

      res.send({ data });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });
