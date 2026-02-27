import asyncio
import httpx
from dotenv import load_dotenv
import os
import time

load_dotenv()

BASE_URL = os.getenv("ELASTIC_BASE_URL")
API_KEY = os.getenv("ELASTIC_API_KEY")
AGENT_ID = os.getenv("ELASTIC_AGENT_ID")

HEADERS = {
    "Authorization": f"ApiKey {API_KEY}",
    "kbn-xsrf": "true",
    "Content-Type": "application/json"
}

async def debug_stream():
    url = f"{BASE_URL}/api/agent_builder/converse/async"
    
    payload = {
        "agent_id": AGENT_ID,
        "input": "What are AI unicorns?"
    }
    
    print(f"Calling: {url}")
    print(f"Agent ID: {AGENT_ID}")
    print("\nWaiting for events (will timeout after 10 seconds of no data)...\n")
    
    try:
        async with httpx.AsyncClient(timeout=httpx.Timeout(60.0)) as client:
            async with client.stream('POST', url, headers=HEADERS, json=payload) as response:
                print(f"Status: {response.status_code}\n")
                
                event_count = 0
                start_time = time.time()
                
                async for chunk in response.aiter_text():
                    elapsed = time.time() - start_time
                    
                    if chunk.strip():
                        event_count += 1
                        print(f"[{elapsed:.1f}s] Event {event_count}:")
                        
                        # Parse event
                        lines = chunk.strip().split('\n')
                        for line in lines:
                            if line.startswith('event:'):
                                print(f"  Type: {line.replace('event:', '').strip()}")
                            elif line.startswith('data:'):
                                data = line.replace('data:', '').strip()
                                if data != '0' and len(data) < 500:
                                    print(f"  Data: {data}")
                                elif len(data) >= 500:
                                    print(f"  Data: {data[:200]}... ({len(data)} chars)")
                        print()
                    
                    if event_count >= 50:  # Limit to first 50 events
                        print("\n=== Stopping after 50 events ===")
                        break
                
                print(f"\nTotal events received: {event_count}")
                print(f"Total time: {time.time() - start_time:.1f}s")
    
    except httpx.TimeoutException:
        print("\n⚠️  TIMEOUT - No response after 10 seconds")
        print("This suggests the agent is not responding or stuck waiting for something.")
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print(f"Type: {type(e).__name__}")

if __name__ == "__main__":
    asyncio.run(debug_stream())
