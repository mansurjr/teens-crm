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
    const sessionString = process.env.API_SESSION;

    if (!apiId || !apiHash || !sessionString) {
      throw new Error(
        "Missing Telegram credentials or session string in environment variables"
      );
    }

    const stringSession = new StringSession(sessionString);

    this.client = new TelegramClient(stringSession, apiId, apiHash, {
      connectionRetries: 5,
    });
  }

  async onModuleInit() {
    try {
      await this.init();

      // Keep connection alive
      setInterval(async () => {
        try {
          await this.client.getMe();
          this.logger.debug("Keep-alive ping successful");
        } catch (err) {
          this.logger.warn("Ping failed. Attempting reconnect...");
          await this.safeReconnect();
        }
      }, 60_000);
    } catch (error) {
      this.logger.error("Telegram client initialization failed", error);
    }
  }

  private async init() {
    try {
      await this.client.start({
        phoneNumber: async () => {
          throw new Error(
            "Phone number input required — regenerate your API_SESSION"
          );
        },
        password: async () => {
          throw new Error(
            "Two-factor password required — regenerate your API_SESSION"
          );
        },
        phoneCode: async () => {
          throw new Error(
            "Phone code input required — regenerate your API_SESSION"
          );
        },
        onError: (err) => this.logger.error("Telegram error:", err),
      });
      this.logger.log("Telegram client connected and ready");
    } catch (error) {
      this.logger.error("Failed to start Telegram client", error);
      throw error;
    }
  }

  private async safeReconnect() {
    try {
      if (!this.client.connected) {
        this.logger.log("Reconnecting to Telegram...");
        await this.client.connect();
        this.logger.log("Reconnected successfully");
      }
    } catch (err) {
      this.logger.error("Reconnect failed", err);
    }
  }

  async sendMessage(username: string, message: string) {
    if (!this.client) throw new Error("Telegram client not initialized");

    if (!this.client.connected) {
      this.logger.warn("Client disconnected. Reconnecting...");
      await this.safeReconnect();
    }

    try {
      await this.client.sendMessage(username, { message });
      this.logger.log(`Message sent to ${username}`);
    } catch (error) {
      if (error.message.includes("Not connected")) {
        this.logger.warn("Retrying after reconnect...");
        await this.safeReconnect();
        await this.client.sendMessage(username, { message });
      } else {
        this.logger.error("Failed to send Telegram message", error);
        throw error;
      }
    }
  }
}
