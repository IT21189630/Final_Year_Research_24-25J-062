import dns.resolver
import pymongo
import os
from dotenv import load_dotenv

import torch
from transformers import AutoTokenizer, AutoModel
import torch.nn.functional as F

dns.resolver.default_resolver = dns.resolver.Resolver(configure=False)
dns.resolver.default_resolver.nameservers = ['8.8.8.8']

load_dotenv(dotenv_path='.env')

uri = os.getenv("MONGO_DB_URI")
if uri is None:
    raise ValueError("MONGO_DB_URI not found in environment variables.")

client = pymongo.MongoClient(uri)
db = client.test
collection = db.recommendations

tokenizer = AutoTokenizer.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")
model = AutoModel.from_pretrained("sentence-transformers/all-MiniLM-L6-v2")


def generateRecommendationVectorSpace(text: str) -> list[float]:
    encoded_input = tokenizer(text, padding=True, truncation=True, return_tensors='pt')
    with torch.no_grad():
        model_output = model(**encoded_input)

    token_embeddings = model_output.last_hidden_state  
    attention_mask = encoded_input['attention_mask'].unsqueeze(-1) 
    masked_embeddings = token_embeddings * attention_mask

    sum_embeddings = masked_embeddings.sum(dim=1)
    sum_mask = attention_mask.sum(dim=1)
    mean_pooled = sum_embeddings / sum_mask.clamp(min=1e-9)

    embedding_vector = mean_pooled[0].cpu().tolist()
    return embedding_vector

def populateRecommendationDescriptions():
    for doc in collection.find({'description': {"$exists": True}}).limit(50):
        doc['description_vector'] = generateRecommendationVectorSpace(doc['description'])
        collection.replace_one({'_id': doc['_id']}, doc)
    return "Embeddings Field Populated"

def generateRecommendations(query):
    query_vector = generateRecommendationVectorSpace(query)
    results = collection.aggregate([
        {
            "$vectorSearch": {
                "queryVector": query_vector,
                "path": "description_vector",
                "numCandidates": 100,
                "limit": 1,
                "index": "RecommendationsDescriptionRAG",
            }
        }
    ])

    results_list = []
    for doc in results:
        doc['_id'] = str(doc['_id'])
        results_list.append(doc)
    
    return results_list
