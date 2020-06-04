import nextConnect from 'next-connect';
import pickBy from 'lodash.pickby';
import includes from 'lodash.includes';
import { authenticateRequst } from '../../../lib/auth/middleware';
import getQueue from '../../../lib/queue';

const USEFUL_METRICS = [
  'redis_version',
  'total_system_memory',
  'used_memory',
  'mem_fragmentation_ratio',
  'connected_clients',
  'blocked_clients',
];

function formatBytes(num) {
  if (!Number.isFinite(num)) {
    return 'Could not retrieve value';
  }

  const UNITS = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB'];

  const neg = num < 0;
  if (neg) num = -num;

  if (num < 1) {
    return (neg ? '-' : '') + num + ' B';
  }

  const exponent = Math.min(Math.floor(Math.log(num) / Math.log(1024)), UNITS.length - 1);
  const numStr = Number((num / Math.pow(1024, exponent)).toPrecision(3));
  const unit = UNITS[exponent];

  return (neg ? '-' : '') + numStr + ' ' + unit;
}

export default nextConnect()
  .use(authenticateRequst)
  .get(async (_, res) => {
    try {
      const queue = getQueue('SYSTEM');
      await queue.client.info();
      queue.close();

      const stats = pickBy(queue.client.serverInfo, (_, key) => includes(USEFUL_METRICS, key));
      stats.used_memory = formatBytes(parseInt(stats.used_memory, 10));
      stats.total_system_memory = formatBytes(parseInt(stats.total_system_memory, 10));

      const data = Object.entries(stats).map(([key, value]) => {
        return {
          name: key,
          value,
        };
      });

      res.send({ data });
    } catch (error) {
      res.status(500).send({ error: 'Internal server error' });
    }
  });
