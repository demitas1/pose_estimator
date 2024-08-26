import { PoseLandmarker, FilesetResolver, DrawingUtils } from "@mediapipe/tasks-vision";

class PoseEstimator {
  private poseLandmarker: PoseLandmarker | null = null;
  private drawingUtils: DrawingUtils | null = null;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private fileInput: HTMLInputElement | null = null;
  private container: HTMLDivElement | null = null;
  private readonly DISPLAY_HEIGHT = 480; // Fixed display height

  constructor() {
    this.initializeDOMElements();
    this.initializeMediaPipe();
  }

  private initializeDOMElements(): void {
    // Create a container for our elements
    this.container = document.createElement("div");
    this.container.style.display = "flex";
    this.container.style.flexDirection = "column";
    this.container.style.alignItems = "center";
    this.container.style.gap = "10px";
    document.body.appendChild(this.container);

    // Create file input element
    this.fileInput = document.createElement("input");
    this.fileInput.type = "file";
    this.fileInput.accept = "image/*";
    this.fileInput.style.margin = "10px 0";
    this.container.appendChild(this.fileInput);

    // Create canvas element
    this.canvas = document.createElement("canvas");
    this.canvas.style.border = "1px solid black";
    this.container.appendChild(this.canvas);
    
    this.ctx = this.canvas.getContext("2d");

    // Add event listener for file selection
    this.fileInput.addEventListener("change", (event) => this.handleFileSelect(event));
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
      runningMode: "IMAGE",
      numPoses: 1
    });
  }

  private handleFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => this.processImage(img);
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  private processImage(img: HTMLImageElement): void {
    if (this.canvas && this.ctx) {
      const scaleFactor = this.DISPLAY_HEIGHT / img.height;
      const newWidth = Math.floor(img.width * scaleFactor);
      
      this.canvas.height = this.DISPLAY_HEIGHT;
      this.canvas.width = newWidth;
      
      // Clear the canvas and draw the image
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      this.ctx.drawImage(img, 0, 0, newWidth, this.DISPLAY_HEIGHT);
      
      this.predictPose(img);
    }
  }

  private async predictPose(image: HTMLImageElement): Promise<void> {
    if (this.poseLandmarker) {
      const results = await this.poseLandmarker.detect(image);
      this.displayResults(results);
    }
  }

  private displayResults(results: any): void {
    if (this.ctx && this.canvas) {
      // Initialize DrawingUtils with the current context
      this.drawingUtils = new DrawingUtils(this.ctx);

      if (results.landmarks) {
        for (const landmarks of results.landmarks) {
          this.drawingUtils.drawConnectors(
            landmarks,
            PoseLandmarker.POSE_CONNECTIONS,
            { color: "#00FF00", lineWidth: 2 }
          );
          this.drawingUtils.drawLandmarks(landmarks, {
            color: "#FF0000",
            lineWidth: 1
          });
        }
      }
    }
  }
}

// Initialize the pose estimator when the page loads
window.onload = () => new PoseEstimator();
