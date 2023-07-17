# Docker Discord Bot

This project is an enhanced version of the Discord bot example found in the [Inworld AI documentation](https://docs.inworld.ai/docs/tutorial-integrations/node/quick-start/discord-bot/).

The purpose of this project is to encapsulate the Redis server and the Node.js Discord bot into Docker containers, allowing for easy initialization using the `yarn dev` command.

If you're interested in exploring the original source code that requires a Redis instance running on the machine, you can find it [here](https://github.com/inworld-ai/inworld-nodejs-sdk/tree/main/examples/ts).

## How to Get Started

To run this Dockerized Discord bot, follow these steps:

1. Clone the repository to your local machine.
2. Ensure that Docker is installed and running on your system.
3. Open a terminal or command prompt and navigate to the project directory.
4. Run the following command to install dependencies:

```bash
yarn install
```

5. Run the following command to start the bot:

```bash
yarn dev
```

> This command will initialize the Docker containers for the Redis server and the Node.js Discord bot, allowing the bot to function seamlessly.

> Feel free to explore and modify the code to suit your needs.
