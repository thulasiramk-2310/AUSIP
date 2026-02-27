import asyncio
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

ELASTIC_BASE_URL = os.getenv("ELASTIC_BASE_URL")
ELASTIC_API_KEY = os.getenv("ELASTIC_API_KEY")
ELASTIC_AGENT_ID = os.getenv("ELASTIC_AGENT_ID")

print(f"Base URL: {ELASTIC_BASE_URL}")
print(f"Agent ID: {ELASTIC_AGENT_ID}")
print(f"API Key: {ELASTIC_API_KEY[:20]}...")

async def test_agent():
    headers = {
        "Authorization": f"ApiKey {ELASTIC_API_KEY}",
        "Content-Type": "application/json"
    }
    
    # First, list all available inference endpoints
    print("\n" + "="*60)
    print("Step 1: Listing available inference endpoints...")
    print("="*60)
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{ELASTIC_BASE_URL}/_inference/_all", headers=headers)
            print(f"Status: {response.status_code}")
            if response.status_code == 200:
                data = response.json()
                print(f"\n✅ Available inference endpoints:")
                print(data)
                
                # Try each endpoint
                if isinstance(data, dict) and 'endpoints' in data:
                    for endpoint in data.get('endpoints', []):
                        endpoint_id = endpoint.get('inference_id') or endpoint.get('model_id')
                        if endpoint_id:
                            print(f"\n{'='*60}")
                            print(f"Trying endpoint: {endpoint_id}")
                            test_url = f"{ELASTIC_BASE_URL}/_inference/{endpoint_id}"
                            test_response = await client.post(test_url, headers=headers, json={"input": "test"})
                            print(f"Status: {test_response.status_code}")
                            if test_response.status_code == 200:
                                print(f"✅ SUCCESS with {endpoint_id}!")
                                print(f"Response: {test_response.text[:300]}")
                                return
            else:
                print(f"Error: {response.text[:300]}")
    except Exception as e:
        print(f"Exception: {str(e)}")
    
    print("\n" + "="*60)
    print("Step 2: Trying direct connector...")
    print("="*60)
    
    # Check if connector can be accessed directly
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(f"{ELASTIC_BASE_URL}/_connector", headers=headers)
            print(f"Connector list status: {response.status_code}")
            if response.status_code == 200:
                print(f"Connectors: {response.text[:500]}")
    except Exception as e:
        print(f"Exception: {str(e)}")
    
    print("\n❌ Could not find working endpoint")

if __name__ == "__main__":
    asyncio.run(test_agent())
