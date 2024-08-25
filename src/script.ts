import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

class PoseEstimator {
  private poseLandmarker: PoseLandmarker | null = null;
  private drawingUtils: DrawingUtils | null = null;
  private video: HTMLVideoElement | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;

  constructor() {
    this.initializeDOMElements();
    this.initializeMediaPipe();
  }

  private initializeDOMElements(): void {
    this.video = document.getElementById("video") as HTMLVideoElement;
    this.canvas = document.getElementById("canvas") as HTMLCanvasElement;
    this.ctx = this.canvas.getContext("2d");
    this.drawingUtils = new DrawingUtils(this.ctx!);
  }

  private async initializeMediaPipe(): Promise<void> {
    const vision = await FilesetResolver.forVisionTasks(
      "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
    );
    this.poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task",
        delegate: "GPU"
      },
      runningMode: "VIDEO",
      numPoses: 1
    });
    this.startCamera();
  }

  private async startCamera(): Promise<void> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      if (this.video) {
        this.video.srcObject = stream;
        this.video.addEventListener("loadeddata", () => this.predictPose());
      }
    } catch (err) {
      console.error("Error accessing the camera:", err);
    }
  }

  private async predictPose(): Promise<void> {
    let startTimeMs = performance.now();
    if (this.poseLandmarker && this.video) {
      const results = this.poseLandmarker.detectForVideo(this.video, startTimeMs);
      this.displayResults(results);
    }
    requestAnimationFrame(() => this.predictPose());
  }

  private displayResults(results: any): void {
    if (this.ctx && this.canvas) {
      this.ctx.save();
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          this.drawingUtils!.drawConnectors(
            landmarks,
            PoseLandmarker.POSE_CONNECTIONS,
            { color: "#00FF00", lineWidth: 5 }
          );
          this.drawingUtils!.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 2
          });
        }
      }
      this.ctx.restore();
    }
  }
}

// Initialize the pose estimator when the page loads
window.onload = () => new PoseEstimator();
