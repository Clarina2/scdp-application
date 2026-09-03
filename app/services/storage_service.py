import os
import uuid
import logging
from typing import Tuple
from fastapi import UploadFile
from app.config import settings
from app.common.exceptions.custom import BadRequestException

logger = logging.getLogger(__name__)


class StorageService:
    """Service for handling file storage, validation, and retrieval."""

    def __init__(self) -> None:
        self.storage_dir = getattr(settings, "DOCUMENT_STORAGE_PATH", "uploads/stock_documents")
        self.max_size_bytes = getattr(settings, "DOCUMENT_MAX_SIZE_MB", 10) * 1024 * 1024
        self.allowed_mimes = ["application/pdf"]
        self._ensure_storage_dir()

    def _ensure_storage_dir(self) -> None:
        """Create storage directory if it does not exist."""
        os.makedirs(self.storage_dir, exist_ok=True)

    async def save_pdf_file(self, file: UploadFile) -> Tuple[str, str, int, str]:
        """Validate and store a PDF file.

        Returns:
            Tuple[original_filename, relative_storage_path, file_size_bytes, mime_type]
        """
        filename = file.filename or "document.pdf"
        
        # 1. Extension check
        if not filename.lower().endswith(".pdf"):
            raise BadRequestException("Seuls les fichiers PDF sont acceptés (.pdf extension requise).")

        # 2. Content Type check
        content_type = file.content_type or ""
        if "pdf" not in content_type.lower() and content_type not in self.allowed_mimes:
            raise BadRequestException("Seuls les fichiers PDF sont acceptés.")

        # Read file contents for size & header check
        contents = await file.read()
        file_size = len(contents)

        # 3. Size check (<= 10MB)
        if file_size > self.max_size_bytes:
            max_mb = self.max_size_bytes // (1024 * 1024)
            raise BadRequestException(f"Le fichier dépasse la taille maximale autorisée ({max_mb} MB).")

        if file_size == 0:
            raise BadRequestException("Le fichier envoyé est vide.")

        # 4. Signature check (%PDF magic bytes)
        if not contents.startswith(b"%PDF"):
            raise BadRequestException("Le fichier n'est pas un document PDF valide.")

        # Safe unique filename
        safe_ext = ".pdf"
        unique_name = f"{uuid.uuid4().hex}{safe_ext}"
        target_path = os.path.join(self.storage_dir, unique_name)

        # Save to disk
        with open(target_path, "wb") as f:
            f.write(contents)

        logger.info("Saved stock document: %s -> %s (%d bytes)", filename, target_path, file_size)

        return filename, unique_name, file_size, "application/pdf"

    def get_absolute_path(self, relative_path: str) -> str:
        """Get absolute file path and verify no path traversal occurred."""
        # Sanitize filename (only allow basename)
        safe_filename = os.path.basename(relative_path)
        abs_storage_dir = os.path.abspath(self.storage_dir)
        target_path = os.path.abspath(os.path.join(abs_storage_dir, safe_filename))

        # Security check: must remain inside storage directory
        if not target_path.startswith(abs_storage_dir):
            raise BadRequestException("Accès au fichier non autorisé.")

        if not os.path.exists(target_path):
            raise BadRequestException("Fichier introuvable sur le serveur.")

        return target_path
