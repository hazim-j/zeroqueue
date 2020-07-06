import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const generateWorkerCode = (queue, redis) => `const Queue = require('bull');

const queue = new Queue('${queue}', ${(redis && `'${redis}'`) || 'process.env.REDIS_URL'});

queue.process('*', async (job) => {
  const { data } = job;

  // worker code here...
  console.log(data);

  // returns a promise...
  return data;
});`;

export const InstallDependencies = () => (
  <SyntaxHighlighter language="bash" style={github}>
    npm install bull
  </SyntaxHighlighter>
);

export const Worker = ({ queue, redis }) => (
  <SyntaxHighlighter language="javascript" style={github}>
    {generateWorkerCode(queue, redis)}
  </SyntaxHighlighter>
);
