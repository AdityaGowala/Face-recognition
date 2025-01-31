# Face Recognition Web Application

A web-based facial recognition system built using `face-api.js` to provide real-time face detection and recognition. Users can upload and label images for training the system, and then use the app to recognize faces from new images.

## Features

- **Image Labeling & Training**: Upload and label multiple images for training the system to recognize faces.
- **Real-Time Recognition**: Detect and recognize faces from uploaded images using the stored labeled data.
- **LocalStorage Integration**: Save labeled images and associated data locally for offline use.
- **Interactive UI**: A responsive user interface with a collapsible navbar, dropdown settings menu, and real-time notifications.

## Technologies Used

- **JavaScript**
- **`face-api.js`** (for face detection and recognition)
- **HTML/CSS**
- **LocalStorage** (for saving labeled face data)

## Setup

1. Clone the repository.
2. Ensure that the required `face-api.js` models are available in the `/models` directory.
3. Open `index.html` in a browser to start the application.

## Usage

1. **Label Images**: Upload images and assign a label (e.g., a person's name) to train the system.
2. **Recognize Faces**: Upload a new image and the app will identify any faces and match them to the labeled ones.
3. **Manage Labeled Data**: View, add, and delete labeled images as needed.



