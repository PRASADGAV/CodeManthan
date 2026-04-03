"""
PDF text extraction service.
Uses PyMuPDF (fitz) for reliable text extraction from PDFs.
Designed to be extended with OCR for scanned PDFs later.
"""
import fitz  # PyMuPDF
import re


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """Extract text from a PDF file's bytes."""
    doc = fitz.open(stream=file_bytes, filetype="pdf")
    full_text = []

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text("text")
        if text.strip():
            full_text.append(text.strip())

    doc.close()

    raw_text = "\n\n".join(full_text)
    return clean_text(raw_text)


def clean_text(text: str) -> str:
    """Clean extracted text: fix whitespace, remove junk characters."""
    # Collapse multiple newlines
    text = re.sub(r"\n{3,}", "\n\n", text)
    # Collapse multiple spaces
    text = re.sub(r"[ \t]{2,}", " ", text)
    # Remove non-printable characters (keep newlines)
    text = re.sub(r"[^\S\n]+", " ", text)
    return text.strip()


def chunk_text(text: str, max_chars: int = 12000) -> list[str]:
    """
    Split text into chunks if it exceeds max_chars.
    Tries to split on paragraph boundaries.
    """
    if len(text) <= max_chars:
        return [text]

    paragraphs = text.split("\n\n")
    chunks = []
    current_chunk = ""

    for para in paragraphs:
        if len(current_chunk) + len(para) + 2 > max_chars:
            if current_chunk:
                chunks.append(current_chunk.strip())
            current_chunk = para
        else:
            current_chunk += "\n\n" + para

    if current_chunk.strip():
        chunks.append(current_chunk.strip())

    return chunks if chunks else [text[:max_chars]]
