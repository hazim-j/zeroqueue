import nextConnect from 'next-connect';
import { nanoid } from 'nanoid';
import { authenticateRequst } from '../../../lib/auth/middleware';
import { Queue } from '../../../models';
import getQueue from '../../../lib/queue';
import { validateJobs } from '../../../lib/queue/jobs';

const hydrateQueue = async (queue) => {
  const queueClient = getQueue(queue.name);
  const status = await queueClient.getJobCounts().then((res) => {
    return Object.entries(res)
      .filter(([key]) => key !== 'paused')
      .map(([key, value]) => {
        return {
          name: key,
          value,
        };
      });
  });
  queueClient.close();

  return {
    ...queue.toJSON(),
    status,
  };
};

export default nextConnect()
  .use(authenticateRequst)
  .get(async (req, res) => {
    try {
      const {
        query: { id },
      } = req;

      const data = await Queue.findOne({
        where: { id },
      });

      if (data) {
        res.send({ data: await hydrateQueue(data) });
      } else {
        res.status(404).send({ error: `Queue id not found: ${id}` });
      }
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  })
  .post(async (req, res) => {
    try {
      const {
        query: { id },
        body,
      } = req;

      if (!validateJobs(body)) {
        res.status(400).send({ error: `Jobs not valid` });
        return;
      }

      const data = await Queue.findOne({
        where: { id },
        raw: true,
      });
      const queue = getQueue(data.name);
      await Promise.all(
        body.map((job) => {
          const opts = {
            ...(job.opts || {}),
            ...(data.schedule ? { repeat: { cron: data.schedule } } : {}),
          };
          return queue.add(job.name || nanoid(), job.data || {}, opts);
        }),
      );
      queue.close();
      res.send({ data: 'OK' });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  })
  .patch(async (req, res) => {
    try {
      const {
        query: { id },
        body: { type },
      } = req;

      const data = await Queue.findOne({
        where: { id },
        raw: true,
      });
      const queue = getQueue(data.name);

      switch (type) {
        case 'flush':
          await queue.empty();
          await queue.removeJobs('*');
          queue.close();
          res.send({ data: 'OK' });
          break;
        default:
          res.status(400).send({ error: `Type not valid` });
          break;
      }
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  })
  .delete(async (req, res) => {
    try {
      const {
        query: { id },
      } = req;

      const data = await Queue.findOne({
        where: { id },
        raw: true,
      });

      const queue = getQueue(data.name);
      await queue.empty();
      await queue.removeJobs('*');
      queue.close();
      await Queue.destroy({
        where: { id },
      });
      res.send({ data: 'OK' });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });
