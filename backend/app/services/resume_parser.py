import io
import re
from pypdf import PdfReader
from docx import Document


def _clean_chunk(text: str | None) -> str:
    if not text:
        return ""
    # Fix common PDF ligatures / broken spacing
    text = text.replace("\x00", " ")
    text = text.replace("\xa0", " ")
    text = text.replace("\ufb01", "fi").replace("\ufb02", "fl")
    return text


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF using pypdf, then pdfminer as fallback."""
    parts: list[str] = []

    # Strategy 1: pypdf (fast)
    try:
        reader = PdfReader(io.BytesIO(content))
        for page in reader.pages:
            try:
                text = page.extract_text() or ""
            except Exception:
                text = ""
            if not text.strip():
                try:
                    text = page.extract_text(extraction_mode="layout") or ""
                except Exception:
                    text = ""
            text = _clean_chunk(text)
            if text.strip():
                parts.append(text)
    except Exception:
        parts = []

    joined = "\n".join(parts).strip()
    if len(re.sub(r"\s+", "", joined)) >= 40:
        return joined

    # Strategy 2: pdfminer (better for many resumes)
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract

        mined = pdfminer_extract(io.BytesIO(content)) or ""
        mined = _clean_chunk(mined)
        if len(re.sub(r"\s+", "", mined)) > len(re.sub(r"\s+", "", joined)):
            return mined
    except Exception:
        pass

    return joined


def extract_text_from_docx(content: bytes) -> str:
    """Extract paragraphs, tables, headers, and footers from DOCX."""
    doc = Document(io.BytesIO(content))
    parts: list[str] = []

    for p in doc.paragraphs:
        if p.text and p.text.strip():
            parts.append(p.text)

    for table in doc.tables:
        for row in table.rows:
            cells = [c.text.strip() for c in row.cells if c.text and c.text.strip()]
            if cells:
                parts.append(" | ".join(cells))

    for section in doc.sections:
        for header in (section.header, section.footer):
            if header is None:
                continue
            for p in header.paragraphs:
                if p.text and p.text.strip():
                    parts.append(p.text)

    return "\n".join(parts)


def extract_text_from_txt(content: bytes) -> str:
    for encoding in ("utf-8", "utf-16", "latin-1", "cp1252"):
        try:
            return content.decode(encoding)
        except UnicodeDecodeError:
            continue
    return content.decode("utf-8", errors="ignore")


def extract_text(filename: str, content: bytes) -> str:
    if not content:
        raise ValueError("Empty file uploaded.")

    lower = (filename or "").lower().strip()

    if lower.endswith(".pdf"):
        return extract_text_from_pdf(content)
    if lower.endswith(".docx"):
        return extract_text_from_docx(content)
    if lower.endswith(".txt"):
        return extract_text_from_txt(content)
    if lower.endswith(".doc"):
        raise ValueError(
            "Legacy .DOC files are not supported. Please save as PDF or DOCX and try again."
        )

    # Guess by magic bytes
    if content[:4] == b"%PDF":
        return extract_text_from_pdf(content)
    if content[:2] == b"PK":  # zip-based docx
        return extract_text_from_docx(content)

    raise ValueError("Unsupported file type. Upload PDF, DOCX, or TXT.")


def normalize_text(text: str) -> str:
    text = _clean_chunk(text)
    # Join hyphenated line breaks common in PDFs: "develop-\nment" → "development"
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extraction_quality(text: str) -> dict:
    """Return metrics used for validation / clearer errors."""
    chars = len(text)
    letters = len(re.findall(r"[A-Za-z]", text))
    words = len(re.findall(r"[A-Za-z]{2,}", text))
    return {"chars": chars, "letters": letters, "words": words}
