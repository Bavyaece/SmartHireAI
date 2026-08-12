import io
import re
from docx import Document


def _clean_chunk(text: str | None) -> str:
    if not text:
        return ""
    text = text.replace("\x00", " ").replace("\xa0", " ")
    text = text.replace("\ufb01", "fi").replace("\ufb02", "fl")
    return text


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF: PyMuPDF first, then pypdf, then pdfminer."""
    candidates: list[str] = []

    # Strategy 1: PyMuPDF (best for most resumes)
    try:
        import fitz  # pymupdf

        doc = fitz.open(stream=content, filetype="pdf")
        parts = []
        for page in doc:
            # "text" is default; also try blocks for multi-column
            t = page.get_text("text") or ""
            if len(re.sub(r"\s+", "", t)) < 20:
                t = page.get_text("blocks")
                if isinstance(t, list):
                    t = "\n".join(b[4] for b in t if len(b) > 4 and isinstance(b[4], str))
            parts.append(_clean_chunk(t))
        doc.close()
        candidates.append("\n".join(parts))
    except Exception:
        pass

    # Strategy 2: pypdf
    try:
        from pypdf import PdfReader

        reader = PdfReader(io.BytesIO(content))
        parts = []
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
            parts.append(_clean_chunk(text))
        candidates.append("\n".join(parts))
    except Exception:
        pass

    # Strategy 3: pdfminer
    try:
        from pdfminer.high_level import extract_text as pdfminer_extract

        mined = _clean_chunk(pdfminer_extract(io.BytesIO(content)) or "")
        candidates.append(mined)
    except Exception:
        pass

    def score(t: str) -> int:
        return len(re.findall(r"[A-Za-z]{2,}", t or ""))

    best = max(candidates, key=score) if candidates else ""
    return best or ""


def extract_text_from_docx(content: bytes) -> str:
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
        for block in (section.header, section.footer):
            if block is None:
                continue
            for p in block.paragraphs:
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
            "Legacy .DOC files are not supported. Please save as PDF or DOCX, or paste your resume text below."
        )

    if content[:4] == b"%PDF":
        return extract_text_from_pdf(content)
    if content[:2] == b"PK":
        return extract_text_from_docx(content)

    # Treat unknown as plain text
    return extract_text_from_txt(content)


def normalize_text(text: str) -> str:
    text = _clean_chunk(text)
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    text = text.replace("\n", " ")
    text = re.sub(r"\s+", " ", text)
    return text.strip()


def extraction_quality(text: str) -> dict:
    chars = len(text)
    letters = len(re.findall(r"[A-Za-z]", text))
    words = len(re.findall(r"[A-Za-z]{2,}", text))
    return {"chars": chars, "letters": letters, "words": words}
