import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import { config } from "dotenv";

config(); // Load .env variables

@Injectable()
export class TelegramClientService implements OnModuleInit {
  private client: TelegramClient;
  private readonly logger = new Logger(TelegramClientService.name);

  constructor() {
    const apiId = Number(process.env.API_ID);
    const apiHash = process.env.API_HASH;
    const sessionString = process.env.API_SESSION ;

    if (!apiId || !apiHash || !sessionString) {
      throw new Error(
        "Missing Telegram credentials or session string in environment variables"
      );
    }

    const stringSession = new StringSession(sessionString);

    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
      // logger: new Logger('telegram-client'), // enable if you want Telegram lib logs
    });
  }

  async onModuleInit() {
    try {
      await this.init();
    } catch (error) {
      this.logger.error("Telegram client initialization failed", error);
    }
  }

  async init() {
    await this.client.start({
      phoneNumber: async () => {
        throw new Error("Phone number input required but not implemented");
      },
      password: async () => {
        throw new Error("Two-factor password required but not implemented");
      },
      phoneCode: async () => {
        throw new Error("Phone code input required but not implemented");
      },
      onError: (err) => this.logger.error("Telegram error:", err),
    });
    this.logger.log("Telegram client connected and ready");
  }

  async sendMessage(username: string, message: string) {
    if (!this.client) throw new Error("Telegram client is not initialized");

    if (!this.client.connected) {
      this.logger.warn(
        "Telegram client disconnected. Attempting to reconnect..."
      );
      await this.client.connect();
    }

    try {
      await this.client.sendMessage(username, { message });
      this.logger.log(`Message sent to ${username}`);
    } catch (error) {
      this.logger.error("Failed to send Telegram message", error);
      throw error;
    }
  }
}
