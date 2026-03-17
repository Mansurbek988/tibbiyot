import urllib.request
import json
import ssl

url = "https://tibbiyot-sigma.vercel.app/api/v1/ai/triage"
data = json.dumps({"symptoms": "istma bor, bosh ogriq"}).encode('utf-8')

req = urllib.request.Request(url, data=data, method="POST")
req.add_header("Content-Type", "application/json")

context = ssl._create_unverified_context()

try:
    with urllib.request.urlopen(req, context=context) as response:
        print(f"Status Code: {response.getcode()}")
        print("Response JSON:")
        print(json.dumps(json.loads(response.read().decode('utf-8')), indent=2))
except urllib.error.HTTPError as e:
    print(f"HTTP Error: {e.code}")
    error_body = e.read().decode('utf-8')
    try:
        print("Error JSON:")
        print(json.dumps(json.loads(error_body), indent=2))
    except:
        print(f"Error body: {error_body}")
except Exception as e:
    print(f"Generic Error: {e}")
