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
import { SeedParticle, DeadPlantParticle } from "./particles/plants";

// cringe safety feature
p5.disableFriendlyErrors = true;

export const sketch = (s) => {
    /**
     * Function class for constructing a p5.js object
     */
    const application = new Application(270, 270);
    let cell_size = 3; // Defines cell size in pixels.

    let night_overlay_graphic, main_graphic, organisms_graphic;

    let sky_day_color, sky_night_color;

    let night_overlay_opacity;

    // The initial setup function.
    s.setup = () => {
        const canvas = s.createCanvas(
            application.width * cell_size,
            application.height * cell_size
        );
        canvas.canvas.style = ""; // Remove inline styling so that css works.

        main_graphic = s.createGraphics(s.width, s.height);
        main_graphic.noStroke();

        organisms_graphic = s.createGraphics(s.width, s.height);
        organisms_graphic.noStroke();

        night_overlay_graphic = s.createGraphics(s.width, s.height);

        sky_day_color = s.color(135,206,235);
        sky_night_color = s.color(0, 11, 31);
        night_overlay_opacity = 150;

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
                // Particle is empty, erase paint in square of grid
                if (particle instanceof AirParticle) {
                    main_graphic.erase()
                }
                // Particle is not empty, paint over with full color
                else {
                    main_graphic.noErase()
                    main_graphic.fill(particle.get_color(s));
                }

                // Paint square on grid
                main_graphic.rect(
                    cell_size * particle.x,
                    cell_size * (application.height - 1 - particle.y),
                    cell_size,
                    cell_size
                );
                particle.rerender = false;
            }
        }

        // Render organisms
        organisms_graphic.clear();
        for (let organism of application.environment.organisms) {
            for (let [prev_x, prev_y] of organism.location_history) {
                organisms_graphic.fill(organism.body_color);
                organisms_graphic.rect(
                    cell_size * prev_x,
                    cell_size * (application.height - 1 - prev_y),
                    cell_size,
                    cell_size
                );
            }

            organisms_graphic.fill(organism.head_color);
            organisms_graphic.rect(
                cell_size * organism.x,
                cell_size * (application.height - 1 - organism.y),
                cell_size,
                cell_size
            );

            // Display target locations of each organism.
            // if (organism.target_location !== null) {
            //     organisms_graphic.push();
            //     organisms_graphic.fill("#00FF0012");
            //     organisms_graphic.rect(
            //         cell_size * organism.target_location[0],
            //         cell_size *
            //             (application.height - 1 - organism.target_location[1]),
            //         cell_size,
            //         cell_size
            //     );
            //     organisms_graphic.pop();
            // }
        }

        // Render background color
        s.background(s.lerpColor(sky_night_color, sky_day_color, application.environment.light_level / 100));
        // Render main environment grid
        s.image(main_graphic, 0, 0);
        // Display organisms
        s.image(organisms_graphic, 0, 0);

        // Render night-time darkening overlay
        night_overlay_graphic.clear();
        night_overlay_graphic.background(0, 0, 10, s.lerp(night_overlay_opacity, 0, application.environment.light_level / 100));
        s.image(night_overlay_graphic, 0, 0);
    };

    // Debug code for drawing
    let current_material = 1; // Default to stone
    let keys = {
        1: StoneParticle,
        2: SoilParticle,
        3: WaterParticle,
        4: SteamParticle,
        5: CompostParticle,
        6: SeedParticle,
        7: DeadPlantParticle,
    };

    s.keyPressed = () => {
        if (s.key in keys) {
            current_material = s.key;
        } else if (s.key == 'o') {
            const [x, y] = [
                Math.floor(s.mouseX / cell_size),
                application.height - 1 - Math.floor(s.mouseY / cell_size),
            ];
            application.environment.spawn_organism(x, y)
        }
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
