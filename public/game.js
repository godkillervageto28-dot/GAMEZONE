/* =========================================================
   GAMEZONE - GAMES PAGE JAVASCRIPT
========================================================= */


/* =========================================================
   DOM
========================================================= */

const gamesContainer =
    document.getElementById("gamesContainer");

const searchInput =
    document.getElementById("searchInput");

const clearSearch =
    document.getElementById("clearSearch");

const categoryButtons =
    document.querySelectorAll(".category-btn");

const sortSelect =
    document.getElementById("sortSelect");

const sectionTitle =
    document.getElementById("sectionTitle");

const totalGames =
    document.getElementById("totalGames");

const loadingState =
    document.getElementById("loadingState");

const errorState =
    document.getElementById("errorState");

const emptyState =
    document.getElementById("emptyState");

const errorText =
    document.getElementById("errorText");

const retryBtn =
    document.getElementById("retryBtn");

const resetBtn =
    document.getElementById("resetBtn");

const navSearchButton =
    document.getElementById("navSearchButton");


/* MODAL */

const gameModal =
    document.getElementById("gameModal");

const modalOverlay =
    document.getElementById("modalOverlay");

const closeModal =
    document.getElementById("closeModal");

const modalImage =
    document.getElementById("modalImage");

const modalCategory =
    document.getElementById("modalCategory");

const modalTitle =
    document.getElementById("modalTitle");

const modalRating =
    document.getElementById("modalRating");

const modalDescription =
    document.getElementById("modalDescription");

const modalGenre =
    document.getElementById("modalGenre");

const modalPlatform =
    document.getElementById("modalPlatform");

const playGameBtn =
    document.getElementById("playGameBtn");



/* =========================================================
   STATE
========================================================= */

let allGames = [];

let selectedCategory = "all";

let currentGame = null;



/* =========================================================
   CATEGORY ICONS
========================================================= */

const categoryIcons = {

    Arcade: "🪙",

    RPG: "⚔️",

    Action: "💥",

    Racing: "🏎️",

    Survival: "🧟",

    Strategy: "🧠",

    FPS: "🎯",

    Adventure: "🗺️",

    Sports: "⚽"

};



/* =========================================================
   ESCAPE HTML
========================================================= */

function escapeHTML(value) {

    if (
        value === null ||
        value === undefined
    ) {

        return "";

    }


    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");

}



/* =========================================================
   IMAGE URL
========================================================= */

function getImageURL(thumbnail) {
    if (!thumbnail || String(thumbnail).trim() === "") {
        return "";
    }

    let value = String(thumbnail).trim();

    if (value.startsWith("http://") || value.startsWith("https://")) {
        return value;
    }

    if (value.startsWith("/")) {
        value = value.substring(1);
    }

    if (!value.startsWith("assets/")) {
        value = "assets/" + value;
    }

    return "/" + value;
}



/* =========================================================
   GAME URL
========================================================= */

function getGameURL(game) {

    if (
        game.gameUrl &&
        String(game.gameUrl).trim()
    ) {

        return String(
            game.gameUrl
        ).trim();

    }


    /*
       Existing Coin Catcher game
    */

    const title =
        String(
            game.title || ""
        )
            .toLowerCase()
            .trim();


    if (
        title.includes("coin catcher")
    ) {

        return "/games/coin-catcher/";

    }


    return "";

}



/* =========================================================
   LOADING
========================================================= */

