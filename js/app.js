let video = document.getElementById('videoElement');
let canvas = document.getElementById('canvas');
let ctx = canvas.getContext('2d');

// Access the smartphone camera
if (navigator.mediaDevices.getUserMedia) {
    navigator.mediaDevices.getUserMedia({ video: true })
        .then(function (stream) {
            video.srcObject = stream;
            video.play();
            runPoseNet();
        })
        .catch(function (error) {
            console.log("Something went wrong!");
        });
}

async function runPoseNet() {
    // Load the PoseNet model
    const net = await posenet.load();

    video.addEventListener('loadeddata', async () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        // Detect poses in real-time
        setInterval(() => {
            detectPose(net);
        }, 100);
    });
}

async function detectPose(net) {
    const pose = await net.estimateSinglePose(video, {
        flipHorizontal: false
    });

    drawPose(pose);
}

function drawPose(pose) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    // Draw keypoints and skeleton
    if (pose.score >= 0.1) {
        for (let i = 0; i < pose.keypoints.length; i++) {
            const keypoint = pose.keypoints[i];

            if (keypoint.score >= 0.2) {
                ctx.beginPath();
                ctx.arc(keypoint.position.x, keypoint.position.y, 5, 0, 2 * Math.PI);
                ctx.fillStyle = 'red';
                ctx.fill();
            }
        }
    }
}
