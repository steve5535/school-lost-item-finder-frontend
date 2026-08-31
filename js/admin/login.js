document.addEventListener("DOMContentLoaded", () => {
    const form = document.querySelector("#admin-login-form");
    if (!form) return;

    form.addEventListener("submit", async event => {
        event.preventDefault();

        const userName = form.querySelector('[name="userName"]')?.value.trim();
        const password = form.querySelector('[name="password"]')?.value;

        if (!userName || !password) {
            alert("아이디와 비밀번호를 입력하세요.");
            return;
        }

        try {
            await apiFetch("/login", {
                method: "POST",
                body: JSON.stringify({ userName, password })
            });

            redirectAfterLogin();
        } catch (error) {
            showError(error);
        }
    });
});
