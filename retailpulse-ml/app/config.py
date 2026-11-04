import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file from the retailpulse-ml directory
BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

class Settings:
    PROJECT_NAME: str = "RetailPulse Predictive ML Engine"
    VERSION: str = "3.0.0"
    PORT: int = int(os.getenv("PORT", "8000"))
    HOST: str = os.getenv("HOST", "127.0.0.1")
    ENV: str = os.getenv("ENV", "development")
    ALLOWED_ORIGINS: str = os.getenv("ALLOWED_ORIGINS", "http://localhost:5000,http://127.0.0.1:5000,http://localhost:5173,http://127.0.0.1:5173")

    # Path to canonical JSON database
    _default_data_path = BASE_DIR.parent / "retail-pulse-connector" / "data" / "retail_pulse.json"
    DATA_FILE_PATH: Path = Path(os.getenv("DATA_FILE_PATH", str(_default_data_path)))

    DEFAULT_HORIZON_DAYS: int = int(os.getenv("DEFAULT_HORIZON_DAYS", "7"))
    DEFAULT_SERVICE_LEVEL: float = float(os.getenv("DEFAULT_SERVICE_LEVEL", "0.95"))
    ANOMALY_ZSCORE_THRESHOLD: float = float(os.getenv("ANOMALY_ZSCORE_THRESHOLD", "2.0"))

settings = Settings()
