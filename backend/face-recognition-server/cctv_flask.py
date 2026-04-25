import os
os.environ["TF_CPP_MIN_LOG_LEVEL"]   = "3"
os.environ["TF_ENABLE_ONEDNN_OPTS"]  = "0"
os.environ["DEEPFACE_LOG_LEVEL"]     = "50"

import cv2
import threading
import time
import requests
import warnings
import logging
from datetime import datetime
from flask import Flask, Response, jsonify
from flask_cors import CORS
from flask import Blueprint
app = Blueprint('cctv', __name__)

warnings.filterwarnings("ignore")
logging.getLogger("tensorflow").setLevel(logging.ERROR)
logging.getLogger("deepface").setLevel(logging.CRITICAL)

FACES_PATH   = "faces"
NODE_API     = "http://localhost:5000/api/attendance"
FRAME_SKIP   = 30
COOLDOWN_SEC = 60

face_cascade = cv2.CascadeClassifier(
    cv2.data.haarcascades + "haarcascade_frontalface_default.xml"
)

_lock         = threading.Lock()
_output_lock  = threading.Lock()
camera_active = False
latest_frame  = None
_camera_thread = None
last_seen     = {}


def _get_deepface():
    from deepface import DeepFace
    return DeepFace


def _camera_loop():
    global camera_active, latest_frame, last_seen

    video = cv2.VideoCapture(0, cv2.CAP_DSHOW)

    if not video.isOpened():
        print("Camera not accessible")
        with _lock:
            camera_active = False
        return

    DeepFace    = _get_deepface()
    frame_count = 0
    print("Camera started")

    while camera_active:
        ret, frame = video.read()
        if not ret:
            print("Failed to grab frame")
            break

        frame_count += 1

        # Emit raw frame on skipped frames so stream stays smooth
        if frame_count % FRAME_SKIP != 0:
            _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 70])
            with _output_lock:
                latest_frame = buf.tobytes()
            time.sleep(0.03)
            continue

        try:
            results = DeepFace.find(
    img_path          = frame,
    db_path           = FACES_PATH,
    enforce_detection = False,
    silent            = True,
    model_name        = "VGG-Face",
    detector_backend  = "opencv",  # fastest detector
)

            gray  = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            faces = face_cascade.detectMultiScale(gray, 1.3, 5)

            # ── Multiple face detection ──────────────────────
            detected = {}  # {worker_id: label}

            for df in results:
                if df.empty:
                    continue
                match         = df.iloc[0]
                identity_path = match["identity"]
                filename      = os.path.basename(identity_path)
                try:
                    worker_id = int(filename.split(".")[0])
                except ValueError:
                    continue

                detected[worker_id] = f"ID: {worker_id}"
                now = datetime.now()

                if (worker_id not in last_seen or
                        (now - last_seen[worker_id]).seconds > COOLDOWN_SEC):
                    last_seen[worker_id] = now
                    try:
                        requests.post(
                            NODE_API,
                            json={"worker_id": worker_id, "status": "Present"},
                            timeout=2,
                        )
                        print(f"Attendance marked for worker {worker_id}")
                    except Exception as api_err:
                        print("API Error:", api_err)

            # ── Draw one box per face ────────────────────────
            detected_list = list(detected.keys())

            for i, (x, y, w, h) in enumerate(faces):
                if i < len(detected_list):
                    wid        = detected_list[i]
                    label_text = detected[wid]
                    label_color = (0, 255, 0)
                else:
                    label_text  = "UNKNOWN"
                    label_color = (0, 0, 255)

                cv2.rectangle(frame, (x, y), (x + w, y + h), label_color, 2)
                cv2.putText(
                    frame, label_text,
                    (x, y - 10),
                    cv2.FONT_HERSHEY_SIMPLEX, 0.8,
                    label_color, 2,
                )

        except Exception as e:
            print("Error:", e)

        _, buf = cv2.imencode(".jpg", frame, [cv2.IMWRITE_JPEG_QUALITY, 80])
        with _output_lock:
            latest_frame = buf.tobytes()

        time.sleep(0.3)

    video.release()
    print("Camera stopped")


def _generate():
    while camera_active:
        with _output_lock:
            frame = latest_frame
        if frame is None:
            time.sleep(0.05)
            continue
        yield (
            b"--frame\r\n"
            b"Content-Type: image/jpeg\r\n\r\n"
            + frame +
            b"\r\n"
        )
        time.sleep(0.05)


@app.route("/cctv/start", methods=["POST"])
def start_camera():
    global camera_active, _camera_thread, last_seen
    with _lock:
        if camera_active:
            return jsonify({"status": "already_running"})
        last_seen = {}          # ← reset cooldown on every start
        camera_active  = True
        _camera_thread = threading.Thread(target=_camera_loop, daemon=True)
        _camera_thread.start()
    return jsonify({"status": "started"})


@app.route("/cctv/stop", methods=["POST"])
def stop_camera():
    global camera_active
    with _lock:
        camera_active = False
    return jsonify({"status": "stopped"})


@app.route("/cctv/status", methods=["GET"])
def camera_status():
    return jsonify({"active": camera_active})


@app.route("/video_feed")
def video_feed():
    if not camera_active:
        return jsonify({"error": "Camera not started"}), 400
    return Response(
        _generate(),
        mimetype="multipart/x-mixed-replace; boundary=frame",
    )
