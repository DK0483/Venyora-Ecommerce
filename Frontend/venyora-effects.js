/* =========================================================
   VENYORA — Premium Smooth 3D Interface
   Visual effects only.
   Does NOT modify cart, checkout, authentication,
   products, API calls, or existing business logic.
   ========================================================= */

(() => {
    "use strict";

    /* -----------------------------------------------------
       SETTINGS
    ----------------------------------------------------- */

    const reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
    ).matches;

    const touchDevice = window.matchMedia(
        "(hover: none), (pointer: coarse)"
    ).matches;


    /* -----------------------------------------------------
       SCROLL REVEAL
    ----------------------------------------------------- */

    const revealTargets = document.querySelectorAll(
        `
        .section__container,
        .arrival__card,
        .favourite__card,
        .product-card,
        .contact-layout,
        .checkout-box,
        .cart-item,
        .order-summary,
        .product-page-container
        `
    );

    revealTargets.forEach((element) => {
        element.classList.add("vny-reveal");
    });


    if (!reduceMotion && "IntersectionObserver" in window) {

        const revealObserver = new IntersectionObserver(
            (entries, observer) => {

                entries.forEach((entry) => {

                    if (entry.isIntersecting) {

                        entry.target.classList.add(
                            "vny-revealed"
                        );

                        observer.unobserve(entry.target);
                    }

                });

            },
            {
                threshold: 0.10,
                rootMargin: "0px 0px -40px 0px"
            }
        );


        revealTargets.forEach((element) => {
            revealObserver.observe(element);
        });

    } else {

        revealTargets.forEach((element) => {
            element.classList.add("vny-revealed");
        });

    }


    /* -----------------------------------------------------
       3D TILT EFFECT
       Desktop only
    ----------------------------------------------------- */

    if (!reduceMotion && !touchDevice) {

        const cards = document.querySelectorAll(
            `
            .product-card,
            .arrival__card,
            .favourite__card,
            .header__image,
            .sale__image
            `
        );


        cards.forEach((card) => {

            card.classList.add("vny-tilt");

            let animationFrame = null;

            let mouseX = 0;
            let mouseY = 0;


            const updateTilt = () => {

                animationFrame = null;

                const rect =
                    card.getBoundingClientRect();


                if (
                    rect.width === 0 ||
                    rect.height === 0
                ) {
                    return;
                }


                const x =
                    (mouseX - rect.left) /
                    rect.width;


                const y =
                    (mouseY - rect.top) /
                    rect.height;


                /*
                    Keep the rotation very small.

                    This is important for a fashion
                    e-commerce website.

                    We don't want a gaming-style
                    spinning card.
                */

                const rotateY =
                    (x - 0.5) * 7;

                const rotateX =
                    (0.5 - y) * 7;


                card.style.setProperty(
                    "--vny-rx",
                    `${rotateX}deg`
                );

                card.style.setProperty(
                    "--vny-ry",
                    `${rotateY}deg`
                );


                card.classList.add(
                    "vny-tilting"
                );
            };


            card.addEventListener(
                "pointermove",
                (event) => {

                    mouseX = event.clientX;
                    mouseY = event.clientY;


                    if (!animationFrame) {

                        animationFrame =
                            requestAnimationFrame(
                                updateTilt
                            );

                    }

                }
            );


            card.addEventListener(
                "pointerleave",
                () => {

                    if (animationFrame) {

                        cancelAnimationFrame(
                            animationFrame
                        );

                    }


                    animationFrame = null;


                    card.classList.remove(
                        "vny-tilting"
                    );


                    card.style.setProperty(
                        "--vny-rx",
                        "0deg"
                    );

                    card.style.setProperty(
                        "--vny-ry",
                        "0deg"
                    );

                }
            );

        });

    }


    /* -----------------------------------------------------
       PRODUCT IMAGE DEPTH / PARALLAX
    ----------------------------------------------------- */

    if (!reduceMotion && !touchDevice) {

        const imageCards =
            document.querySelectorAll(
                `
                .product-card,
                .arrival__card,
                .favourite__card
                `
            );


        imageCards.forEach((card) => {

            const image =
                card.querySelector("img");


            if (!image) {
                return;
            }


            card.addEventListener(
                "pointermove",
                (event) => {

                    const rect =
                        card.getBoundingClientRect();


                    const x =
                        (
                            (event.clientX - rect.left) /
                            rect.width -
                            0.5
                        ) * 8;


                    const y =
                        (
                            (event.clientY - rect.top) /
                            rect.height -
                            0.5
                        ) * 8;


                    image.style.setProperty(
                        "--vny-img-x",
                        `${x}px`
                    );

                    image.style.setProperty(
                        "--vny-img-y",
                        `${y}px`
                    );

                }
            );


            card.addEventListener(
                "pointerleave",
                () => {

                    image.style.setProperty(
                        "--vny-img-x",
                        "0px"
                    );

                    image.style.setProperty(
                        "--vny-img-y",
                        "0px"
                    );

                }
            );

        });

    }


    /* -----------------------------------------------------
       HERO MOUSE GLOW
    ----------------------------------------------------- */

    if (!reduceMotion && !touchDevice) {

        const hero =
            document.querySelector(
                ".header__container"
            );


        if (hero) {

            hero.addEventListener(
                "pointermove",
                (event) => {

                    const rect =
                        hero.getBoundingClientRect();


                    const mouseX =
                        (
                            (event.clientX - rect.left) /
                            rect.width
                        ) * 100;


                    const mouseY =
                        (
                            (event.clientY - rect.top) /
                            rect.height
                        ) * 100;


                    hero.style.setProperty(
                        "--vny-mx",
                        `${mouseX}%`
                    );

                    hero.style.setProperty(
                        "--vny-my",
                        `${mouseY}%`
                    );

                }
            );

        }

    }


    /* -----------------------------------------------------
       BUTTON PRESS EFFECT
    ----------------------------------------------------- */

    document.addEventListener(
        "pointerdown",
        (event) => {

            const button =
                event.target.closest(
                    ".btn, button, .add-to-bag-btn"
                );


            if (button) {

                button.classList.add(
                    "vny-pressed"
                );

            }

        }
    );


    document.addEventListener(
        "pointerup",
        () => {

            document
                .querySelectorAll(".vny-pressed")
                .forEach((element) => {

                    element.classList.remove(
                        "vny-pressed"
                    );

                });

        }
    );


    document.addEventListener(
        "pointercancel",
        () => {

            document
                .querySelectorAll(".vny-pressed")
                .forEach((element) => {

                    element.classList.remove(
                        "vny-pressed"
                    );

                });

        }
    );


    /* -----------------------------------------------------
       IMAGE LOAD SMOOTHNESS
    ----------------------------------------------------- */

    document
        .querySelectorAll("img")
        .forEach((image) => {

            image.addEventListener(
                "load",
                () => {

                    image.classList.add(
                        "vny-image-loaded"
                    );

                },
                {
                    once: true
                }
            );

        });


    /* -----------------------------------------------------
       PAGE READY
    ----------------------------------------------------- */

    document.documentElement.classList.add(
        "vny-ready"
    );

})();
