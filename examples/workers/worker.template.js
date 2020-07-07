const Queue = require('bull');

const queue = new Queue('YOUR QUEUE NAME', process.env.REDIS_URL);

queue.process('*', async (job) => {
  const { data } = job;

  // worker code here...
  console.log(data);

  // returns a promise...
  return data;
});
