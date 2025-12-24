const LOGO_URL = "https://upload.wikimedia.org/wikipedia/commons/thumb/9/91/Lidl-Logo.svg/1024px-Lidl-Logo.svg.png";
    const HASHTAGS = "I love shopping at #LIDL";
    const SHARE_URL = "https://www.lidl.com"; 

    const video = document.getElementById('webcam');
    const canvas = document.getElementById('canvas');
    const finalImage = document.getElementById('final-image');
    const btnCapture = document.getElementById('btn-capture');
    const btnRetake = document.getElementById('btn-retake');
    const btnDownload = document.getElementById('btn-download');
    const captureControls = document.getElementById('capture-controls');
    const shareControls = document.getElementById('share-controls');

    // Preload Logo
    const logoImg = new Image();
    logoImg.crossOrigin = "Anonymous"; 
    logoImg.src = LOGO_URL;

    // --- 1. Camera Initialization ---
    async function startCamera() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { 
                    facingMode: 'user',
                    width: { ideal: 1080 },
                    height: { ideal: 1080 } 
                },
                audio: false
            });
            video.srcObject = stream;
        } catch (err) {
            console.error(err);
            alert("Camera access required. Please allow permissions.");
        }
    }

    // --- 2. Taking the Square Picture ---
    btnCapture.addEventListener('click', () => {
        const context = canvas.getContext('2d');
        
        // 1. Determine Crop Dimensions
        // We need to cut a square out of the center of the video feed
        const videoW = video.videoWidth;
        const videoH = video.videoHeight;
        
        // The size of our square will be the smaller of the two dimensions
        const size = Math.min(videoW, videoH);
        
        // Calculate the starting X and Y to grab the center
        const startX = (videoW - size) / 2;
        const startY = (videoH - size) / 2;

        // 2. Set Canvas to Square
        canvas.width = size;
        canvas.height = size;

        // 3. Mirroring Setup
        // Move context to the right edge
        context.translate(size, 0);
        // Flip horizontal
        context.scale(-1, 1);

        // 4. Draw the Cropped Video
        // drawImage(image, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight)
        context.drawImage(video, startX, startY, size, size, 0, 0, size, size);
        
        // Reset transform so the logo isn't flipped or moved
        context.setTransform(1, 0, 0, 1, 0, 0); 

        // --- Watermark Logic (Fixed Position) ---
        if(logoImg.complete && logoImg.naturalWidth !== 0) {
            
            // Set size: 25% of the square size
            const logoWidth = size * 0.25; 
            const logoHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * logoWidth;
            
            // Fixed Pixel Padding (Ensures it's not too far left)
            const padding = 30; 

            // Calculate Position (Bottom Right)
            const xPos = size - logoWidth - padding;
            const yPos = size - logoHeight - padding;

            context.drawImage(logoImg, xPos, yPos, logoWidth, logoHeight);
        }

        // Show Result
        try {
            const dataUrl = canvas.toDataURL('image/png');
            finalImage.src = dataUrl;
            
            // Toggle UI
            video.classList.add('hidden');
            finalImage.classList.remove('hidden');
            captureControls.classList.add('hidden');
            shareControls.classList.remove('hidden');
        } catch (e) {
            console.error(e);
            alert("Error processing image.");
        }
    });

    btnRetake.addEventListener('click', () => {
        finalImage.classList.add('hidden');
        video.classList.remove('hidden');
        shareControls.classList.add('hidden');
        captureControls.classList.remove('hidden');
    });

    btnDownload.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'LIDL-Selfie.png';
        link.href = finalImage.src;
        link.click();
    });

    window.shareSocial = (platform) => {
        const text = encodeURIComponent(HASHTAGS);
        const url = encodeURIComponent(SHARE_URL);
        
        let shareLink = "";

        switch(platform) {
            case 'fb':
                shareLink = `https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`;
                break;
            case 'tw':
                shareLink = `https://twitter.com/intent/tweet?text=${text}&url=${url}`;
                break;
            case 'ig':
                navigator.clipboard.writeText(HASHTAGS + " " + SHARE_URL).then(() => {
                    alert("Caption copied! Opening Instagram...");
                    window.location.href = "https://instagram.com";
                });
                return; 
        }

        if(shareLink) {
            window.open(shareLink, '_blank', 'width=600,height=400');
        }
    }

    window.addEventListener('load', startCamera);