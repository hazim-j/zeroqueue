import Queue from 'bull';
import parseDbUrl from 'parse-database-url';

const REDIS_PARAMS = parseDbUrl(process.env.REDIS_URL);
const tls = REDIS_PARAMS.driver === 'rediss' ? {} : undefined;

const getQueue = (name) =>
  new Queue(name, {
    redis: {
      username: REDIS_PARAMS.user,
      password: REDIS_PARAMS.password,
      host: REDIS_PARAMS.host,
      port: REDIS_PARAMS.port,
      connectTimeout: 30000,
      tls,
    },
  });

export default getQueue;
