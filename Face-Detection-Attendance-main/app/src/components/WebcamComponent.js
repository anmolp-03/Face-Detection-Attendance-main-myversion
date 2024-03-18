import React, { useRef, useEffect } from 'react';
import Webcam from 'webcam-easy';

function WebcamComponent({ onClose }) {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const webcamRef = useRef(null); // Reference for the Webcam instance

    useEffect(() => {
        accessWebcam();
        return () => {
            if (webcamRef.current) {
                webcamRef.current.stop();
            }
        };
    }, []);

    const accessWebcam = () => {
        const webcam = new Webcam(videoRef.current, 'user', canvasRef.current);
        webcamRef.current = webcam; // Save the Webcam instance reference
        webcam.start()
            .then(() => console.log('Webcam started'))
            .catch(error => console.error('Error starting webcam:', error));
    };

    const capturePhoto = () => {
        const video = videoRef.current;
        if (video) {
            video.pause();

            const canvas = document.createElement('canvas');
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            context.drawImage(video, 0, 0, canvas.width, canvas.height);

            const imageData = canvas.toDataURL('image/jpeg');

            fetch('http://localhost:3000/upload-photo', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ knownImage: imageData })
            })
                .then(response => response.json())
                .then(data => {
                    console.log('Response from server:', data);
                    // Handle response as needed
                })
                .catch(error => {
                    console.error('Error sending photo to server:', error);
                    // Handle error as needed
                })
                .finally(() => {
                    if (video) {
                        video.play(); // Resume video playback after capturing photo
                    }
                });
        }
    };
    const handleClose = () => {
        onClose();
        if (webcamRef.current) {
            webcamRef.current.stop();
        }
    };
    return (
        <div className="webcam-overlay">
            <div className="webcam-container">
                <button className="close-button" onClick={handleClose}>Close</button>
                <video ref={videoRef} />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <button onClick={capturePhoto}>Capture Photo</button>
            </div>
        </div>
    );
}

export default WebcamComponent;
