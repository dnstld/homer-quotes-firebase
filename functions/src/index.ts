import { onRequest } from "firebase-functions/v2/https";

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

export const getQuotes = onRequest(async (request, response) => {
  try {
    const quotes = await fetchQuotes();
    const { id } = request.query;

    if (id) {
      const quote = quotes.find((q) => q.id === parseInt(id as string, 10));
      if (quote) {
        response.status(200).json(quote);
        return;
      } else {
        response.status(404).json({ message: "Quote not found" });
        return;
      }
    }

    response.status(200).json(quotes.sort());
  } catch (error: unknown) {
    if (error instanceof Error) {
      response.status(500).json({ message: error.message });
    } else {
      response.status(500).json({ message: "An unknown error occurred" });
    }
  }
});
