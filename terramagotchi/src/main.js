import p5 from "p5";

import { Application } from "./application";
import {
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

    // The initial setup function.
    s.setup = () => {
        const canvas = s.createCanvas(
            application.width * cell_size,
            application.height * cell_size
        );
        canvas.canvas.style = ""; // Remove inline styling so that css works.
        s.noStroke();
        s.colorMode(s.HSB);
        // s.frameRate(20);
        s.background("#87CEEB");
    };

    // The update function. Fires every frame
    s.draw = () => {
        application.update();

        // Iterates through all particles in the application's environment that
        // have changed and need to be rendered.
        while (application.render_queue.size() > 0) {
            const [x, y] = application.render_queue.pop();
            const particle = application.environment.get(x, y);
            s.fill(particle.get_color(s));
            s.rect(
                cell_size * x,
                cell_size * (application.height - 1 - y),
                cell_size,
                cell_size
            );
        }
    };

    /**
     * Debug code for drawing
     * 1 = Stone
     * 2 = Soil
     * 3 = Water
     * 4 = Steam
     */
    let drawing = 49; // Default to drawing stone
    let keys = {};
    keys[49] = StoneParticle;
    keys[50] = SoilParticle;
    keys[51] = WaterParticle;
    keys[52] = SteamParticle;
    keys[53] = CompostParticle;
    s.mouseDragged = () => {
        const [x, y] = [
            Math.floor(s.mouseX / cell_size),
            application.height - 1 - Math.floor(s.mouseY / cell_size),
        ];
        if (typeof keys[drawing] === "function") {
            application.environment.set(x, y, new keys[drawing]());
        }
    };
    s.keyPressed = () => {
        drawing = s.keyCode;
    };
};

const sketchInstance = new p5(sketch);
