import nextConnect from 'next-connect';
import { authenticateRequst } from '../../../../../lib/auth/middleware';
import { Queue } from '../../../../../models';
import getQueue from '../../../../../lib/queue';

export default nextConnect()
  .use(authenticateRequst)
  .get(async (req, res) => {
    try {
      const {
        query: { id, jobId },
      } = req;

      const data = await Queue.findOne({
        where: { id },
      });
      const queue = getQueue(data.name);
      const logs = await queue.getJobLogs(jobId, 0, 100);
      queue.close();

      res.send({ data: logs });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });
