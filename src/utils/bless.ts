export interface BlessExecuteOptions {
  headNodeAddress?: string;
  functionId: string;
  method?: string;
  path?: string;
  httpMethod?: string;
  numberOfNodes?: number;
  envVars?: Array<{ name: string; value: string }>;
  permissions?: string[];
}

export async function executeBless({
  headNodeAddress = "https://head-run.bls.dev",
  functionId,
  method = "blessnet.wasm",
  path = "/",
  httpMethod = "GET",
  numberOfNodes = 1,
  envVars = [],
  permissions = []
}: BlessExecuteOptions) {
  // Ensure BLS_REQUEST_PATH is included in envVars
  const allEnvVars = [
    ...envVars,
    ...(!envVars.some(env => env.name === "BLS_REQUEST_PATH") 
      ? [{ name: "BLS_REQUEST_PATH", value: path }] 
      : [])
  ];

  const fetchOptions = {
    method: 'POST',
    body: JSON.stringify({
      "function_id": functionId,
      "method": method,
      "config": {
        "permissions": permissions,
        "stdin": JSON.stringify({ path, method: httpMethod }),
        "env_vars": allEnvVars,
        "number_of_nodes": numberOfNodes
      }
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  };

  console.log("Executing Bless function");
  
  try {
    console.log("url", `${headNodeAddress}/api/v1/functions/execute`);
    const response = await fetch(`${headNodeAddress}/api/v1/functions/execute`, fetchOptions);
    
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    console.log("Bless function execution result:", data);
    return data;
  } catch (error) {
    console.error("Error executing Bless function:", error);
    throw error;
  }
}
