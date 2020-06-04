import nextConnect from 'next-connect';
import includes from 'lodash.includes';
import capitalize from 'lodash.capitalize';
import { authenticateRequst } from '../../../../lib/auth/middleware';
import { Queue } from '../../../../models';
import getQueue from '../../../../lib/queue';

const STATUS_WHITELIST = ['waiting', 'active', 'completed', 'failed', 'delayed'];

const getJobsForStatus = async (queue, status, page, size) => {
  const count = await queue[`get${capitalize(status)}Count`]();

  const start = (page - 1) * size;
  const end = start + size - 1;
  const jobs = await queue[`get${capitalize(status)}`](start, end);

  return { jobs, count };
};

export default nextConnect()
  .use(authenticateRequst)
  .get(async (req, res) => {
    try {
      const {
        query: { id, status, page, size },
      } = req;

      if (!includes(STATUS_WHITELIST, status)) {
        res.status(400).send({ error: `Not a recognized status: ${status}` });
        return;
      }

      const data = await Queue.findOne({
        where: { id },
      });
      const queue = getQueue(data.name);
      const jobs = await getJobsForStatus(
        queue,
        status,
        parseInt(page, 10) || 1,
        parseInt(size, 10) || 10,
      );
      queue.close();

      res.send({ data: jobs });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });
