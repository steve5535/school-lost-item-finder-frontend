document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#temporary-item-register-form");
    if (!form) return;

    const fileModeButton = document.querySelector("#file-mode-button");
    const cameraModeButton = document.querySelector("#camera-mode-button");
    const fileModeContainer = document.querySelector("#file-mode-container");
    const cameraContainer = document.querySelector("#camera-container");
    const cameraVideo = document.querySelector("#camera-video");
    const takePictureButton = document.querySelector("#take-picture-button");
    const closeCameraButton = document.querySelector("#close-camera-button");
    const cameraCanvas = document.querySelector("#camera-canvas");
    const selectedImageName = document.querySelector("#selected-image-name");
    const itemImg = document.querySelector("#item-img");
    const cancelFileButton = document.querySelector("#cancel-file-button");
    const imagePreviewContainer = document.querySelector("#image-preview-container");
    const imagePreview = document.querySelector("#image-preview");
    const removeImageButton = document.querySelector("#remove-image-button");

    let cameraStream = null;
    let cameraFile = null;

    fileModeContainer.hidden = false;
    cameraContainer.hidden = true;

    fileModeButton?.classList.add("active");
    cameraModeButton?.classList.remove("active");

    fileModeButton?.addEventListener("click", () => {
        stopCamera();

        fileModeContainer.hidden = false;
        cameraContainer.hidden = true;

        fileModeButton.classList.add("active");
        cameraModeButton.classList.remove("active");
    });

    itemImg?.addEventListener("change", () => {
        if (itemImg.files.length > 0) {
            const file = itemImg.files[0];

            cameraFile = null;
            cancelFileButton.hidden = false;

            showImagePreview(file);
        }
    });

    cancelFileButton?.addEventListener("click", () => {
        itemImg.value = "";
        cancelFileButton.hidden = true;
    });

    removeImageButton?.addEventListener("click", () => {
        itemImg.value = "";
        cameraFile = null;

        imagePreview.src = "";
        imagePreviewContainer.hidden = true;
        selectedImageName.textContent = "";

        cancelFileButton.hidden = true;
    });


    cameraModeButton?.addEventListener("click", async () => {
        fileModeContainer.hidden = true;
        cameraContainer.hidden = false;

        fileModeButton.classList.remove("active");
        cameraModeButton.classList.add("active");

        try {
            cameraStream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: "environment"
                },
                audio: false
            });

            cameraVideo.srcObject = cameraStream;

        } catch (error) {
            console.error("카메라 접근 실패:", error);

            fileModeContainer.hidden = false;
            cameraContainer.hidden = true;

            fileModeButton.classList.add("active");
            cameraModeButton.classList.remove("active");

            alert("카메라에 접근할 수 없습니다.");
        }
    });

    takePictureButton?.addEventListener("click", () => {
        const width = cameraVideo.videoWidth;
        const height = cameraVideo.videoHeight;

        if (!width || !height) {
            alert("카메라가 아직 준비되지 않았습니다.");
            return;
        }

        cameraCanvas.width = width;
        cameraCanvas.height = height;

        const context = cameraCanvas.getContext("2d");

        context.drawImage(
            cameraVideo,
            0,
            0,
            width,
            height
        );

        cameraCanvas.toBlob(blob => {
            if (!blob) {
                alert("사진을 만들 수 없습니다.");
                return;
            }

            cameraFile = new File(
                [blob],
                `camera-${Date.now()}.jpg`,
                {
                    type: "image/jpeg"
                }
            );

            showImagePreview(cameraFile);

            stopCamera();
        }, "image/jpeg", 0.9);
    });

    function showImagePreview(file) {
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);

        imagePreview.src = imageUrl;
        imagePreviewContainer.hidden = false;
        selectedImageName.textContent = file.name;
    }

    function stopCamera() {
        if (cameraStream) {
            cameraStream.getTracks().forEach(track => {
                track.stop();
            });

            cameraStream = null;
        }

        cameraVideo.srcObject = null;
        cameraContainer.hidden = true;
    }

    closeCameraButton?.addEventListener("click", () => {
        stopCamera();

        fileModeContainer.hidden = false;
        cameraContainer.hidden = true;

        fileModeButton.classList.add("active");
        cameraModeButton.classList.remove("active");
    });

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const selectedFile =
            cameraFile || form.querySelector('[name="itemImg"]')?.files[0];

        const request = {
            itemName: form.querySelector('[name="itemName"]')?.value.trim(),
            itemDetail: form.querySelector('[name="itemDetail"]')?.value.trim(),
            itemPlace: form.querySelector('[name="itemPlace"]')?.value.trim(),
            isAccept: null
        };

        if (!request.itemName || !request.itemDetail || !request.itemPlace) {
            alert("물건 이름, 상세 정보, 발견 장소를 입력하세요.");
            return;
        }

        const formData = new FormData();

        formData.append(
            "request",
            new Blob(
                [JSON.stringify(request)],
                {
                    type: "application/json"
                }
            )
        );

        if (selectedFile) {
            formData.append("file", selectedFile);
        }

        try {
            await apiFetch("/temporary-item", {
                method: "POST",
                body: formData
            });

            alert("분실물이 등록되었습니다.");
            location.href = "/index.html";
        } catch (error) {
            showError(error);
        }
    });
});