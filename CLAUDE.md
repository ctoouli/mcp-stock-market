# CLAUDE.md - MCP Stock Market Project Guide

## Build Commands
- Build project: `npm run build`
- Run app: `node ./build/index.js`

## Project Structure
- TypeScript-based MCP (Model Context Protocol) server
- ES modules (type: "module" in package.json)
- Source in src/ directory, output in build/

## Code Style Guidelines
- **Imports**: Use ES module imports with .js extension for Node compatibility
- **Types**: Use TypeScript interfaces for complex types, zod for schema validation
- **Error Handling**: Use try/catch with specific error messages
- **Naming**: 
  - camelCase for variables/functions
  - PascalCase for interfaces/types
  - ALL_CAPS for constants
- **Formatting**: 
  - 4-space indentation
  - Semicolons required
- **API Calls**: Wrap in helper functions with proper error handling
- **Response Formatting**: Use consistent structure with proper null checks

## Dependencies
- @modelcontextprotocol/sdk: Core MCP functionality
- zod: Schema validation