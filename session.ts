import { TelegramClient } from "telegram";
import { StringSession } from "telegram/sessions";
import * as readline from "readline";
import * as dotenv from "dotenv";

dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function question(query: string): Promise<string> {
  return new Promise((resolve) => rl.question(query, resolve));
}

const apiId = Number(process.env.API_ID);
const apiHash = process.env.API_HASH!;

(async () => {
  const stringSession = new StringSession(""); // empty for new login

  const client = new TelegramClient(stringSession, apiId, apiHash, {
    connectionRetries: 5,
  });

  await client.start({
    phoneNumber: async () => await question("Please enter your phone number: "),
    phoneCode: async () =>
      await question("Please enter the code you received: "),
    password: async () => await question("Please enter your 2FA password: "),
    onError: (err) => console.log(err),
  });

  console.log("You are now logged in.");
  console.log("Your string session (put this in your .env):");
  console.log(client.session.save());

  rl.close();
  process.exit(0);
})();
