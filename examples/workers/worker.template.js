const Queue = require('bull');

const queue = new Queue('YOUR QUEUE NAME', process.env.REDIS_URL);

queue.process('*', (job, done) => {
  // worker code here...
  console.log(job.data);

  done(null, null);
});
