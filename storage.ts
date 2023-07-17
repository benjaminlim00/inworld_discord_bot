import { Session } from "@inworld/nodejs-sdk";
import { createClient } from "redis";

const redisUrl = process.env.REDIS_URL;
const options = redisUrl ? { url: redisUrl } : undefined;

export class Storage {
  private redisClient = createClient(options);

  async connect({ onError }: { onError?: (err: Error) => void }) {
    await this.redisClient.connect();

    if (onError) {
      this.redisClient.on("error", onError);
    }
  }

  disconnect() {
    this.redisClient.disconnect();
  }

  async get(key: string) {
    const json = await this.redisClient.get(key);

    if (json) return Session.deserialize(json);
  }

  set(key: string, entity: Session) {
    this.redisClient.set(key, Session.serialize(entity));
  }

  delete(key: string) {
    this.redisClient.del(key);
  }
}