function showLoading() {

    loadingState.classList.remove(
        "hidden"
    );

    errorState.classList.add(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    gamesContainer.innerHTML = "";

}



/* =========================================================
   ERROR
========================================================= */

function showError(message) {

    loadingState.classList.add(
        "hidden"
    );

    errorState.classList.remove(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    gamesContainer.innerHTML = "";

    errorText.textContent =
        message ||
        "Unable to connect to the GameZone API.";

}



/* =========================================================
   NORMAL
========================================================= */

function showNormal() {

    loadingState.classList.add(
        "hidden"
    );

    errorState.classList.add(
        "hidden"
    );

}



/* =========================================================
   LOAD GAMES
========================================================= */

async function loadGames() {

    showLoading();


    try {

        const response =
            await fetch(
                "/api/games",
                {
                    method: "GET",
                    headers: {
                        "Accept":
                            "application/json"
                    }
                }
            );


        if (!response.ok) {

            throw new Error(
                `API error: ${response.status}`
            );

        }


        const data =
            await response.json();


        if (
            !data.success
        ) {

            throw new Error(
                data.message ||
                "Game API returned an error."
            );

        }


        allGames =
            Array.isArray(data.games)
                ? data.games
                : [];


        totalGames.textContent =
            allGames.length;


        showNormal();

        applyFilters();


    } catch (error) {

        console.error(
            "GameZone API Error:",
            error
        );


        showError(
            error.message
        );

    }

}



/* =========================================================
   DISPLAY GAMES
========================================================= */

function displayGames(games) {

    gamesContainer.innerHTML = "";


    if (
        !games ||
        games.length === 0
    ) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    games.forEach(
        (game, index) => {

            const card =
                document.createElement(
                    "article"
                );


            card.className =
                "game-card";


            card.style.animationDelay =
                `${index * 60}ms`;


            const title =
                escapeHTML(
                    game.title ||
                    "Untitled Game"
                );


            const category =
                escapeHTML(
                    game.category ||
                    "Game"
                );


            const description =
                escapeHTML(
                    game.description ||
                    "No description available."
                );


            const genre =
                escapeHTML(
                    game.genre ||
                    "Gaming"
                );


            const platform =
                escapeHTML(
                    game.platform ||
                    "PC"
                );


            const rating =
                game.rating !== undefined &&
                game.rating !== null
                    ? game.rating
                    : "N/A";


            const icon =
                categoryIcons[
                    game.category
                ] ||
                "🎮";


            const image =
                getImageURL(
                    game.thumbnail
                );


            const gameURL =
                getGameURL(game);


            let imageHTML;


            if (image) {

                imageHTML = `

                    <img
                        src="${escapeHTML(image)}"
                        alt="${title}"
                        loading="lazy"
                        onerror="
                            this.style.display='none';
                            this.nextElementSibling.style.display='grid';
                        "
                    >

                    <div
                        class="image-placeholder"
                        style="display:none"
                    >
                        ${icon}
                    </div>

                `;

            } else {

                imageHTML = `

                    <div class="image-placeholder">
                        ${icon}
                    </div>

                `;

            }


            card.innerHTML = `

                <div class="game-image">

                    ${imageHTML}


                    <div class="image-gradient">
                    </div>


                    <div class="card-badges">

                        <span class="category-badge">
                            ${icon}
                            ${category}
                        </span>

                        <span class="rating-badge">
                            ⭐ ${escapeHTML(rating)}
                        </span>

                    </div>


                    <div class="card-image-title">
                        ${title}
                    </div>

                </div>


                <div class="game-body">

                    <div class="game-title-row">

                        <h3>
                            ${title}
                        </h3>

                        <span class="game-controller">
                            🎮
                        </span>

                    </div>


                    <p class="game-description">
                        ${description}
                    </p>


                    <div class="game-footer">

                        <span class="game-platform">
                            🎮 ${platform}
                        </span>


                        <button
                            class="view-game-btn"
                            type="button"
                            data-game-id="${escapeHTML(game._id)}"
                        >
                            View Game
                        </button>

                    </div>

                </div>

            `;


            const viewButton =
                card.querySelector(
                    ".view-game-btn"
                );


            viewButton.addEventListener(
                "click",
                () => {

                    openGameModal(game);

                }
            );


            gamesContainer.appendChild(
                card
            );

        }
    );

}



/* =========================================================
   FILTER
========================================================= */

function applyFilters() {

    let filtered =
        [...allGames];


    /* CATEGORY */

    if (
        selectedCategory !== "all"
    ) {

        filtered =
            filtered.filter(
                game => {

                    return String(
                        game.category || ""
                    )
                        .toLowerCase()
                        .trim()
                    ===
                    selectedCategory
                        .toLowerCase()
                        .trim();

                }
            );

    }


    /* SEARCH */

    const searchVal = searchInput ? searchInput.value.trim() : "";

    if (searchVal) {
        const norm = (str) => String(str || "").toLowerCase().replace(/[-_]/g, " ").replace(/\s+/g, " ").trim();
        const compact = (str) => String(str || "").toLowerCase().replace(/[^a-z0-9]/g, "");

        const queryNorm = norm(searchVal);
        const queryCompact = compact(searchVal);
        const queryTokens = queryNorm.split(" ").filter(t => t.length > 0);

        filtered = filtered.filter(game => {
            const title = String(game.title || "");
            const description = String(game.description || "");
            const category = String(game.category || "");
            const genre = String(game.genre || "");
            const platform = String(game.platform || "");

            const combinedText = `${title} ${category} ${genre} ${platform} ${description}`;
            const normText = norm(combinedText);
            const compactText = compact(combinedText);

            if (normText.includes(queryNorm)) return true;
            if (queryCompact && compactText.includes(queryCompact)) return true;

            return queryTokens.every(token => {
                const compactTok = compact(token);
                return normText.includes(token) || (compactTok && compactText.includes(compactTok));
            });
        });
    }


    /* SORT */

    filtered =
        sortGames(
            filtered
        );


    updateHeading();

    displayGames(
        filtered
    );

}



/* =========================================================
   SORT
========================================================= */

function sortGames(games) {

    const sorted =
        [...games];


    switch (
        sortSelect.value
    ) {

        case "rating":

            sorted.sort(
                (a, b) =>
                    Number(
                        b.rating || 0
                    ) -
                    Number(
                        a.rating || 0
                    )
            );

            break;


        case "name":

            sorted.sort(
                (a, b) =>
                    String(
                        a.title || ""
                    ).localeCompare(
                        String(
                            b.title || ""
                        )
                    )
            );

            break;


        case "newest":

            sorted.sort(
                (a, b) =>
                    new Date(
                        b.createdAt || 0
                    ) -
                    new Date(
                        a.createdAt || 0
                    )
            );

            break;


        default:

            break;

    }


    return sorted;

}



/* =========================================================
   HEADING
========================================================= */

function updateHeading() {

    if (
        selectedCategory === "all"
    ) {

        sectionTitle.textContent =
            "Featured Games";

        return;

    }


    sectionTitle.textContent =
        `${selectedCategory} Games`;

}



/* =========================================================
   CATEGORY BUTTONS
========================================================= */

categoryButtons.forEach(
    button => {

        button.addEventListener(
            "click",
            () => {

                categoryButtons.forEach(
                    item =>
                        item.classList.remove(
                            "active"
                        )
                );


                button.classList.add(
                    "active"
                );


                selectedCategory =
                    button.dataset.category ||
                    "all";


                updateURL();

                applyFilters();

            }
        );

    }
);



/* =========================================================
   URL CATEGORY
========================================================= */

function initializeFromURL() {

    const params =
        new URLSearchParams(
            window.location.search
        );


    const searchParam = params.get("search") || params.get("q");
    if (searchParam && searchInput) {
        if (searchParam !== "true") {
            searchInput.value = searchParam;
        }
        setTimeout(() => {
            searchInput.focus();
        }, 100);
    }

    const category =
        params.get(
            "category"
        );


    if (!category) {

        return;

    }


    const button =
        [...categoryButtons]
            .find(
                item =>
                    item.dataset.category
                        .toLowerCase()
                    ===
                    category
                        .toLowerCase()
            );


    if (!button) {

        return;

    }


    selectedCategory =
        button.dataset.category;


    categoryButtons.forEach(
        item =>
            item.classList.remove(
                "active"
            )
    );


    button.classList.add(
        "active"
    );

}



/* =========================================================
   UPDATE URL
========================================================= */

function updateURL() {

    const url =
        new URL(
            window.location.href
        );


    if (
        selectedCategory === "all"
    ) {

        url.searchParams.delete(
            "category"
        );

    } else {

        url.searchParams.set(
            "category",
            selectedCategory
        );

    }


    window.history.replaceState(
        {},
        "",
        url
    );

}



/* =========================================================
   SEARCH
========================================================= */

searchInput.addEventListener(
    "input",
    () => {

        applyFilters();

    }
);


clearSearch.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        searchInput.focus();

        applyFilters();

    }
);


