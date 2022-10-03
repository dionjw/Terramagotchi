import p5 from "p5";

import { Application } from "./application";

// Testing code: Imports for testing particles by manually adding
import {
    AirParticle,
    SoilParticle,
    StoneParticle,
    WaterParticle,
    SteamParticle,
    CompostParticle,
} from "./particles";

// cringe safety feature
p5.disableFriendlyErrors = true;

export const sketch = (s) => {
    /**
     * Function class for constructing a p5.js object
     */
    const application = new Application(240, 240);
    let cell_size = 3; // Defines cell size in pixels.

    let night_overlay, main, sky;

    let sky_day_color = s.color(135,206,235);
    let sky_night_color = s.color(0, 11, 31);

    let night_overlay_opacity = 150;

    // The initial setup function.
    s.setup = () => {
        const canvas = s.createCanvas(
            application.width * cell_size,
            application.height * cell_size
        );
        canvas.canvas.style = ""; // Remove inline styling so that css works.

        main = s.createGraphics(s.width, s.height);
        main.noStroke();

        night_overlay = s.createGraphics(s.width, s.height);
        sky = s.createGraphics(s.width, s.height);

        s.colorMode(s.HSB);
        // s.frameRate(20);
        s.background("#000000");
    };

    // The update function. Fires every frame
    s.draw = () => {
        application.update();

        // Iterates through all particles in the application's environment that
        // have changed and need to be rendered.
        for (let particle of application.environment.particle_grid) {
            if (particle.rerender) {
                if (!(particle instanceof AirParticle)) {
                    main.noErase()
                    main.fill(particle.get_color(s));
                }
                else {
                    main.erase()
                }

                main.rect(
                    cell_size * particle.x,
                    cell_size * (application.height - 1 - particle.y),
                    cell_size,
                    cell_size
                );
                particle.rerender = false;
            }
        }

        // Render background sky
        s.image(sky, 0, 0);
        s.background(s.lerpColor(sky_night_color, sky_day_color, application.environment.light_level / 100));

        // Render main environment grid
        s.image(main, 0, 0);

        // Render night-time darkening overlay
        night_overlay.clear();
        night_overlay.background(0, 0, 0, s.lerp(night_overlay_opacity, 0, application.environment.light_level / 100));
        s.image(night_overlay, 0, 0);
    };

    // Debug code for drawing
    let current_material = 1; // Default to stone
    let keys = {
        1: StoneParticle,
        2: SoilParticle,
        3: WaterParticle,
        4: SteamParticle,
        5: CompostParticle,
    };

    s.keyPressed = () => {
        if (s.key in keys) current_material = s.key;
    };

    s.mouseDragged = () => {
        const [x, y] = [
            Math.floor(s.mouseX / cell_size),
            application.height - 1 - Math.floor(s.mouseY / cell_size),
        ];
        application.environment.set(new keys[current_material](x, y));
    };
};

const sketchInstance = new p5(sketch);
