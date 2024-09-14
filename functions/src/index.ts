import { onCall, CallableRequest } from "firebase-functions/v2/https";

import { readFile } from "fs/promises";
import { join } from "path";

const QUOTES_FILE_PATH = join(__dirname, "quotes.json");

interface Quote {
  id: number;
  season: number;
  episode: number;
  time: string;
  name: string;
  quote: string;
}

const fetchQuotes = async (): Promise<Quote[]> => {
  try {
    const data = await readFile(QUOTES_FILE_PATH, "utf-8");
    const quotes = JSON.parse(data) as Quote[];
    return quotes;
  } catch (error) {
    console.error("Error reading quotes file:", error);
    throw new Error("Unable to read quotes from file");
  }
};

export const getHomerQuotes = onCall(async (request: CallableRequest) => {
  try {
    const quotes = await fetchQuotes();
    const { id } = request.data;

    if (id) {
      const quote = quotes.find((q) => q.id === parseInt(id as string, 10));
      if (quote) {
        return { status: 200, data: quote };
      } else {
        return { status: 404, data: { message: "Quote not found" } };
      }
    }

    const shuffledQuotes = quotes.sort(() => Math.random() - 0.5);
    return { status: 200, data: shuffledQuotes };
  } catch (error: unknown) {
    if (error instanceof Error) {
      return { status: 500, data: { message: error.message } };
    } else {
      return { status: 500, data: { message: "An unknown error occurred" } };
    }
  }
});
