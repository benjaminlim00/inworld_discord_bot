import "dotenv/config";

if (!process.env.INWORLD_KEY) {
  throw new Error("INWORLD_KEY env variable is required");
}

if (!process.env.INWORLD_SECRET) {
  throw new Error("INWORLD_SECRET env variable is required");
}

if (!process.env.INWORLD_SCENE) {
  throw new Error("INWORLD_SCENE env variable is required");
}

if (!process.env.DISCORD_BOT_TOKEN) {
  throw new Error("DISCORD_BOT_TOKEN env variable is required");
}

import {
  InworldClient,
  InworldPacket,
  ServiceError,
  Session,
  status,
} from "@inworld/nodejs-sdk";
import {
  Client,
  GatewayIntentBits,
  Message,
  Partials,
  TextChannel,
} from "discord.js";

import { Storage } from "./storage";

const storage = new Storage();

let discordClient: Client;
try {
  discordClient = new Client({
    intents: [
      GatewayIntentBits.Guilds,
      GatewayIntentBits.GuildMessages,
      GatewayIntentBits.MessageContent,
      GatewayIntentBits.DirectMessages,
      GatewayIntentBits.DirectMessageTyping,
      GatewayIntentBits.DirectMessageReactions,
    ],
    partials: [Partials.Channel],
  });
} catch (err) {
  console.error(err);
  console.error("Error: discordClient constructor failed");
  process.exit(1);
}

const run = async function () {
  await storage.connect({
    onError: (err: Error) => console.log("Redis Client Error", err),
  });

  discordClient.on("ready", () => {
    console.log("Discord client ready!");
  });

  discordClient.on("messageCreate", async (message: Message) => {
    if (message.author.bot) return;
    if (message.content === "") return;

    sendMessage(message);
  });

  discordClient.login(process.env.DISCORD_BOT_TOKEN);
};

run();

const sendMessage = async (message: Message) => {
  const content = message.content.replace(`<@${discordClient.user?.id}>`, "");

  let client;
  try {
    client = await createInworldClient(message);
  } catch (err) {
    console.error(err);
    console.error("Error: createInworldClient failed");
    process.exit(1);
  }

  client.sendText(content);
};

const getKey = (message: Message) =>
  `${message.channel.id}_${message.author.id}`;

const createInworldClient = async (message: Message) => {
  const key = getKey(message);
  const client = new InworldClient()
    .setOnSession({
      get: () => storage.get(key),
      set: (session: Session) => storage.set(key, session),
    })
    .setApiKey({
      key: process.env.INWORLD_KEY!,
      secret: process.env.INWORLD_SECRET!,
    })
    .setConfiguration({ capabilities: { audio: false, emotions: true } })
    .setScene(process.env.INWORLD_SCENE!)
    .setOnError(handleError(message))
    .setOnMessage((packet: InworldPacket) => {
      if (packet.isInteractionEnd()) {
        client.close();
        return;
      }

      if (packet.isText()) {
        const text = packet.text.text;
        if (text === "") return;

        (message.channel as TextChannel).send(text);
      }
    })
    .build();

  return client;
};

const handleError = (message: Message) => {
  return (err: ServiceError) => {
    switch (err.code) {
      case status.ABORTED:
      case status.CANCELLED:
        break;
      default:
        console.error(`Error: ${err.message}`);
        storage.delete(getKey(message));
        sendMessage(message);
        break;
    }
  };
};

const done = () => {
  storage.disconnect();
  discordClient.destroy();
};

process.on("SIGINT", done);
process.on("SIGTERM", done);
process.on("SIGUSR2", done);
process.on("unhandledRejection", (err: Error) => {
  console.error(err.message);
  done();
  process.exit(1);
});
