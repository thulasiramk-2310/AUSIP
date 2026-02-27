import asyncio
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

BASE_URL = os.getenv("ELASTIC_BASE_URL")
API_KEY = os.getenv("ELASTIC_API_KEY")

print(f"Base URL: {BASE_URL}")
print(f"API Key: {API_KEY[:20]}...")

async def test_endpoints():
    # Try different Kibana/Elasticsearch connector endpoints
    tests = [
        ("Actions API Execute", "/api/actions/connector/bedrock-claude/_execute", {
            "params": {
                "subAction": "run",
                "subActionParams": {
                    "body": '{"prompt": "What are unicorns?"}'
                }
            }
        }),
        ("AI Assistant Complete", "/api/observability/ai_assistant/chat/complete", {
            "messages": [{"role": "user", "content": "test"}],
            "connectorId": "bedrock-claude"
        }),
        ("Internal Connector Execute", "/internal/elastic_assistant/actions/connector/bedrock-claude/_execute", {
            "params": {
                "subAction": "invokeAI",
                "subActionParams": {
                    "messages": [{"role": "user", "content": "test"}]
                }
            }
        }),
    ]
    
    headers = {
        "Authorization": f"ApiKey {API_KEY}",
        "kbn-xsrf": "true",
        "Content-Type": "application/json"
    }
    
    for name, path, payload in tests:
        url = f"{BASE_URL}{path}"
        print(f"\n{'='*70}")
        print(f"Test: {name}")
        print(f"URL: {path}")
        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(url, headers=headers, json=payload)
                
                print(f"Status: {response.status_code}")
                if 200 <= response.status_code < 300:
                    print(f"✅ SUCCESS!")
                    print(f"Response: {response.text[:400]}")
                else:
                    print(f"Response: {response.text[:300]}")
                    
        except Exception as e:
            print(f"Exception: {str(e)[:200]}")

if __name__ == "__main__":
    asyncio.run(test_endpoints())
