document.addEventListener("DOMContentLoaded", async () => {
    if (!requireAdmin()) return;

    const id = new URLSearchParams(location.search).get("id");
    const cancelButton = document.querySelector("#cancel-take-button");
    const editFileModeButton = document.querySelector("#edit-file-mode-button");
    const editCameraModeButton = document.querySelector("#edit-camera-mode-button");
    const editFileModeContainer = document.querySelector("#edit-file-mode-container");
    const editCameraContainer = document.querySelector("#edit-camera-container");
    const editCameraVideo = document.querySelector("#edit-camera-video");
    const editCameraCanvas = document.querySelector("#edit-camera-canvas");
    const editTakePictureButton = document.querySelector("#edit-take-picture-button");
    const editCloseCameraButton = document.querySelector("#edit-close-camera-button");
    const editItemImg = document.querySelector("#edit-item-img");
    const editImagePreviewContainer = document.querySelector("#edit-image-preview-container");
    const editImagePreview = document.querySelector("#edit-image-preview");
    const editSelectedImageName = document.querySelector("#edit-selected-image-name");
    const editRemoveImageButton = document.querySelector("#edit-remove-image-button");

    let editCameraStream = null;
    let editCameraFile = null;

    function stopEditCamera() {
        if (editCameraStream) {
            editCameraStream.getTracks().forEach(track => {
                track.stop();
            });

            editCameraStream = null;
        }

        editCameraVideo.srcObject = null;
        editCameraContainer.hidden = true;
    }

    function showEditImagePreview(file) {
        if (!file) return;

        const imageUrl = URL.createObjectURL(file);

        editImagePreview.src = imageUrl;
        editSelectedImageName.textContent = file.name;
        editImagePreviewContainer.hidden = false;
    }

    editFileModeButton?.addEventListener("click", () => {
        stopEditCamera();

        editCameraFile = null;
        editItemImg.value = "";

        editImagePreview.src = "";
        editImagePreviewContainer.hidden = true;
        editSelectedImageName.textContent = "";
        editRemoveImageButton.hidden = true;

        editFileModeContainer.hidden = false;

        editFileModeButton.classList.add("active");
        editCameraModeButton.classList.remove("active");
    });

    editCameraModeButton?.addEventListener("click", async () => {
        editCameraFile = null;
        editItemImg.value = "";

        editImagePreview.src = "";
        editImagePreviewContainer.hidden = true;
        editSelectedImageName.textContent = "";
        editRemoveImageButton.hidden = true;

        editFileModeContainer.hidden = true;
        editCameraContainer.hidden = false;

        editFileModeButton.classList.remove("active");
        editCameraModeButton.classList.add("active");

        try {
            editCameraStream =
                await navigator.mediaDevices.getUserMedia({
                    video: {
                        facingMode: "environment"
                    },
                    audio: false
                });

            editCameraVideo.srcObject = editCameraStream;

        } catch (error) {
            console.error("카메라 접근 실패:", error);

            editFileModeContainer.hidden = false;
            editCameraContainer.hidden = true;

            editFileModeButton.classList.add("active");
            editCameraModeButton.classList.remove("active");

            alert("카메라에 접근할 수 없습니다.");
        }
    });

    editTakePictureButton?.addEventListener("click", () => {
        if (!editCameraStream) {
            return;
        }

        editCameraCanvas.width = editCameraVideo.videoWidth;
        editCameraCanvas.height = editCameraVideo.videoHeight;

        const context =
            editCameraCanvas.getContext("2d");

        context.drawImage(
            editCameraVideo,
            0,
            0,
            editCameraCanvas.width,
            editCameraCanvas.height
        );

        editCameraCanvas.toBlob(blob => {
            if (!blob) return;

            editCameraFile = new File(
                [blob],
                `camera-${Date.now()}.jpg`,
                {
                    type: "image/jpeg"
                }
            );

            showEditImagePreview(editCameraFile);

            editRemoveImageButton.hidden = false;

            stopEditCamera();
        }, "image/jpeg");
    });

    editCloseCameraButton?.addEventListener("click", () => {
        stopEditCamera();

        editFileModeContainer.hidden = false;
        editCameraContainer.hidden = true;

        editFileModeButton.classList.add("active");
        editCameraModeButton.classList.remove("active");
    });

    editItemImg?.addEventListener("change", () => {
        if (editItemImg.files.length > 0) {
            const file = editItemImg.files[0];

            editCameraFile = null;

            showEditImagePreview(file);

            editRemoveImageButton.hidden = false;
        }
    });

    cancelButton?.addEventListener("click", async () => {
        if (!confirm("이 분실물의 수령을 취소하시겠습니까?")) {
            return;
        }

        try {
            await apiFetch(`/items/cancel-take/${id}`, {
                method: "PATCH"
            });

            location.href = "/admin/index.html";
        } catch (error) {
            showError(error);
        }
    });

    if (!id) {
        return showError(new Error("분실물 번호가 없습니다."));
    }

    try {
        const item = await apiFetch(`/items/${id}`);

        let originalImageUrl = item.itemImg;

        editRemoveImageButton?.addEventListener("click", () => {
            editItemImg.value = "";
            editCameraFile = null;

            if (originalImageUrl) {
                editImagePreview.src = getImageUrl(originalImageUrl);
                editImagePreview.alt = item.itemName ?? "분실물 사진";

                editImagePreviewContainer.hidden = false;
                editSelectedImageName.textContent = "현재 등록된 사진";
            } else {
                editImagePreview.src = "";
                editImagePreviewContainer.hidden = true;
                editSelectedImageName.textContent = "";
            }

            editRemoveImageButton.hidden = true;
        });

        setText("#item-name", item.itemName);
        setText("#item-detail-text", item.itemDetail);
        setText("#item-place", item.itemPlace);
        setText("#item-sign-up-at", formatDate(item.signUpAt));
        setText("#item-take-at", formatDate(item.takeAt));

        setText(
            "#item-student",
            item.student
                ? `${item.student.studentNumber} ${item.student.studentName}`
                : "-"
        );

        setImage("#item-image", item.itemImg, item.itemName);

        if (item.takeAt) {
            cancelButton.hidden = false;
        }

        document
            .querySelector("#delete-item-button")
            ?.addEventListener("click", async () => {
                if (!confirm("이 분실물을 삭제하시겠습니까?")) {
                    return;
                }

                try {
                    await apiFetch(`/items/${id}`, {
                        method: "DELETE"
                    });

                    location.href = "/admin/index.html";
                } catch (error) {
                    showError(error);
                }
            });

        const editButton =
            document.querySelector("#edit-item-button");

        const editSection =
            document.querySelector("#edit-item-section");

        editButton?.addEventListener("click", () => {
            editSection.hidden = false;

            document.querySelector("#edit-item-name").value =
                item.itemName ?? "";

            document.querySelector("#edit-item-detail").value =
                item.itemDetail ?? "";

            document.querySelector("#edit-item-place").value =
                item.itemPlace ?? "";

            if (item.itemImg) {
                editImagePreview.src = getImageUrl(item.itemImg);
                editImagePreview.alt = item.itemName ?? "분실물 사진";

                editImagePreviewContainer.hidden = false;
                editSelectedImageName.textContent = "현재 등록된 사진";

                editRemoveImageButton.hidden = true;
            } else {
                editImagePreview.src = "";
                editImagePreviewContainer.hidden = true;
                editSelectedImageName.textContent = "";

                editRemoveImageButton.hidden = true;
            }
        });

        document
            .querySelector("#cancel-edit-button")
            ?.addEventListener("click", () => {
                editSection.hidden = true;
            });

        document
            .querySelector("#edit-item-form")
            ?.addEventListener("submit", async event => {
                event.preventDefault();

                const form = event.currentTarget;

                const file =
                    editCameraFile ||
                    form.querySelector('[name="itemImg"]')?.files[0];

                const request = {
                    itemName:
                        form.querySelector('[name="itemName"]')
                            ?.value.trim(),

                    itemDetail:
                        form.querySelector('[name="itemDetail"]')
                            ?.value.trim(),

                    itemPlace:
                        form.querySelector('[name="itemPlace"]')
                            ?.value.trim()
                };

                if (
                    !request.itemName ||
                    !request.itemDetail ||
                    !request.itemPlace
                ) {
                    alert(
                        "물건 이름, 상세 정보, 발견 장소를 입력하세요."
                    );
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

                if (file) {
                    formData.append("file", file);
                }

                try {
                    await apiFetch(`/items/${id}`, {
                        method: "PATCH",
                        body: formData
                    });

                    alert("수정되었습니다.");
                    location.reload();
                } catch (error) {
                    showError(error);
                }
            });
    } catch (error) {
        showError(error);
    }
});