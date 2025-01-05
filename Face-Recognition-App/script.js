
document.addEventListener("DOMContentLoaded", function() {
  // Select the elements
  const menuIcon = document.getElementById('menuIcon'); // Hamburger icon
  const navbarLinks = document.getElementById('navbarLinks'); // Navbar links
  const hamburgerMenu = document.getElementById('navbarLinks'); // Slide-in menu
  const settingsButton = document.getElementById('settingsButton'); // Settings button
  const dropdownMenu = document.getElementById('dropdownMenu'); // Dropdown menu for settings
  
  // Add event listener to toggle slide-in menu on click (hamburger icon)
  menuIcon.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("show"); // Toggle the visibility of the slide-in menu
  });

  // Add event listener to toggle settings dropdown menu
  settingsButton.addEventListener("click", () => {
    dropdownMenu.classList.toggle("show"); // Toggle visibility of the dropdown menu
  });
});



// JavaScript for face-api.js
const imageUpload = document.getElementById("imageUpload");
const trainingImage = document.getElementById("trainingImage");
const nameInput = document.getElementById("nameInput");
const addLabeledImageButton = document.getElementById("addLabeledImage");
const clearDataButton = document.getElementById("clearDataButton");
const labeledImagesContainer = document.getElementById("labeledImagesContainer");
const showLabeledDataButton = document.getElementById("showLabeledDataButton");
const container = document.getElementById("container");
const snackbar = document.getElementById("snackbar");

// In-memory storage for labeled data
let labeledFaceDescriptors = [];
let faceMatcher;

// Load models
Promise.all([
  faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
  faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
  faceapi.nets.ssdMobilenetv1.loadFromUri("/models"),
]).then(() => {
  showSnackbar("Models loaded successfully. Loading saved labeled data...");
  loadLabeledData();
});

// Function to display a snackbar message
function showSnackbar(message) {
  snackbar.textContent = message;
  snackbar.classList.add("show");
  setTimeout(() => {
    snackbar.classList.remove("show");
  }, 3000);
}

// Function to save labeled data locally
function saveLabeledData() {
  const serializedData = labeledFaceDescriptors.map((labelDescriptor) => ({
    label: labelDescriptor.label,
    descriptors: Array.from(labelDescriptor.descriptors, (d) => Array.from(d)),
  }));
  localStorage.setItem("labeledFaceDescriptors", JSON.stringify(serializedData));
  showSnackbar("Labeled data saved locally.");
  displayLabeledImages(); // Update displayed labeled images
}

// Function to load labeled data from localStorage
function loadLabeledData() {
  const storedData = localStorage.getItem("labeledFaceDescriptors");
  if (storedData) {
    const parsedData = JSON.parse(storedData);
    labeledFaceDescriptors = parsedData.map(
      (labelDescriptor) =>
        new faceapi.LabeledFaceDescriptors(
          labelDescriptor.label,
          labelDescriptor.descriptors.map((d) => new Float32Array(d))
        )
    );
    showSnackbar("Labeled data loaded successfully.");
    displayLabeledImages();
  } else {
    showSnackbar("No labeled data found. Add new labeled images.");
  }
}

// Function to clear all stored labeled data
clearDataButton.addEventListener("click", () => {
  localStorage.removeItem("labeledFaceDescriptors");
  labeledFaceDescriptors = [];
  labeledImagesContainer.innerHTML = "";
  showSnackbar("All labeled data has been cleared.");
});

// Function to display labeled images
function displayLabeledImages() {
  labeledImagesContainer.innerHTML = "";
  const storedData = localStorage.getItem("labeledFaceDescriptors");
  if (storedData) {
    const parsedData = JSON.parse(storedData);
    parsedData.forEach((labelDescriptor) => {
      const labelDiv = document.createElement("div");
      labelDiv.classList.add("labeled-item");
      labelDiv.textContent = `Label: ${labelDescriptor.label}`;
      labeledImagesContainer.appendChild(labelDiv);
    });
  } else {
    labeledImagesContainer.innerHTML = "<p>No labeled images found.</p>";
  }
}

// Function to add labeled images
async function addLabeledImage(file, label) {
  try {
    const image = await faceapi.bufferToImage(file);
    const detections = await faceapi
      .detectSingleFace(image)
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      throw new Error("No face detected in the image.");
    }

    const descriptor = detections.descriptor;

    // Check if the label already exists
    const existingLabel = labeledFaceDescriptors.find((l) => l.label === label);

    if (existingLabel) {
      existingLabel.descriptors.push(descriptor);
    } else {
      labeledFaceDescriptors.push(
        new faceapi.LabeledFaceDescriptors(label, [descriptor])
      );
    }

    saveLabeledData(); // Save updated data locally
    showSnackbar(`Labeled image added for: ${label}`);
  } catch (err) {
    console.error(err);
    showSnackbar(`Error adding labeled image: ${err.message}`);
  }
}

// Add labeled image on button click
addLabeledImageButton.addEventListener("click", async () => {
  if (trainingImage.files.length === 0 || !nameInput.value.trim()) {
    showSnackbar("Please provide both a training image and a name.");
    return;
  }

  const file = trainingImage.files[0];
  const label = nameInput.value.trim();

  await addLabeledImage(file, label);

  // Clear inputs after adding
  trainingImage.value = "";
  nameInput.value = "";
});

// Toggle labeled images visibility
showLabeledDataButton.addEventListener("click", () => {
  if (labeledImagesContainer.style.display === "none" || labeledImagesContainer.style.display === "") {
    labeledImagesContainer.style.display = "block";
    showLabeledDataButton.textContent = "Hide Stored Labeled Images";
  } else {
    labeledImagesContainer.style.display = "none";
    showLabeledDataButton.textContent = "Show Stored Labeled Images";
  }
});

// Event listener for dynamic face recognition
imageUpload.addEventListener("change", async () => {
  container.innerHTML = ""; // Clear previous results
  showSnackbar("Processing image...");

  try {
    const image = await faceapi.bufferToImage(imageUpload.files[0]);
    container.append(image);

    const canvas = faceapi.createCanvasFromMedia(image);
    container.append(canvas);

    const displaySize = { width: image.width, height: image.height };
    faceapi.matchDimensions(canvas, displaySize);

    const detections = await faceapi
      .detectAllFaces(image)
      .withFaceLandmarks()
      .withFaceDescriptors();
    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    if (labeledFaceDescriptors.length > 0) {
      // Match faces
      faceMatcher = new faceapi.FaceMatcher(labeledFaceDescriptors, 0.6);
      const results = resizedDetections.map((d) =>
        faceMatcher.findBestMatch(d.descriptor)
      );

      // Draw results
      results.forEach((result, i) => {
        const box = resizedDetections[i].detection.box;
        const drawBox = new faceapi.draw.DrawBox(box, {
          label: result.toString(),
        });
        drawBox.draw(canvas);
      });

      showSnackbar("Image processed. Results displayed.");
    } else {
      showSnackbar("No labeled data found. Please add labeled images.");
    }
  } catch (err) {
    console.error(err);
    showSnackbar("An error occurred while processing the image.");
  }
});
