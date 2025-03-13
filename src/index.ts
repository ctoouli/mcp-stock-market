import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import https from "node:https";
import * as dotenv from "dotenv";
import path from "node:path";
import fs from "node:fs";

// Determine the correct path to the .env file
const rootDir = path.resolve(process.cwd());
const envPath = path.resolve(rootDir, '.env');

// Check if .env file exists
if (fs.existsSync(envPath)) {
    console.error(`Loading environment from: ${envPath}`);
    dotenv.config({ path: envPath });
} else {
    console.error(`No .env file found at ${envPath}`);
}

// For development/testing, allow hardcoded API key as fallback
// IMPORTANT: Remove this in production
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY || "XEFMKEMJDA26E0LW";
const ALPHA_VANTAGE_BASE_URL = "https://www.alphavantage.co/query";

// Debug environment loading
console.error(`API Key length: ${ALPHA_VANTAGE_API_KEY ? ALPHA_VANTAGE_API_KEY.length : 0}`);

const server = new McpServer({
    name: "stock-market",
    version: "1.0.0",
});

interface StockMetaData {
    "1. Information": string;
    "2. Symbol": string;
    "3. Last Refreshed": string;
    "4. Output Size": string;
    "5. Time Zone": string;
}

interface DailyData {
    "1. open": string;
    "2. high": string;
    "3. low": string;
    "4. close": string;
    "5. volume": string;
}

interface StockResponse {
    "Meta Data": StockMetaData;
    "Time Series (Daily)": Record<string, DailyData>;
}

function makeHttpRequest(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
        https.get(url, (res) => {
            const { statusCode } = res;
            
            if (statusCode !== 200) {
                res.resume();
                reject(new Error(`Request failed with status code: ${statusCode}`));
                return;
            }
            
            res.setEncoding('utf8');
            let rawData = '';
            
            res.on('data', (chunk) => {
                rawData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(rawData);
                    resolve(parsedData);
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (err) => {
            reject(err);
        });
    });
}

async function fetchStockData(symbol: string): Promise<StockResponse | null> {
    const url = `${ALPHA_VANTAGE_BASE_URL}?function=TIME_SERIES_DAILY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    
    try {
        const data = await makeHttpRequest(url);
        return data as StockResponse;
    } catch (error) {
        console.error(`Error fetching stock data:`, error);
        return null;
    }
}

function formatStockData(data: StockResponse): string {
    const metaData = data["Meta Data"];
    const timeSeriesData = data["Time Series (Daily)"];
    const dates = Object.keys(timeSeriesData).sort().reverse();
    
    let result = [
        `Stock: ${metaData["2. Symbol"]}`,
        `Last Updated: ${metaData["3. Last Refreshed"]}`,
        `Time Zone: ${metaData["5. Time Zone"]}`,
        "\nDaily Prices:\n"
    ].join("\n");
    
    // Display up to 5 most recent dates
    const recentDates = dates.slice(0, 5);
    
    for (const date of recentDates) {
        const dayData = timeSeriesData[date];
        result += [
            `Date: ${date}`,
            `Open: $${parseFloat(dayData["1. open"]).toFixed(2)}`,
            `High: $${parseFloat(dayData["2. high"]).toFixed(2)}`,
            `Low: $${parseFloat(dayData["3. low"]).toFixed(2)}`,
            `Close: $${parseFloat(dayData["4. close"]).toFixed(2)}`,
            `Volume: ${parseInt(dayData["5. volume"]).toLocaleString()}`,
            "---\n"
        ].join("\n");
    }
    
    return result;
}

server.tool(
    "get-stock-data",
    "Get daily stock market data for a specific symbol",
    {
        symbol: z.string().describe("Stock symbol (e.g., IBM, AAPL, MSFT)"),
    },
    async ({ symbol }) => {
        const stockData = await fetchStockData(symbol.toUpperCase());
        
        if (!stockData) {
            return {
                content: [{
                    type: "text",
                    text: `Failed to retrieve stock data for symbol: ${symbol}`,
                }]
            };
        }
        
        if (!stockData["Meta Data"] || !stockData["Time Series (Daily)"]) {
            return {
                content: [{
                    type: "text",
                    text: `Invalid or empty data received for symbol: ${symbol}`,
                }]
            };
        }
        
        const formattedData = formatStockData(stockData);
        
        return {
            content: [{
                type: "text",
                text: formattedData,
            }]
        };
    }
);

async function main() {
    const transport = new StdioServerTransport();
    await server.connect(transport);
    console.error("Stock Market MCP Server running on stdio");
}

main().catch((error) => {
    console.error("Fatal error in main():", error);
    process.exit(1);
});