sortSelect.addEventListener(
    "change",
    () => {

        applyFilters();

    }
);



/* =========================================================
   NAV SEARCH BUTTON
========================================================= */

navSearchButton.addEventListener(
    "click",
    () => {

        searchInput.focus();

        window.scrollTo({
            top:
                document.querySelector(
                    ".hero"
                ).offsetTop,
            behavior: "smooth"
        });

    }
);



/* =========================================================
   RESET
========================================================= */

function resetFilters() {

    selectedCategory =
        "all";


    searchInput.value =
        "";


    sortSelect.value =
        "featured";


    categoryButtons.forEach(
        button =>
            button.classList.toggle(
                "active",
                button.dataset.category ===
                "all"
            )
    );


    updateURL();

    applyFilters();

}


resetBtn.addEventListener(
    "click",
    resetFilters
);



/* =========================================================
   MODAL
========================================================= */

function openGameModal(game) {

    currentGame =
        game;


    const image =
        getImageURL(
            game.thumbnail
        );


    const icon =
        categoryIcons[
            game.category
        ] ||
        "🎮";


    modalCategory.textContent =
        `${icon} ${game.category || "Game"}`;


    modalTitle.textContent =
        game.title ||
        "Untitled Game";


    modalRating.textContent =
        `⭐ ${game.rating ?? "N/A"} / 10`;


    modalDescription.textContent =
        game.description ||
        "No description available.";


    modalGenre.textContent =
        `Genre: ${game.genre || "Gaming"}`;


    modalPlatform.textContent =
        `Platform: ${game.platform || "PC"}`;


    if (image) {

        modalImage.style.backgroundImage =
            `url("${image}")`;

    } else {

        modalImage.style.backgroundImage =
            `radial-gradient(
                circle,
                rgba(139,61,255,0.35),
                transparent 65%
            )`;

    }


    const url =
        getGameURL(game);


    if (url) {

        playGameBtn.disabled =
            false;

        playGameBtn.textContent =
            "▶ Play Game";

        playGameBtn.style.opacity =
            "1";

    } else {

        playGameBtn.disabled =
            true;

        playGameBtn.textContent =
            "Coming Soon";

        playGameBtn.style.opacity =
            "0.5";

    }


    gameModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}



/* =========================================================
   CLOSE MODAL
========================================================= */

function closeGameModal() {

    gameModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


closeModal.addEventListener(
    "click",
    closeGameModal
);


modalOverlay.addEventListener(
    "click",
    closeGameModal
);


document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            closeGameModal();

        }

    }
);



/* =========================================================
   PLAY GAME
========================================================= */

playGameBtn.addEventListener(
    "click",
    () => {

        if (!currentGame) {

            return;

        }


        const url =
            getGameURL(
                currentGame
            );


        if (!url) {

            return;

        }


        window.location.href =
            url;

    }
);



/* =========================================================
   START
========================================================= */

initializeFromURL();

loadGames();