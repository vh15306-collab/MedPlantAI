// ===============================
// MEDPLANT AI - SCREEN CONTROL
// ===============================

function showScreen(screenId) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(function(screen) {
        screen.classList.remove("active");
    });

    const selectedScreen = document.getElementById(screenId);

    if (selectedScreen) {
        selectedScreen.classList.add("active");
    }

    window.scrollTo(0, 0);
}


// ===============================
// IMAGE ELEMENTS
// ===============================

const imageInput = document.getElementById("image-input");
const previewImage = document.getElementById("preview-image");
const resultImage = document.getElementById("result-image");


// ===============================
// IMAGE UPLOAD
// ===============================

imageInput.addEventListener("change", function() {

    const file = imageInput.files[0];

    if (!file) {
        return;
    }

    if (!file.type.startsWith("image/")) {

        alert("Please select an image.");

        return;
    }

    const imageURL = URL.createObjectURL(file);

    previewImage.src = imageURL;

    showScreen("preview");
});


// ===============================
// CAMERA VARIABLES
// ===============================

let cameraStream = null;
let cameraVideo = null;
let cameraButton = null;
let minimizeButton = null;
let cancelButton = null;


// ===============================
// OPEN CAMERA
// ===============================

async function openCamera() {
    stopCamera();

    try {

        // Request rear camera
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: {
                    ideal: "environment"
                }
            },
            audio: false
        });


        // ===============================
        // CREATE CAMERA VIDEO
        // ===============================

        cameraVideo = document.createElement("video");

        cameraVideo.autoplay = true;
        cameraVideo.playsInline = true;

        cameraVideo.srcObject = cameraStream;

        cameraVideo.style.width = "100%";
        cameraVideo.style.maxWidth = "500px";
        cameraVideo.style.height = "350px";
        cameraVideo.style.objectFit = "cover";
        cameraVideo.style.borderRadius = "20px";
        cameraVideo.style.marginTop = "20px";
        cameraVideo.style.display = "block";
        cameraVideo.style.marginLeft = "auto";
        cameraVideo.style.marginRight = "auto";

        // Keep camera image normal
        cameraVideo.style.transform = "none";


        // ===============================
        // CAPTURE BUTTON
        // ===============================

        cameraButton = document.createElement("button");

        cameraButton.className = "primary-btn";

        cameraButton.textContent =
            "📸 Capture Plant";

        cameraButton.style.display = "block";
        cameraButton.style.margin = "20px auto 10px";


        // ===============================
        // MINIMIZE BUTTON
        // ===============================

        minimizeButton = document.createElement("button");

        minimizeButton.className = "secondary-btn";

        minimizeButton.textContent =
            "➖ Minimize Camera";

        minimizeButton.style.display = "inline-block";
        minimizeButton.style.margin = "5px";


        // ===============================
        // CANCEL BUTTON
        // ===============================

        cancelButton = document.createElement("button");

        cancelButton.className = "secondary-btn";

        cancelButton.textContent =
            "✖ Cancel Camera";

        cancelButton.style.display = "inline-block";
        cancelButton.style.margin = "5px";


        // ===============================
        // GET UPLOAD CARD
        // ===============================

        const uploadCard =
            document.querySelector(".upload-card");


        // ===============================
        // ADD CAMERA ELEMENTS
        // ===============================

        uploadCard.appendChild(cameraVideo);

        uploadCard.appendChild(cameraButton);

        uploadCard.appendChild(minimizeButton);

        uploadCard.appendChild(cancelButton);


        // ===============================
        // BUTTON EVENTS
        // ===============================

        cameraButton.addEventListener(
            "click",
            captureCameraImage
        );

        minimizeButton.addEventListener(
            "click",
            toggleCamera
        );

        cancelButton.addEventListener(
            "click",
            cancelCamera
        );


    } catch (error) {

        console.error(
            "Camera error:",
            error
        );

        alert(
            "Camera could not be opened.\n\n" +
            "Please allow camera permission in your browser."
        );
    }
}


// ===============================
// MINIMIZE / RESTORE CAMERA
// ===============================

function toggleCamera() {

    if (!cameraVideo || !minimizeButton) {
        return;
    }


    if (cameraVideo.style.display === "none") {

        // Restore camera

        cameraVideo.style.display = "block";

        minimizeButton.textContent =
            "➖ Minimize Camera";

    } else {

        // Minimize camera

        cameraVideo.style.display = "none";

        minimizeButton.textContent =
            "➕ Restore Camera";
    }
}


// ===============================
// CANCEL CAMERA
// ===============================

function cancelCamera() {

    // Stop camera
    stopCamera();

    // Make sure no old image is selected
    imageInput.value = "";

    // Return to normal capture screen
    showScreen("capture");
}


