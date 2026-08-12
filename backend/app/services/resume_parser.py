import io
import re
from docx import Document


def _clean_chunk(text: str | None) -> str:
    if not text:
        return ""
    text = text.replace("\x00", " ").replace("\xa0", " ")
    text = text.replace("\ufb01", "fi").replace("\ufb02", "fl")
    return text


def _word_score(text: str) -> int:
    return len(re.findall(r"[A-Za-z]{2,}", text or ""))


def _ocr_pdf_with_pymupdf(content: bytes, max_pages: int = 3) -> str:
    """OCR scanned PDFs by rendering pages to images (RapidOCR or Tesseract)."""
    try:
        import fitz
    except ImportError:
        return ""

    doc = fitz.open(stream=content, filetype="pdf")
    page_texts: list[str] = []

    ocr_engine = None
    try:
        from rapidocr_onnxruntime import RapidOCR
        import numpy as np

        ocr_engine = ("rapid", RapidOCR(), np)
    except Exception:
        try:
            import pytesseract
            from PIL import Image

            ocr_engine = ("tesseract", pytesseract, Image)
        except Exception:
            doc.close()
            return ""

    try:
        for i, page in enumerate(doc):
            if i >= max_pages:
                break
            # Higher DPI improves OCR on resumes
            pix = page.get_pixmap(matrix=fitz.Matrix(2.0, 2.0), alpha=False)
            png_bytes = pix.tobytes("png")

            if ocr_engine[0] == "rapid":
                RapidOCR, np = ocr_engine[1], ocr_engine[2]
                from PIL import Image

                img = Image.open(io.BytesIO(png_bytes)).convert("RGB")
                result, _ = RapidOCR(np.array(img))
                if result:
                    page_texts.append("\n".join(line[1] for line in result if len(line) > 1))
            else:
                pytesseract, Image = ocr_engine[1], ocr_engine[2]
                img = Image.open(io.BytesIO(png_bytes))
                page_texts.append(pytesseract.image_to_string(img) or "")
    finally:
        doc.close()

    return _clean_chunk("\n".join(page_texts))


def extract_text_from_pdf(content: bytes) -> str:
    """Extract text from PDF: native text first, OCR fallback for scans."""
    candidates: list[str] = []

    # Strategy 1: PyMuPDF
    try:
        import fitz

        doc = fitz.open(stream=content, filetype="pdf")
        parts = []
        for page in doc:
            t = page.get_text("text") or ""
            if _word_score(t) < 8:
                blocks = page.get_text("blocks")
                if isinstance(blocks, list):
                    t = "\n".join(b[4] for b in blocks if len(b) > 4 and isinstance(b[4], str))
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

        candidates.append(_clean_chunk(pdfminer_extract(io.BytesIO(content)) or ""))
    except Exception:
        pass

    best = max(candidates, key=_word_score) if candidates else ""

    # Strategy 4: OCR for scanned / image-only PDFs
    if _word_score(best) < 8:
        ocr_text = _ocr_pdf_with_pymupdf(content)
        if _word_score(ocr_text) > _word_score(best):
            return ocr_text

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
