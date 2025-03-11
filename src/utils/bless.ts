export async function executeBless() {
const fetchOptions = {
      method: 'POST',
      body: JSON.stringify({
        "function_id": "bafybeifexr5igblzhv5pyixvbif5lmrznv7yxvplcgnau6u2jzvzrji3i4",
        "method": "blessnet.wasm",
        "config": {
          "permissions": [],
          "stdin": "{\"path\":\"/\",\"method\":\"GET\"}",
          "env_vars": [
            {
              "name": "BLS_REQUEST_PATH",
              "value": "/"
            }
          ],
          "number_of_nodes": 3
        }
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    };

    console.log("BLESSSSSS executeAction");
    
    const response = await fetch('https://head-run-5.bls.dev/api/v1/functions/execute', fetchOptions)

    const data = await response.json();

    console.log("BLESSSSSS executeAction", data);

    return data;
}
