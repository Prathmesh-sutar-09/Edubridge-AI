import os
from PyPDF2 import PdfReader
from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.embeddings import OllamaEmbeddings
from langchain_community.vectorstores import FAISS
from tqdm import tqdm

def extract_text_from_pdf(pdf_path):
    """Extract text from a single PDF file"""
    text = ""
    with open(pdf_path, 'rb') as file:
        reader = PdfReader(file)
        for page in reader.pages:
            text += page.extract_text() or ""  # Handle None returns
    return text

def process_pdfs_to_faiss_index(folder_path, index_name="pdf_faiss_index", ollama_model="llama3.2"):
    """
    Process all PDFs in a folder and create a FAISS index using Ollama embeddings
    
    Args:
        folder_path: Path to folder containing PDFs
        index_name: Name for the output FAISS index folder
        ollama_model: Name of the Ollama model to use for embeddings
    """
    # Initialize components
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len
    )
    
    # Initialize Ollama Embeddings
    embeddings = OllamaEmbeddings(model=ollama_model)
    
    # Get all PDF files in the folder
    pdf_files = [f for f in os.listdir(folder_path) if f.lower().endswith('.pdf')]
    if not pdf_files:
        print(f"No PDF files found in {folder_path}")
        return
    
    print(f"Found {len(pdf_files)} PDF files to process")
    
    # Process each PDF and accumulate chunks
    all_chunks = []
    for pdf_file in tqdm(pdf_files, desc="Processing PDFs"):
        pdf_path = os.path.join(folder_path, pdf_file)
        try:
            text = extract_text_from_pdf(pdf_path)
            chunks = text_splitter.split_text(text)
            all_chunks.extend(chunks)
        except Exception as e:
            print(f"Error processing {pdf_file}: {str(e)}")
    
    if not all_chunks:
        print("No text chunks were created from the PDFs")
        return
    
    print(f"Created {len(all_chunks)} text chunks from all PDFs")
    
    # Create FAISS index from the chunks
    print("Creating FAISS index with Ollama embeddings...")
    faiss_index = FAISS.from_texts(all_chunks, embeddings)
    
    # Save the index
    faiss_index.save_local(index_name)
    print(f"FAISS index saved to '{index_name}' folder")

# Example usage
if __name__ == "__main__":
    pdf_folder = "system_data"  # Replace with your folder path
    process_pdfs_to_faiss_index(pdf_folder, ollama_model="llama3.2")