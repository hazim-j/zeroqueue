const Queue = require('bull');

const queue = new Queue('YOUR QUEUE NAME', process.env.REDIS_URL);

queue.process('*', async (job) => {
  const { data } = job;

  // worker code here...
  job.log(JSON.stringify(data));

  // capture job progress...
  job.progress(100);

  // returns a promise...
  return data;
});
