import SyntaxHighlighter from 'react-syntax-highlighter';
import { github } from 'react-syntax-highlighter/dist/cjs/styles/hljs';

const generateWorkerCode = (queue, redis) => {
  const workerCode = process.env.WORKER_TEMPLATE.replace('YOUR QUEUE NAME', queue);

  return (redis && workerCode.replace('process.env.REDIS_URL', `'${redis}'`)) || workerCode;
};

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
