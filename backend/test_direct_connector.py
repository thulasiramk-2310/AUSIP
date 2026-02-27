import asyncio
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

BASE_URL = os.getenv("ELASTIC_BASE_URL")
API_KEY = os.getenv("ELASTIC_API_KEY")

async def test_connector():
    # Try Elasticsearch connector endpoints
    headers = {
        "Authorization": f"ApiKey {API_KEY}",
        "Content-Type": "application/json"
    }
    
    # Test 1: Execute connector with POST body
    url = f"{BASE_URL}/_connector/bedrock-claude/_execute"
    payload = {
        "input": "What are the top unicorn companies?"
    }
    
    print(f"Testing: {url}")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=headers, json=payload)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error: {e}")
    
    # Test 2: Inference API with connector
    print("\n" + "="*60)
    url2 = f"{BASE_URL}/_ml/trained_models/bedrock-claude/_infer"
    payload2 = {
        "docs": [{"text_field": "What are the top unicorn companies?"}]
    }
    
    print(f"Testing: {url2}")
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url2, headers=headers, json=payload2)
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text[:500]}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    asyncio.run(test_connector())
