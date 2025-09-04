import cv2
import sys

def test_camera(device_index):
    cap = cv2.VideoCapture(device_index)
    
    if not cap.isOpened():
        print(f"Error: Could not open camera with index {device_index}")
        return False
    
    print(f"Successfully opened camera with index {device_index}")
    print(f"Frame width: {cap.get(cv2.CAP_PROP_FRAME_WIDTH)}")
    print(f"Frame height: {cap.get(cv2.CAP_PROP_FRAME_HEIGHT)}")
    print(f"FPS: {cap.get(cv2.CAP_PROP_FPS)}")
    
    while True:
        ret, frame = cap.read()
        if not ret:
            print("Error: Failed to grab frame")
            break
        
        cv2.imshow('Camera Test', frame)
        
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break
    
    cap.release()
    cv2.destroyAllWindows()
    return True

if __name__ == "__main__":
    if len(sys.argv) > 1:
        device_index = int(sys.argv[1])
    else:
        device_index = 0
    
    success = test_camera(device_index)
    if success:
        print("Camera test completed successfully.")
    else:
        print("Camera test failed.")
