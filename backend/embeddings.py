from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import FAISS

def create_vector_stores(chunks):
    embeddings = HuggingFaceEmbeddings()
    vectorstore =  FAISS.from_texts(chunks,embeddings)

    return vectorstore
