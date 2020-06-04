import Queue from 'bull';

const getQueue = (name) => new Queue(name, process.env.REDIS_URL);

export default getQueue;