// ===============================
// CAPTURE CAMERA IMAGE
// ===============================

function captureCameraImage() {

    if (!cameraVideo || !cameraStream) {
        return;
    }


    // ===============================
    // CREATE CANVAS
    // ===============================

    const canvas =
        document.createElement("canvas");

    canvas.width =
        cameraVideo.videoWidth;

    canvas.height =
        cameraVideo.videoHeight;


    const context =
        canvas.getContext("2d");


    // ===============================
    // CAPTURE NORMAL ORIENTATION
    // ===============================

    context.drawImage(
        cameraVideo,
        0,
        0,
        canvas.width,
        canvas.height
    );


    // ===============================
    // SHOW CAPTURED IMAGE
    // ===============================

    previewImage.src =
        canvas.toDataURL("image/jpeg");


    // ===============================
    // CONVERT TO FILE
    // ===============================

    canvas.toBlob(function(blob) {

        const file = new File(
            [blob],
            "camera-plant.jpg",
            {
                type: "image/jpeg"
            }
        );


        // Put camera image into file input

        const dataTransfer =
            new DataTransfer();

        dataTransfer.items.add(file);

        imageInput.files =
            dataTransfer.files;


        // Stop camera

        stopCamera();


        // Go to preview

        showScreen("preview");

    }, "image/jpeg");
}


// ===============================
// STOP CAMERA
// ===============================

function stopCamera() {

    // Stop camera stream

    if (cameraStream) {

        cameraStream
            .getTracks()
            .forEach(function(track) {

                track.stop();

            });

        cameraStream = null;
    }


    // Remove video

    if (cameraVideo) {

        cameraVideo.remove();

        cameraVideo = null;
    }


    // Remove capture button

    if (cameraButton) {

        cameraButton.remove();

        cameraButton = null;
    }


    // Remove minimize button

    if (minimizeButton) {

        minimizeButton.remove();

        minimizeButton = null;
    }


    // Remove cancel button

    if (cancelButton) {

        cancelButton.remove();

        cancelButton = null;
    }
}


// ===============================
// ANALYZE PLANT USING REAL AI
// ===============================

async function analyzePlant() {

    const file =
        imageInput.files[0];


    if (!file) {

        alert(
            "Please select a plant image first."
        );

        showScreen("capture");

        return;
    }


    showScreen("analyzing");


    try {

        const formData =
            new FormData();

        formData.append(
            "image",
            file
        );


        const response =
    await fetch(
        "https://10.195.89.120:5000/predict",
        {
            method: "POST",
            body: formData
        }
    );
        if (!response.ok) {

            throw new Error(
                "AI server returned an error: " +
                response.status
            );
        }


        const data =
            await response.json();


        console.log(
            "AI RESULT:",
            data
        );


        showRealResult(
            data.plant,
            data.confidence
        );


    } catch (error) {

        console.error(
            "AI ERROR:",
            error
        );


        alert(
            "Could not connect to the AI server.\n\n" +
            "Make sure app.py is running on port 5000."
        );


        showScreen("preview");
    }
}


// ===============================
// SHOW REAL AI RESULT
// ===============================

// ===============================
// SHOW REAL AI RESULT
// ===============================

// ===============================
// SHOW REAL AI RESULT
// ===============================

// ===============================
// SHOW REAL AI RESULT
// ===============================

// ===============================
// SHOW REAL AI RESULT
// ===============================

