import asyncio
import httpx
from dotenv import load_dotenv
import os

load_dotenv()

BASE_URL = os.getenv("ELASTIC_BASE_URL")
API_KEY = os.getenv("ELASTIC_API_KEY")
AGENT_ID = os.getenv("ELASTIC_AGENT_ID")

HEADERS = {
    "Authorization": f"ApiKey {API_KEY}",
    "kbn-xsrf": "true",
    "Content-Type": "application/json"
}

async def debug_agent():
    url = f"{BASE_URL}/api/agent_builder/converse/async"
    
    payload = {
        "agent_id": AGENT_ID,
        "input": "What are AI unicorns?"
    }
    
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, headers=HEADERS, json=payload)
            
            print(f"Status: {response.status_code}")
            print(f"Response Length: {len(response.text)} bytes")
            
            # Parse SSE events
            events = response.text.strip().split('\n\n')
            print(f"\nTotal Events: {len(events)}")
            
            # Analyze each event
            for i, event in enumerate(events):
                if not event.strip():
                    continue
                    
                lines = event.strip().split('\n')
                event_type = None
                data_content = None
                
                for line in lines:
                    if line.startswith('event:'):
                        event_type = line.replace('event:', '').strip()
                    elif line.startswith('data:'):
                        data_content = line.replace('data:', '').strip()
                
                if event_type or data_content:
                    print(f"\n=== Event {i} ===")
                    print(f"Type: {event_type}")
                    if data_content and data_content != '0':
                        print(f"Data: {data_content[:200]}")
    
    except Exception as e:
        print(f"Error: {str(e)}")

if __name__ == "__main__":
    asyncio.run(debug_agent())
