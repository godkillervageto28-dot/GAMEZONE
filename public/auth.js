/* =========================================================
   GAMEZONE - AUTHENTICATION CLIENT SYSTEM (FIXED & RECOVERED)
========================================================= */

const GameZoneAuth = {
    token: localStorage.getItem("gamezone_token") || null,
    user: JSON.parse(localStorage.getItem("gamezone_user") || "null"),

    async init() {
        this.injectAuthModal();
        this.injectToastContainer();

        if (this.token) {
            try {
                const response = await fetch("/api/auth/me", {
                    method: "GET",
                    headers: {
                        "Authorization": `Bearer ${this.token}`,
                        "Accept": "application/json"
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    if (data.success && data.user) {
                        this.user = data.user;
                        localStorage.setItem("gamezone_user", JSON.stringify(this.user));
                    }
                } else {
                    this.clearSession();
                }
            } catch (error) {
                console.warn("Auth check error:", error);
            }
        }

        this.updateNavbarAuthUI();
        this.bindEvents();
    },

    clearSession() {
        this.token = null;
        this.user = null;
        localStorage.removeItem("gamezone_token");
        localStorage.removeItem("gamezone_user");
        this.updateNavbarAuthUI();
    },

    async login(login, password) {
        try {
            const response = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login, password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to sign in");
            }

            this.token = data.token;
            this.user = data.user;
            localStorage.setItem("gamezone_token", this.token);
            localStorage.setItem("gamezone_user", JSON.stringify(this.user));

            this.updateNavbarAuthUI();
            this.closeModal();
            this.showToast(data.message || `Welcome back, ${this.user.username}!`, "success");

            return data;
        } catch (error) {
            this.showToast(error.message, "error");
            throw error;
        }
    },

    async register(username, email, password, avatar) {
        try {
            const response = await fetch("/api/auth/register", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ username, email, password, avatar })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to create account");
            }

            this.token = data.token;
            this.user = data.user;
            localStorage.setItem("gamezone_token", this.token);
            localStorage.setItem("gamezone_user", JSON.stringify(this.user));

            this.updateNavbarAuthUI();
            this.closeModal();
            this.showToast(data.message || "Account created successfully!", "success");

            return data;
        } catch (error) {
            this.showToast(error.message, "error");
            throw error;
        }
    },

    async logout() {
        try {
            await fetch("/api/auth/logout", { method: "POST" });
        } catch (e) {
            // Ignore server logout errors
        }

        this.clearSession();
        this.showToast("Signed out successfully. See you gamer!", "info");
    },

    updateNavbarAuthUI() {
        const signinBtns = document.querySelectorAll(".signin-btn, .login-btn");
        const navActions = document.querySelectorAll(".nav-actions");

        if (this.user && this.token) {
            signinBtns.forEach(btn => {
                btn.style.display = "none";
            });

            navActions.forEach(container => {
                let userMenu = container.querySelector(".user-profile-menu");
                if (!userMenu) {
                    userMenu = document.createElement("div");
                    userMenu.className = "user-profile-menu";
                    container.appendChild(userMenu);
                }

                userMenu.innerHTML = `
                    <div class="user-chip">
                        <span class="user-avatar">${this.user.avatar || "🎮"}</span>
                        <span class="user-name">${this.escapeHTML(this.user.username)}</span>
                    </div>
                    <button class="logout-btn" type="button" onclick="GameZoneAuth.logout()">Sign Out</button>
                `;
            });
        } else {
            signinBtns.forEach(btn => {
                btn.style.display = "inline-flex";
            });

            document.querySelectorAll(".user-profile-menu").forEach(el => el.remove());
        }
    },

    injectAuthModal() {
        if (document.getElementById("authModalWrapper")) return;

        const modalHTML = `
            <div id="authModalWrapper" class="modal-wrapper hidden">
                <div id="authModalOverlay" class="modal-overlay"></div>
                <div class="auth-modal-card">
                    <button id="closeAuthModal" class="modal-close-btn" type="button" aria-label="Close">✕</button>

                    <div class="auth-modal-header">
                        <div class="auth-brand">🎮 GAME<span>ZONE</span></div>
                        <p class="auth-subtitle">Join millions of gamers worldwide</p>
                    </div>

                    <div class="auth-tabs">
                        <button id="tabSignin" class="auth-tab active" type="button">Sign In</button>
                        <button id="tabSignup" class="auth-tab" type="button">Create Account</button>
                    </div>

                    <form id="formSignin" class="auth-form">
                        <div class="form-group">
                            <label for="signinLogin">Username or Email</label>
                            <input type="text" id="signinLogin" placeholder="Enter username or email" required autocomplete="username">
                        </div>

                        <div class="form-group">
                            <label for="signinPassword">Password</label>
                            <input type="password" id="signinPassword" placeholder="••••••••" required autocomplete="current-password">
                        </div>

                        <button type="submit" class="auth-submit-btn">
                            <span class="btn-text">Sign In →</span>
                            <span class="btn-spinner hidden"></span>
                        </button>

                        <div class="auth-divider"><span>OR QUICK ACCESS</span></div>

                        <button type="button" id="demoSignBtn" class="auth-demo-btn">
                            🚀 Instant Demo Sign In
                        </button>
                    </form>

                    <form id="formSignup" class="auth-form hidden">
                        <div class="form-group">
                            <label for="signupUsername">Username</label>
                            <input type="text" id="signupUsername" placeholder="Choose a gamer tag" required minlength="3" maxlength="30" autocomplete="username">
                        </div>

                        <div class="form-group">
                            <label for="signupEmail">Email Address</label>
                            <input type="email" id="signupEmail" placeholder="name@example.com" required autocomplete="email">
                        </div>

                        <div class="form-group">
                            <label for="signupPassword">Password</label>
                            <input type="password" id="signupPassword" placeholder="At least 6 characters" required minlength="6" autocomplete="new-password">
                        </div>

                        <div class="form-group">
                            <label>Choose Avatar Emoji</label>
                            <div class="avatar-picker">
                                <span class="avatar-opt active" data-avatar="🎮">🎮</span>
                                <span class="avatar-opt" data-avatar="👾">👾</span>
                                <span class="avatar-opt" data-avatar="⚡">⚡</span>
                                <span class="avatar-opt" data-avatar="🚀">🚀</span>
                                <span class="avatar-opt" data-avatar="🛡️">🛡️</span>
                                <span class="avatar-opt" data-avatar="⚔️">⚔️</span>
                                <span class="avatar-opt" data-avatar="🏆">🏆</span>
                                <span class="avatar-opt" data-avatar="🔥">🔥</span>
                            </div>
                        </div>

                        <button type="submit" class="auth-submit-btn">
                            <span class="btn-text">Create Account →</span>
                            <span class="btn-spinner hidden"></span>
                        </button>
                    </form>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML("beforeend", modalHTML);
    },

    injectToastContainer() {
        if (document.getElementById("toastContainer")) return;
        const toastHTML = `<div id="toastContainer" class="toast-container"></div>`;
        document.body.insertAdjacentHTML("beforeend", toastHTML);
    },

    bindEvents() {
        document.addEventListener("click", (e) => {
            const searchBtn = e.target.closest("#navSearchButton, .nav-search-btn");
            if (searchBtn) {
                e.preventDefault();
                const searchInput = document.getElementById("searchInput");
                if (searchInput) {
                    searchInput.focus();
                    window.scrollTo({ top: document.querySelector(".hero, .games-hero")?.offsetTop || 0, behavior: "smooth" });
                } else {
                    window.location.href = "games.html?search=true";
                }
                return;
            }

            const btn = e.target.closest(".signin-btn, .login-btn");
            if (btn) {
                e.preventDefault();
                e.stopPropagation();
                this.openModal("signin");
            }
        });

        const closeBtn = document.getElementById("closeAuthModal");
        const overlay = document.getElementById("authModalOverlay");

        if (closeBtn) closeBtn.addEventListener("click", () => this.closeModal());
        if (overlay) overlay.addEventListener("click", () => this.closeModal());

        const tabSignin = document.getElementById("tabSignin");
        const tabSignup = document.getElementById("tabSignup");
        const formSignin = document.getElementById("formSignin");
        const formSignup = document.getElementById("formSignup");

        if (tabSignin && tabSignup) {
            tabSignin.addEventListener("click", () => {
                tabSignin.classList.add("active");
                tabSignup.classList.remove("active");
                formSignin.classList.remove("hidden");
                formSignup.classList.add("hidden");
            });

            tabSignup.addEventListener("click", () => {
                tabSignup.classList.add("active");
                tabSignin.classList.remove("active");
                formSignup.classList.remove("hidden");
                formSignin.classList.add("hidden");
            });
        }

        document.querySelectorAll(".avatar-opt").forEach(opt => {
            opt.addEventListener("click", () => {
                document.querySelectorAll(".avatar-opt").forEach(o => o.classList.remove("active"));
                opt.classList.add("active");
            });
        });

        if (formSignin) {
            formSignin.addEventListener("submit", async (e) => {
                e.preventDefault();
                const loginVal = document.getElementById("signinLogin").value;
                const passVal = document.getElementById("signinPassword").value;
                const submitBtn = formSignin.querySelector(".auth-submit-btn");

                this.setLoading(submitBtn, true);
                try {
                    await this.login(loginVal, passVal);
                } finally {
                    this.setLoading(submitBtn, false);
                }
            });
        }

        if (formSignup) {
            formSignup.addEventListener("submit", async (e) => {
                e.preventDefault();
                const usernameVal = document.getElementById("signupUsername").value;
                const emailVal = document.getElementById("signupEmail").value;
                const passVal = document.getElementById("signupPassword").value;
                const avatarVal = document.querySelector(".avatar-opt.active")?.dataset.avatar || "🎮";
                const submitBtn = formSignup.querySelector(".auth-submit-btn");

                this.setLoading(submitBtn, true);
                try {
                    await this.register(usernameVal, emailVal, passVal, avatarVal);
                } finally {
                    this.setLoading(submitBtn, false);
                }
            });
        }

        const demoBtn = document.getElementById("demoSignBtn");
        if (demoBtn) {
            demoBtn.addEventListener("click", async () => {
                const demoUser = "Gamer_" + Math.floor(1000 + Math.random() * 9000);
                const demoEmail = demoUser.toLowerCase() + "@gamezone.com";
                const demoPass = "demo123456";

                this.setLoading(demoBtn, true);
                try {
                    await this.register(demoUser, demoEmail, demoPass, "🎮");
                } catch (e) {
                    await this.login(demoUser, demoPass);
                } finally {
                    this.setLoading(demoBtn, false);
                }
            });
        }
    },

    openModal(tab = "signin") {
        const wrapper = document.getElementById("authModalWrapper");
        if (!wrapper) return;

        wrapper.classList.remove("hidden");
        document.body.style.overflow = "hidden";

        if (tab === "signup") {
            document.getElementById("tabSignup")?.click();
        } else {
            document.getElementById("tabSignin")?.click();
        }
    },

    closeModal() {
        const wrapper = document.getElementById("authModalWrapper");
        if (wrapper) {
            wrapper.classList.add("hidden");
            document.body.style.overflow = "";
        }
    },

    setLoading(btn, isLoading) {
        if (!btn) return;
        const text = btn.querySelector(".btn-text");
        const spinner = btn.querySelector(".btn-spinner");
        btn.disabled = isLoading;
        if (text) text.style.opacity = isLoading ? "0.3" : "1";
        if (spinner) spinner.classList.toggle("hidden", !isLoading);
    },

    showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        if (!container) return;

        const toast = document.createElement("div");
        toast.className = `toast-message toast-${type}`;

        const iconMap = {
            success: "✅",
            error: "⚠️",
            info: "🎮"
        };

        toast.innerHTML = `
            <span class="toast-icon">${iconMap[type] || "ℹ️"}</span>
            <span class="toast-text">${this.escapeHTML(message)}</span>
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.classList.add("show");
        }, 10);

        setTimeout(() => {
            toast.classList.remove("show");
            setTimeout(() => toast.remove(), 300);
        }, 3500);
    },

    escapeHTML(str) {
        if (!str) return "";
        return String(str).replace(/[&<>"']/g, match => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        }[match]));
    }
};

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => GameZoneAuth.init());
} else {
    GameZoneAuth.init();
}