async function showRealResult(plantName, confidence) {

    console.log("PLANT FROM AI:", plantName);


    // ===============================
    // LOAD PLANT DATABASE
    // ===============================

    let plantData;

    try {

        const response =
            await fetch("plant_data.json");

        plantData =
            await response.json();

    } catch (error) {

        console.error(
            "Could not load plant_data.json:",
            error
        );

        alert(
            "Could not load plant information."
        );

        return;
    }


    // ===============================
    // FIND PLANT
    // ===============================

    const cleanPlantName =
        plantName.trim();

    const data =
        plantData[cleanPlantName];


    // ===============================
    // CHECK PLANT DATA
    // ===============================

    if (!data) {

        console.log(
            "No information found for:",
            cleanPlantName
        );

        alert(
            "Plant detected, but information is not available yet."
        );

        return;
    }


    // ===============================
    // CONFIDENCE
    // ===============================

    const confidencePercent =
        Math.round(
            confidence * 100
        );

        // Confidence status
let confidenceStatus = "";

if (confidencePercent >= 80) {
    confidenceStatus = "🟢 High Confidence";
} else if (confidencePercent >= 60) {
    confidenceStatus = "🟡 Moderate Confidence";
} else {
    confidenceStatus = "🔴 Low Confidence";

    alert(
        "⚠️ Low confidence result.\n\nPlease capture a clearer image of the plant leaf and try again."
    );
}

console.log(
    "CONFIDENCE STATUS:",
    confidenceStatus
);
const confidenceStatusElement =
    document.getElementById("confidence-status");

confidenceStatusElement.textContent =
    confidenceStatus;


    // ===============================
    // RESULT SCREEN
    // ===============================

    resultImage.src =
        previewImage.src;

    document.getElementById(
        "plant-name"
    ).textContent =
        cleanPlantName;

    document.getElementById(
        "scientific-name"
    ).textContent =
        data.scientific;

    document.getElementById(
        "confidence"
    ).textContent =
        confidencePercent + "%";

    document.getElementById(
        "confidence-fill"
    ).style.width =
        confidencePercent + "%";


    // ===============================
    // DETAILS SCREEN
    // ===============================

    document.getElementById(
        "details-image"
    ).src =
        previewImage.src;

    document.getElementById(
        "details-name"
    ).textContent =
        cleanPlantName;

    document.getElementById(
        "details-scientific"
    ).textContent =
        data.scientific;

    document.getElementById(
        "medicinal-uses"
    ).textContent =
        data.uses;

    document.getElementById(
        "plant-description"
    ).textContent =
        data.description;

        document.getElementById(
    "plant-overview"
).textContent =
    data.description;


    // ===============================
    // SHOW RESULT
    // ===============================

    showScreen("result");
}
// ===============================
// SCAN ANOTHER PLANT
// ===============================

function startAgain() {

    stopCamera();

    imageInput.value = "";

    previewImage.src = "";
    resultImage.src = "";

    showScreen("capture");
}
// ===============================
// PLANT EXPLORER
// ===============================

async function loadPlantExplorer() {

    const plantGrid =
        document.getElementById("plant-grid");

    try {

        const response =
            await fetch("plant_data.json");

        const plantData =
            await response.json();

        const imageResponse =
            await fetch("plant_images.json");

        const plantImages =
            await imageResponse.json();

        plantGrid.innerHTML = "";

        Object.keys(plantData).forEach(function(plantName) {

            const data =
                plantData[plantName];

            const imagePath =
                plantImages[plantName];

            const card =
                document.createElement("div");

            card.className =
                "plant-explorer-card";

            card.innerHTML = `
                <img
                    class="plant-card-image"
                    src="${imagePath}"
                    alt="${plantName}"
                >

                <h3>${plantName}</h3>

                <p>
                    ${data.scientific}
                </p>

                <button
                    class="secondary-btn"
                    onclick="viewExplorerPlant('${plantName.replace(/'/g, "\\'")}' )"
                >
                    View Details
                </button>
            `;

            plantGrid.appendChild(card);

        });

    } catch (error) {

        console.error(
            "Could not load plant explorer:",
            error
        );

        plantGrid.innerHTML =
            "<p>Could not load plant information.</p>";
    }
}



// ===============================
// SEARCH PLANTS
// ===============================

function searchPlants() {

    const searchInput =
        document.getElementById("plant-search");

    const searchText =
        searchInput.value.toLowerCase();

    const cards =
        document.querySelectorAll(
            ".plant-explorer-card"
        );

    cards.forEach(function(card) {

        const plantName =
            card.querySelector("h3")
                .textContent
                .toLowerCase();

        if (plantName.includes(searchText)) {

            card.style.display = "";

        } else {

            card.style.display = "none";

        }

    });
}


// ===============================
// OPEN EXPLORER PLANT DETAILS
// ===============================

async function viewExplorerPlant(plantName) {

    const response =
        await fetch("plant_data.json");

    const plantData =
        await response.json();

    const data =
        plantData[plantName];

    if (!data) {
        return;
    }

    document.getElementById(
        "details-name"
    ).textContent =
        plantName;

    document.getElementById(
        "details-scientific"
    ).textContent =
        data.scientific;

    document.getElementById(
        "medicinal-uses"
    ).textContent =
        data.uses;

    document.getElementById(
        "plant-description"
    ).textContent =
        data.description;

    document.getElementById(
        "plant-overview"
    ).textContent =
        data.description;

    document.getElementById(
        "details-image"
    ).style.display =
        "none";

    showScreen("details");
}


// ===============================
// START PLANT EXPLORER
// ===============================

document.addEventListener(
    "DOMContentLoaded",
    function() {

        loadPlantExplorer();

        const searchInput =
            document.getElementById(
                "plant-search"
            );

        if (searchInput) {

            searchInput.addEventListener(
                "input",
                searchPlants
            );

        }

    }
);

console.log("🌿 PLANT EXPLORER SCRIPT LOADED");