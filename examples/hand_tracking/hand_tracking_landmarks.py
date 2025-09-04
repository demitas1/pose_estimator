import cv2
import mediapipe as mp

mp_hands = mp.solutions.hands
hands = mp_hands.Hands(static_image_mode=False, max_num_hands=2, min_detection_confidence=0.5)
mp_draw = mp.solutions.drawing_utils

cap = cv2.VideoCapture(0)

# Define important landmarks
important_landmarks = {
    "Wrist": 0,
    "Thumb tip": 4,
    "Index finger tip": 8,
    "Middle finger tip": 12,
    "Ring finger tip": 16,
    "Pinky tip": 20
}

while True:
    success, image = cap.read()
    image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
    results = hands.process(image_rgb)

    if results.multi_hand_landmarks:
        for hand_landmarks in results.multi_hand_landmarks:
            mp_draw.draw_landmarks(image, hand_landmarks, mp_hands.HAND_CONNECTIONS)

            # Extract and print important landmarks
            for name, landmark_id in important_landmarks.items():
                landmark = hand_landmarks.landmark[landmark_id]
                h, w, c = image.shape
                cx, cy = int(landmark.x * w), int(landmark.y * h)
                print(f"{name}: x={landmark.x:.2f}, y={landmark.y:.2f}, z={landmark.z:.2f}")
                cv2.circle(image, (cx, cy), 5, (255, 0, 0), cv2.FILLED)

    cv2.imshow("Hand Tracking", image)
    if cv2.waitKey(1) & 0xFF == ord('q'):
        break

cap.release()
cv2.destroyAllWindows()
