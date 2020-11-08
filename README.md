# ZeroQueue

⏰ A low-code queue management system ⏰

Powered by [BullMQ](https://github.com/optimalbits/bull) - _the fastest, most reliable, Redis-based queue for Node._

![](https://i.imgur.com/Lva6crv.png)

<p align="center">
  <a href="#installation">Installation</a> •
  <a href="#usage">Usage</a> •
  <a href="#contribute">Contribute</a> •
  <a href="#license">License</a>
</p>

## Installation

A containerised version of ZeroQueue can be easily setup using docker with the following environment variables:

| Env Var        | Description                                                 |
| -------------- | ----------------------------------------------------------- |
| DATABASE_URL   | Connection string for a sequelize supported database.       |
| REDIS_URL      | Connection string for a Redis database.                     |
| SESSION_SECRET | A string of atleast 32 characters to encrypt user sessions. |

A built image of ZeroQueue is currently hosted on [Docker Hub](https://hub.docker.com/r/zeroqueue/zeroqueue). This will allow you to run the app in most environments and platforms such as docker-compose, Heroku, or Kubernetes.

### Running using the Docker CLI

1. First pull the image down from the registry.

```bash
docker pull zeroqueue/zeroqueue:latest
```

2. You will then need to run migrations on your database. ZeroQueue uses [sequelize](https://github.com/sequelize/sequelize) ORM. **This will assume you have a supported database already created with the connection string assinged to the envinronment variable `DATABASE_URL`.**

```bash
docker run --rm -e DATABASE_URL zeroqueue/zeroqueue:latest npm run db:sync
```

If the database is running on `localhost` you will also need to set the `--network="host"` argument.

```bash
docker run --rm -e DATABASE_URL --network="host" zeroqueue/zeroqueue:latest npm run db:sync
```

3. Once the above step finishes successfully, you can start ZeroQueue using the followng command. **This will assume you have correctly assigned the environment variables for `DATABASE_URL`, `REDIS_URL`, and `SESSION_SECRET`.** See the above table for details.

```bash
docker run --rm -d -e DATABASE_URL -e REDIS_URL -e SESSION_SECRET -p 9376:9376 --name zeroqueue zeroqueue/zeroqueue:latest
```

Note that the above command will map port `9376` to the ZeroQueue app. If running locally this will be available on http://localhost:9376.

If you are running the database and redis on localhost too, you will need to make sure the ZeroQueue container has access to the host network. On mac and windows this can be achieved by replacing `localhost` or `127.0.0.1` with `host.docker.internal`.

### Environment specific examples

_Feel free to open an issue if you would like to see instructions for setting up ZeroQueue in certain environments or platforms._

## Usage

Each zeroqueue instance has many `queues` and each queue has many `jobs` with a different `status`.

### Credentials

When you first login to ZeroQueue the credentials will be set to the following default values:

- username: `admin`
- password: `password`

It is recommended that you change this immediately via the settings, especially if running in production.

### Queues

New queues can be spun up by providing a name and an optional schedule. Schedules are currently set using a crontab (you can use [crontab.guru](https://crontab.guru/) as a reference).

If no schedule is specified, then jobs will be processed as soon as they enter the queue.

### Jobs

Jobs can be bulk added to the queue using a JSON file. The system expects the JSON file to be an `array` of `objects` with each object representing a single job.

Each job in the array has the following fields.

| Field | Description                                                                                                                                                              |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| name  | A string to identify the job. This will default to a random id if left blank.                                                                                            |
| data  | This is the data that will be made available to workers.                                                                                                                 |
| opts  | These are custom job options and will have the same interface as specified by the [BullMQ docs](https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd). |

The schema to validate a JSON file is:

```json
{
  "type": "array",
  "items": {
    "$ref": "#/definitions/jobs"
  },
  "definitions": {
    "jobs": {
      "type": "object",
      "properties": {
        "name": {
          "type": "string"
        },
        "data": {
          "type": "object"
        },
        "opts": {
          "type": "object"
        }
      }
    }
  }
}
```

### Workers

The worker is the only piece of code you'll need to worry about in this system.

Start by installing BullMQ:

```bash
npm install bull
```

To spin up a worker you can either follow the [BullMQ quick start guide](https://github.com/OptimalBits/bull#quick-guide) or use the following template:

```javascript
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
```

## Contribute

Pull requests on this project are welcome, or feel free to open an issue if you would like to see a feature added or bug fixed. You can also support this project by donating.

<p align="center">
  <a href="https://www.buymeacoffee.com/zeroqueue" target="_blank"><img src="https://cdn.buymeacoffee.com/buttons/default-orange.png" alt="Buy Me A Coffee" height="41" width="174"></a>
</p>

### Running from source in development mode

ZeroQueue is built using [NextJS](https://nextjs.org/) so this will assume you have node.js and npm installed locally. You will also need docker for any backing services.

1. Install dependencies

```bash
npm install
```

2. Setup backing services (i.e. postgreSQL and Redis)

```bash
npm run dev:services:up
npm run db:sync
```

3. Start the dev server

```bash
npm run dev
```

When you are done you can stop the server and tear down the backing services using:

```bash
npm run dev:services:down
```

### Running tests

_TBA_

### Running Lint

ZeroQueue uses both [ESLint](https://eslint.org/) and [Prettier](https://prettier.io/) for code linting and formatting.

```bash
npm run lint
```

## License

> This project is licensed under the GNU GPLv3 License - see the LICENSE.md file for details.
