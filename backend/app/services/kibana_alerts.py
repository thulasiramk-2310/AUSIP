import os
import httpx
from typing import List, Dict, Any
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("ELASTIC_BASE_URL")
API_KEY = os.getenv("ELASTIC_API_KEY")

HEADERS = {
    "Authorization": f"ApiKey {API_KEY}",
    "kbn-xsrf": "true",
    "Content-Type": "application/json"
}


async def get_kibana_alerts() -> List[Dict[str, Any]]:
    """
    Fetch alerts from Kibana Alerting API.
    
    Returns:
        List of alert objects
    """
    try:
        # Kibana Alerting API endpoint
        url = f"{BASE_URL}/api/alerting/rules"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=HEADERS)
            
            if response.status_code == 200:
                rules_data = response.json()
                
                # Transform Kibana rules to our alert format
                alerts = []
                for rule in rules_data.get('data', []):
                    alerts.append({
                        'id': rule.get('id'),
                        'name': rule.get('name'),
                        'status': 'active' if rule.get('enabled') else 'resolved',
                        'severity': 'medium',  # Default, can be customized
                        'message': rule.get('consumer', ''),
                        'timestamp': rule.get('updated_at', rule.get('created_at')),
                        'source': 'Kibana Alerting',
                    })
                
                return alerts
            else:
                print(f"Kibana alerts error: {response.status_code} - {response.text}")
                return []
                
    except Exception as e:
        print(f"Failed to fetch Kibana alerts: {str(e)}")
        return []


async def get_alert_instances(rule_id: str) -> List[Dict[str, Any]]:
    """
    Get active alert instances for a specific rule.
    
    Args:
        rule_id: The Kibana rule ID
        
    Returns:
        List of active alert instances
    """
    try:
        url = f"{BASE_URL}/api/alerting/rule/{rule_id}/state"
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.get(url, headers=HEADERS)
            
            if response.status_code == 200:
                state_data = response.json()
                return state_data.get('alerts', [])
            else:
                return []
                
    except Exception as e:
        print(f"Failed to fetch alert instances: {str(e)}")
        return []
