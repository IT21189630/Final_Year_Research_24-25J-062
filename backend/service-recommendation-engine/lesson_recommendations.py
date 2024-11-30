import dns.resolver
import pymongo
import requests
import os
from dotenv import load_dotenv
dns.resolver.default_resolver=dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers=['8.8.8.8'] 

load_dotenv(dotenv_path='.env')
hf_token = os.getenv("MODEL_ACCESS_TOKEN")
uri = os.getenv("MONGO_DB_URI",)
embedding_url = os.getenv("EMBEDDING_URL")
if uri is None:
    raise ValueError("MONGO_DB_URI not found in environment variables.")

client = pymongo.MongoClient(uri)
db = client.test
collection = db.recommendations

#function for generate vector space matching for a given text
def generateRecommendationVectorSpace(text: str) -> list[float]:
    response = requests.post(
        embedding_url, 
        headers={"Authorization": f"Bearer {hf_token}"},
        json={"inputs": text}
    )

    if(response.status_code != 200):
        raise ValueError(f"Request failed with the code of {response.status_code}: {response.text}")
    
    return response.json()

# add a new field for our recommendation metadata with description vector embeddings
def populateRecommendationDescriptions():
    for doc in collection.find({'description': {"$exists": True}}).limit(50):
        doc['description_vector'] = generateRecommendationVectorSpace(doc['description'])
        collection.replace_one({'_id': doc['_id']}, doc)
    return "Embeddings Field Populated"


# generate recommendations suitable for user performance and send it to the user
def generateRecommendations(query):
    results = collection.aggregate([
    {"$vectorSearch": {
        "queryVector": generateRecommendationVectorSpace(query),
        "path": "description_vector",
        "numCandidates": 100,
        "limit": 1,
        "index": "RecommendationsDescriptionRAG",
        }}
    ])
    results_list = []
    for doc in results:
        doc['_id'] = str(doc['_id'])
        results_list.append(doc)
    
    return results_list
