from flask import Flask, request, jsonify
from flask_cors import CORS
from cctv_flask import start_camera, stop_camera, camera_status, video_feed
from chatbot import chatbot_bp
import os
import cv2
import numpy as np
import base64


# Load DeepFace at startup — prevents slow first request
print("Loading DeepFace model...")
from deepface import DeepFace
# warm up the model
import numpy as np
dummy = np.zeros((100, 100, 3), dtype=np.uint8)
import cv2
cv2.imwrite("warmup.jpg", dummy)
try:
    DeepFace.verify("warmup.jpg", "warmup.jpg", enforce_detection=False)
except:
    pass
import os
os.remove("warmup.jpg")
print("DeepFace model loaded! ✅")

app = Flask(__name__)
CORS(app)
# After app = Flask(__name__) and CORS setup
from cctv_flask import app as cctv_bp
app.register_blueprint(cctv_bp)
app.register_blueprint(chatbot_bp)

# folder to store face images
FACES_DIR = "faces"
os.makedirs(FACES_DIR, exist_ok=True)

# ── Index Route ──────────────────────────────────────────────
@app.route("/")
def index():
    return jsonify({"message": "Face Recognition Server Running!"})

# ── Register Face ─────────────────────────────────────────────
@app.route("/register-face", methods=["POST"])
def register_face():
    try:
        data = request.json
        worker_id = data["worker_id"]
        image_data = data["image"]

        # decode base64 image
        image_bytes = base64.b64decode(image_data.split(",")[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # save face image
        face_path = os.path.join(FACES_DIR, f"{worker_id}.jpg")
        cv2.imwrite(face_path, img)

        return jsonify({
            "success": True,
            "message": f"Face registered for worker {worker_id}"
        })

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500

# ── Recognize Face ────────────────────────────────────────────
@app.route("/recognize-face", methods=["POST"])
def recognize_face():
    try:
        data = request.json
        image_data = data["image"]

        # decode base64 image
        image_bytes = base64.b64decode(image_data.split(",")[1])
        nparr = np.frombuffer(image_bytes, np.uint8)
        img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)

        # save temp image
        temp_path = "temp_capture.jpg"
        cv2.imwrite(temp_path, img)

        # compare with saved faces
        best_match = None
        best_distance = 0.6

        for filename in os.listdir(FACES_DIR):
            if filename.endswith(".jpg"):
                worker_id = filename.replace(".jpg", "")
                saved_path = os.path.join(FACES_DIR, filename)

                try:
                    result = DeepFace.verify(
                        temp_path,
                        saved_path,
                        enforce_detection=False
                    )

                    if result["verified"]:
                        distance = result["distance"]
                        if distance < best_distance:
                            best_distance = distance
                            best_match = worker_id

                except Exception as e:
                    print(f"Error comparing with {filename}: {e}")
                    continue

        # cleanup temp file
        if os.path.exists(temp_path):
            os.remove(temp_path)

        if best_match:
            confidence = round((1 - best_distance) * 100, 2)
            return jsonify({
                "success": True,
                "worker_id": best_match,
                "confidence": confidence
            })
        else:
            return jsonify({
                "success": False,
                "message": "Face not recognized!"
            })

    except Exception as e:
        import traceback
        print("FULL ERROR:", traceback.format_exc())
        return jsonify({"success": False, "message": str(e)}), 500

# ── Check if face registered ──────────────────────────────────
@app.route("/check-face/<worker_id>", methods=["GET"])
def check_face(worker_id):
    face_path = os.path.join(FACES_DIR, f"{worker_id}.jpg")
    exists = os.path.exists(face_path)
    return jsonify({"registered": exists})

if __name__ == "__main__":
    app.run(port=5001, debug=True)