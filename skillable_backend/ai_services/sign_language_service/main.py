"""
ai_services/sign_language_service/main.py
FastAPI microservice for sign language gesture recognition.
Receives 21 MediaPipe hand landmarks → returns predicted gesture + text.
"""
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np

app = FastAPI(title="SkillAble Sign Language Service")


class LandmarkRequest(BaseModel):
    landmarks: List[List[float]]  # shape: (21, 3) — x, y, z per keypoint


class PredictionResponse(BaseModel):
    gesture: str
    text: str
    confidence: float


# ---- Model loading (replace with real model in production) ----

def load_model():
    """
    In production: load PyTorch/TensorFlow model from disk.
    torch.load("sign_model.pt") or tf.saved_model.load("sign_model")
    """
    return None  # placeholder


MODEL = load_model()

# Static demo mapping — replace with actual model inference
GESTURE_MAP = {
    0: ("hello", "Hello"),
    1: ("yes", "Yes"),
    2: ("no", "No"),
    3: ("help", "I need help"),
    4: ("job", "Job"),
    5: ("interview", "Interview"),
    6: ("resume", "Resume"),
    7: ("apply", "Apply"),
    8: ("deaf", "I am deaf"),
    9: ("understand", "I understand"),
}


def extract_features(landmarks: List[List[float]]) -> np.ndarray:
    """
    Normalize and flatten landmark coordinates relative to wrist.
    This is the same preprocessing the training pipeline used.
    """
    pts = np.array(landmarks, dtype=np.float32)  # (21, 3)
    if pts.shape != (21, 3):
        raise ValueError("Expected 21 landmarks with 3 coordinates each.")
    # Translate to wrist origin
    pts -= pts[0]
    # Normalise by max absolute value
    max_val = np.abs(pts).max()
    if max_val > 0:
        pts /= max_val
    return pts.flatten()  # (63,)


def predict(features: np.ndarray) -> tuple[int, float]:
    """
    Run inference. Replace with real model forward pass:
        with torch.no_grad():
            logits = MODEL(torch.tensor(features).unsqueeze(0))
            probs = torch.softmax(logits, dim=-1)
            idx = probs.argmax().item()
            confidence = probs[0, idx].item()
    """
    # Demo: deterministic hash-based prediction
    idx = int(np.abs(features).sum() * 100) % len(GESTURE_MAP)
    confidence = 0.85 + (np.abs(features).mean() % 0.15)
    return idx, round(float(confidence), 3)


@app.post("/predict", response_model=PredictionResponse)
async def predict_gesture(req: LandmarkRequest):
    try:
        features = extract_features(req.landmarks)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    idx, confidence = predict(features)
    gesture, text = GESTURE_MAP.get(idx, ("unknown", ""))

    return PredictionResponse(gesture=gesture, text=text, confidence=confidence)


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL is not None}
