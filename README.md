# MCP Stock Market

A Model Context Protocol (MCP) tool for retrieving stock market data using the Alpha Vantage API. This tool provides access to daily stock market data for any stock symbol through a simple MCP interface.

## Requirements

- Node.js v18 or higher
- An Alpha Vantage API key (free tier available)

## Setup

1. Install dependencies
   ```bash
   npm install
   ```

2. Create a `.env` file based on `.env.example` and add your Alpha Vantage API key
   ```
   ALPHA_VANTAGE_API_KEY=your_api_key_here
   ```
   You can obtain a free API key from [Alpha Vantage](https://www.alphavantage.co/support/#api-key).

3. Build the project
   ```bash
   npm run build
   ```

## MCP Client Configuration

To use this tool with your MCP client, you need to update your MCP server configuration. Add the following to your client's configuration:

```json
{
  "mcpServers": {
    "stock-market": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/PARENT/FOLDER/mcp-stock-market/build/index.js"
      ]
    }
  }
}
```

Make sure to replace `/ABSOLUTE/PATH/TO/PARENT/FOLDER` with the actual absolute path to the parent directory containing this repository.

## Available Tools

### get-stock-data

Retrieves daily stock market data for a specific stock symbol.

**Parameters:**
- `symbol`: Stock symbol (e.g., IBM, AAPL, MSFT, GOOG, AMZN)

**Example usage in an MCP client:**
```
@stock-market get-stock-data symbol=AAPL
```

**Example response:**
```
Stock: AAPL
Last Updated: 2025-03-12
Time Zone: US/Eastern

Daily Prices:

Date: 2025-03-12
Open: $178.35
High: $180.13
Low: $177.53
Close: $179.63
Volume: 58,492,206
---

Date: 2025-03-11
Open: $177.99
High: $179.70
Low: $176.86
Close: $178.95
Volume: 62,630,570
---
```

## Development

### Project Structure

- `src/index.ts` - Main application file with MCP server and tools implementation
- `build/` - Compiled JavaScript output
- `.env` - Environment variables (API key)

### Commands

- `npm run build` - Build the TypeScript code

## API Usage Notes

This tool uses the Alpha Vantage API to retrieve stock market data. The free tier of Alpha Vantage has the following limitations:
- 25 API calls per day
- 5 API calls per minute

If you need more capacity, consider upgrading to their premium plans.

## Troubleshooting

If you encounter issues:

1. Make sure your Alpha Vantage API key is correctly set in the `.env` file
2. Check that you're using Node.js version 18 or higher
3. Verify that the path in your MCP client configuration is correct
4. Restart your MCP client
