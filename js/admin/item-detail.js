document.addEventListener("DOMContentLoaded", async () => {
    if (!requireAdmin()) return;

    const id = new URLSearchParams(location.search).get("id");
    const cancelButton = document.querySelector("#cancel-take-button");

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