import { parseArgs } from 'node:util';

const args = process.argv;
const myargs = args.slice(2);

const options = {
  name: {
    type: 'string',
  },
  task: {
    type: 'string',
  },
};

const { values, positionals } = parseArgs({ myargs, options });

console.log(`Hello ${values.name}, today's task is ${values.task}`)
