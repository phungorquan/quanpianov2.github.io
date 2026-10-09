/* =========================================================
   LOAD GALLERY
========================================================= */

async function loadGallery() {
    const collection = document.getElementById("piano-collection");
    const countElement = document.getElementById("collection-count");

    if (!collection) return;

    try {
        const response = await fetch("resource/gallery.json");

        if (!response.ok) {
            throw new Error(`Cannot load gallery: ${response.status}`);
        }

        const data = await response.json();
        const images = data.images || [];

        // Group images by category while preserving JSON order.
        const categories = new Map();

        images.forEach((image) => {
            const category = image.category || "Other Pianos";

            if (!categories.has(category)) {
                categories.set(category, []);
            }

            categories.get(category).push(image);
        });

        collection.replaceChildren();

        let totalImages = 0;

        categories.forEach((items, category) => {
            totalImages += items.length;

            const section = document.createElement("section");
            section.className = "piano-category reveal";

            const heading = document.createElement("div");
            heading.className = "piano-category-heading";

            const titleGroup = document.createElement("div");
            const title = document.createElement("h3");
            title.textContent = category;

            const description = document.createElement("p");
            description.textContent = `${items.length} piano model${items.length === 1 ? "" : "s"}`;

            titleGroup.append(title, description);

            const count = document.createElement("span");
            count.className = "piano-category-count";
            // count.textContent = `${String(items.length).padStart(2, "0")} MODELS`;

            heading.append(titleGroup, count);

            const list = document.createElement("div");
            list.className = "piano-horizontal-list";

            items.forEach((item, index) => {
                const card = document.createElement("article");
                card.className = "piano-card";

                const imageFrame = document.createElement("div");
                imageFrame.className = "piano-card-image";

                const img = document.createElement("img");
                img.src = item.url;
                img.alt = item.name || category;
                img.loading = "lazy";
                img.decoding = "async";

                img.addEventListener("error", () => {
                    img.alt = `${item.name || "Piano"} image could not be loaded`;
                    img.style.opacity = "0.25";
                }, {
                    once: true
                });

                imageFrame.appendChild(img);

                const info = document.createElement("div");
                info.className = "piano-card-info";

                const textGroup = document.createElement("div");
                const name = document.createElement("h4");
                name.textContent = item.name || `Model ${index + 1}`;
                textGroup.appendChild(name);

                if (item.description) {
                    const description = document.createElement("p");
                    description.textContent = item.description;
                    textGroup.appendChild(description);
                }

                // Display price tag when a price is provided in gallery.json.
                if (
                    item.price !== undefined &&
                    item.price !== null &&
                    String(item.price).trim() !== ""
                ) {
                    const priceTag = document.createElement("span");
                    priceTag.className = "piano-card-price";
                    priceTag.textContent = String(item.price);
                    priceTag.setAttribute("aria-label", `Price: ${item.price}`);
                    textGroup.appendChild(priceTag);
                }

                const number = document.createElement("span");
                number.className = "piano-card-number";
                number.textContent = String(index + 1).padStart(2, "0");

                info.append(textGroup, number);
                card.append(imageFrame, info);
                list.appendChild(card);
            });

            section.append(heading, list);
            collection.appendChild(section);

            // Enable mouse dragging for this dynamically created list.
            enableMouseDragScroll(list);
        });

        if (countElement) {
            countElement.textContent =
                `${totalImages} piano models across ${categories.size} categories`;
        }

        // Observe newly created sections for scroll reveal.
        if (typeof observeRevealElements === "function") {
            observeRevealElements();
        }
    } catch (error) {
        console.error("Failed to load piano gallery:", error);
        collection.textContent =
            "The collection could not be loaded. Please try again later.";
    }
}

/* =========================================================
   CREATE GALLERY
========================================================= */

function createGallery(images) {
    const gallery = document.getElementById("piano-grid");
    const counter = document.getElementById("collection-count");

    /*
     * Show number of images
     */
    counter.textContent = String(images.length).padStart(2, "0");

    /*
     * Create every piano
     */
    images.forEach((piano, index) => {
        const card = document.createElement("article");
        card.className = "piano-card reveal hover-target";

        /*
         * Image wrapper
         */
        const imageWrapper = document.createElement("div");
        imageWrapper.className = "piano-image-wrapper";

        /*
         * Image
         */
        const image = document.createElement("img");
        image.className = "piano-image";
        image.src = piano.url;
        image.alt = piano.name;
        image.loading = index < 2 ? "eager" : "lazy";

        /*
         * Information
         */
        const info = document.createElement("div");
        info.className = "piano-info";
        const name = document.createElement("div");
        name.className = "piano-name";
        name.textContent = piano.name;
        const type = document.createElement("div");
        type.className = "piano-type";
        type.textContent = piano.type || "";

        /*
         * Build HTML
         */
        imageWrapper.appendChild(image);
        info.appendChild(name);
        info.appendChild(type);
        card.appendChild(imageWrapper);
        card.appendChild(info);
        gallery.appendChild(card);

        /*
         * Add hover effects
         */
        setupCardEffect(card);
    });

    /*
     * Start scroll observer
     */
    setupRevealObserver();
}

