import nextConnect from 'next-connect';
import { isValidCron } from 'cron-validator';
import { authenticateRequst } from '../../../lib/auth/middleware';
import { Queue } from '../../../models';

export default nextConnect()
  .use(authenticateRequst)
  .get(async (_, res) => {
    try {
      const data = await Queue.findAll({
        order: [['updatedAt', 'DESC']],
      });

      res.send({ data });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  })
  .post(async (req, res) => {
    try {
      const { name, schedule } = req.body;
      if (schedule && !isValidCron(schedule)) {
        res.status(400).send({ error: 'Bad request' });
      } else {
        const data = await Queue.create({ name, schedule });

        res.send({ data });
      }
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });
