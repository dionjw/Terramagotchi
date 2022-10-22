import { AirParticle } from "..";

import {
    DeadPlantParticle,
    PlantFamilyParticle,
} from ".";

import { ShootSystemParticle } from "./shoot_system"

import { FastRandom } from "../../fast-random";

export class LeafParticle extends ShootSystemParticle {

    static REGROWTH_COOLDOWN_CONST = 10*60 // 5 seconds at 60fps

    constructor(x, y, plant_dna=null) {
        super(x, y, plant_dna);

        this.activation_level = 0
        this.max_health = this.dna.leaf_max_health || 1200 + FastRandom.int_min_max(-300, 300)
        this.health = this.max_health

        this.nutrient_capacity = 100
        this.water_capacity = 100

        this.leaf_growth_probability = 1/10
        this.cooldown_timer = -1

        this.is_leaf_root = true
        this.leaf_dead = false
        this.leaf_death_tick = -1

        this.__leaf_children = null
    }

    update(environment) {
        this.absorb_nutrients(environment, false)
        this.absorb_water(environment, false)
        this.generate_energy()
        this.health_update(environment)
        
        if (this.is_active &&
            this.energy >= this.activation_level &&
            this.nutrient_level >= PlantFamilyParticle.MIN_HEALTHY_NUTRIENTS &&
            this.water_level >= PlantFamilyParticle.MIN_HEALTHY_WATER)
            this.grow_children(environment)
    }


    select_leaf_children() {
        switch (this.dna.leaf_shape) {
            case "sunflower":
                if (this.__current_length == 1)
                    this.__leaf_children = [[1, 1], [1, -1], [-1, 1], [-1, -1], [0, 1], [1, 0], [0, -1], [-1, 0]]
                else
                    this.__leaf_children = [this.convert_angle_to_offset(this.__current_angle)]
                break
            case "lavender":
            case "flat-top":
            default:
                this.__leaf_children = [[0, -1], [this.dna.leaf_direction, 0]]
        }
    }

    grow_children(environment) {

        if (FastRandom.random() > this.leaf_growth_probability || this.cooldown_timer >= 0 || this.dead || this.leaf_dead)
            return

        if (this.__current_length >= this.dna.leaf_size) {
            this.is_active = false
            return;
        }
        if (this.__leaf_children == null)
            this.select_leaf_children()

        for (let neighbour of this.__leaf_children) {
            let [offset_x, offset_y] = neighbour
            let target_particle = environment.get(this.x+offset_x, this.y+offset_y)
            if (target_particle instanceof AirParticle || (this.dna.growth_destructive && target_particle instanceof PlantFamilyParticle && !target_particle.is_active)) {
                let new_leaf = new LeafParticle(this.x+offset_x, this.y+offset_y, this.dna)
                new_leaf.__current_angle = this.convert_offset_to_base_angle(offset_x, offset_y)
                new_leaf.__current_length = this.__current_length + 1
                if (new_leaf.__current_length >= this.dna.secondary_color_length)
                    new_leaf.base_color = this.dna.secondary_color
                
                new_leaf.is_leaf_root = false
                new_leaf.absorb_tier = this.absorb_tier + 100
                environment.set(new_leaf)
                
                this.energy -= this.activation_level
                // break //necessary
            }
        }
    }

    health_update(environment) {
        if (this.dead) {
            this.die(environment)
            return
        }

        if (this.is_leaf_root) {
            if (this.cooldown_timer == 0) {
                this.cooldown_timer -= 1
                this.is_active = true
                return
            } else if (this.cooldown_timer > 0) {
                this.cooldown_timer -= 1
            }
        } else {
            this.health -= 1

            if (this.health <= 0 || this.leaf_dead)
                this.leaf_die(environment)
        }
    }

    leaf_die(environment) {

        if (this.is_leaf_root) {
            this.cooldown_timer = LeafParticle.REGROWTH_COOLDOWN_CONST
            this.is_active = false
            return;
        }

        if (this.leaf_death_tick == -1) {
            this.leaf_death_tick = environment.tick
            this.leaf_dead = true
            return;
        }

        let new_dead_plant = new DeadPlantParticle(this.x, this.y, this.dna)
        environment.set(new_dead_plant)

        for (let [offset_x, offset_y] of this.__neighbours) {
            let target_particle = environment.get(this.x+offset_x, this.y+offset_y)
            if (target_particle instanceof LeafParticle && target_particle.leaf_death_tick < environment.tick && this.dna.get_root() == target_particle.dna.get_root())
                target_particle.leaf_die(environment)
        }
    }
}