/* =========================================================
   CARD MOUSE EFFECT
========================================================= */
function setupCardEffect(card) {
    const image = card.querySelector(".piano-image");
    card.addEventListener("mousemove", event => {
        const rect = card.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;
        image.style.transform =
            `
                scale(1.08)
                translate(
                    ${x * 8}px,
                    ${y * 8}px
                )
                `;
    });

    card.addEventListener("mouseleave", () => {
        image.style.transform = "scale(1.02) translate(0, 0)";
    });

    /*
     * Cursor effect
     */
    card.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
    });

    card.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover");
    });
}

/* =========================================================
   SCROLL REVEAL
========================================================= */

function setupRevealObserver() {
    const elements = document.querySelectorAll(".reveal");
    const observer = new IntersectionObserver(
        entries => {
            entries.forEach(
                entry => {
                    if (entry.isIntersecting) {
                        entry.target.classList.add("visible");
                        observer.unobserve(entry.target);
                    }
                }
            );
        }, {
        threshold: 0.15
    });

    elements.forEach(element => {
        observer.observe(element);
    });
}

/* =========================================================
   HERO LOAD
========================================================= */
window.addEventListener("load", () => {
    document.querySelector(".hero").classList.add("loaded");
});

/* =========================================================
   PARALLAX
========================================================= */
const parallaxImages = document.querySelectorAll(".feature-image, .final-image img");

window.addEventListener("scroll",
    () => {
        parallaxImages.forEach(
            image => {
                const rect = image.parentElement.getBoundingClientRect();
                const center = rect.top + rect.height / 2;
                const distance = center - window.innerHeight / 2;
                const movement = distance * -0.08;
                image.style.transform = `translateY(${movement}px)`;
            });
    });

/* =========================================================
   CUSTOM CURSOR
========================================================= */
const cursor = document.querySelector(".cursor");
const ring = document.querySelector(".cursor-ring");
let mouseX = 0;
let mouseY = 0;
let ringX = 0;
let ringY = 0;

document.addEventListener("mousemove", event => {
    mouseX = event.clientX;
    mouseY = event.clientY;
    cursor.style.left = mouseX + "px";
    cursor.style.top = mouseY + "px";
});

function animateCursor() {
    ringX += (mouseX - ringX) * 0.12;
    ringY += (mouseY - ringY) * 0.12;
    ring.style.left = ringX + "px";
    ring.style.top = ringY + "px";

    requestAnimationFrame(animateCursor);
}

animateCursor();

/* =========================================================
   NAVIGATION HOVER
========================================================= */
document.querySelectorAll(".hover-target").forEach(element => {
    element.addEventListener("mouseenter", () => {
        document.body.classList.add("cursor-hover");
    });

    element.addEventListener("mouseleave", () => {
        document.body.classList.remove("cursor-hover");
    });
});


/* =========================================================
   START
========================================================= */
loadGallery();

const footerYear = document.getElementById("footer-year");
if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
}

function enableMouseDragScroll(list) {
    let isDragging = false;
    let startX = 0;
    let startScrollLeft = 0;
    let dragged = false;

    list.addEventListener("pointerdown", (event) => {
        // Only handle the left mouse button on desktop.
        if (event.pointerType !== "mouse" || event.button !== 0) {
            return;
        }

        isDragging = true;
        dragged = false;
        startX = event.clientX;
        startScrollLeft = list.scrollLeft;

        list.classList.add("is-dragging");
        list.setPointerCapture(event.pointerId);
        event.preventDefault();
    });

    list.addEventListener("pointermove", (event) => {
        if (!isDragging) return;

        const deltaX = event.clientX - startX;

        if (Math.abs(deltaX) > 4) {
            dragged = true;
        }

        if (dragged) {
            list.scrollLeft = startScrollLeft - deltaX;
        }
    });

    function stopDragging() {
        if (!isDragging) return;

        isDragging = false;
        list.classList.remove("is-dragging");
    }

    list.addEventListener("pointerup", stopDragging);
    list.addEventListener("pointercancel", stopDragging);
    list.addEventListener("lostpointercapture", stopDragging);
}