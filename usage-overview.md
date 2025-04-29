## Integration with Eliza Project

The Bless plugin integrates with the Eliza project by enabling ElizaOS agents to interact with the Bless Network. This integration allows agents to execute functions on the Bless Network and handle the results.

## Architecture Overview

The Bless plugin is designed with modularity and scalability in mind. It consists of the following key components:

1. **Actions**: Actions define the operations that the plugin can perform. The `executeAction` is the primary action provided by this plugin.
2. **Utilities**: The `executeBless` utility function handles the interaction with the Bless Network API, ensuring that the function execution is seamless and efficient.
3. **Configuration**: The plugin uses runtime settings, such as `BLESS_HEAD_NODE_ADDRESS`, to dynamically configure the network endpoint.
4. **Validation**: The `validate` function ensures that only valid requests are processed, improving security and reliability.

## ExecuteAction

The `executeAction` is a key component of the Bless plugin. It provides the functionality to execute functions on the Bless Network. Here are the details:

- **Description**: Execute a function on the Bless Network.
- **Handler**: The handler function is responsible for:
  - Extracting the function ID and method from the message.
  - Constructing the parameters required for the Bless Network API.
  - Calling the `executeBless` utility function.
  - Formatting and passing the results to the callback.
- **Validate**: The validate function checks if the action is targeting the Bless Network by looking for specific keywords in the message.


### Usage

Install the plugin into your Eliza
```bash
pnpm install @elizaos/plugin-bless
```


## Configuration

The Bless plugin can be configured using runtime settings and environment variables. Below are the key configuration options:

- **BLESS_HEAD_NODE_ADDRESS**: The address of the head node of the Bless Network. This can be set in the agent's runtime settings or overridden in the plugin's parameters.
  - Default: `https://head-run.bls.dev`.

### Example Configuration in `agent.js`

```javascript
import { BlessPlugin } from '@elizaos/plugin-bless';
export const defaultCharacter: Character = {
    name: "Eliza",
    username: "eliza",
    plugins: [
        BlessPlugin
    ],
```

### Customizing Execution Parameters

You can customize the execution parameters by modifying the `BlessExecuteOptions` interface. For example, you can specify additional environment variables or permissions:

```typescript
const params: BlessExecuteOptions = {
  functionId: "bafybeifexr5igblzhv5pyixvbif5lmrznv7yxvplcgnau6u2jzvzrji3i4",
  method: "custom.wasm",
  path: "/custom-path",
  httpMethod: "POST",
  numberOfNodes: 1,
  envVars: [{ name: "CUSTOM_ENV", value: "value" }],
  permissions: ["read", "write"]
};
```

### Handling Errors

The `executeBless` function includes error handling to manage network issues or invalid responses. You can extend this functionality by adding custom error handlers:

```typescript
try {
  const data = await BlessPlugin.executeAction(params);
  // Process data
} catch (error) {
  console.error("Custom error handling:", error);
}
```

## Dependencies

- **@elizaos/core**: Provides the core abstractions for actions, runtime, and state management.
- **Node.js**: Required for executing the plugin in a Node.js environment.

## Credits

Special thanks to:

- The Eliza Core development team for their support and guidance.
- The Eliza community for their contributions and feedback.

## License

This plugin is part of the Eliza project. See the main project repository for license information.
