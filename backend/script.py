from src.chroma_setup import chroma_client, collection

results = collection.get(include=["metadatas"])
ids = results["ids"]
metadatas = results["metadatas"]

print(f"Total embeddings stored: {len(ids)}\n")
# collection.delete(ids=ids)
for i, _id in enumerate(ids):
    print(f"ID: {_id}")
    print(f"Metadata: {metadatas[i]}")
    
family_member_id = "k579c660nd9gd17ad7y4mj307d7j1j5e"

# # Find all documents with that family_member_id
# results = collection.get(
#     where={"family_member_id": family_member_id}
# )

# print(results)

# ids_to_delete = results["ids"]

# if ids_to_delete:
#     collection.delete(ids=ids_to_delete)
#     print(f"Deleted {len(ids_to_delete)} records for family_member_id={family_member_id}")
# else:
#     print(f"No records found for family_member_id={family_member_id}")
