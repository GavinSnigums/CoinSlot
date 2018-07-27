import Compositor from "./Compositor.js";
import EntityCollider from './EntityCollider.js';
import TileCollider from './TileCollider.js';

export default class Level {
    constructor() {
        this.comp = new Compositor();
        this.entities = new Set();
        this.entityCollider = new EntityCollider(this.entities);
        this.gravity = 1500;
        this.totalTime = 0;
        this.tileCollider = null;
    }
    setCollisionGrid(matrix) {
        this.tileCollider = new TileCollider(matrix);
    }
    update(deltaTime) {
        this.entities.forEach(entity => {
            entity.update(deltaTime, this);
        });
        this.entities.forEach(entity => {
            this.entityCollider.check(entity);
        });
        this.entities.forEach(entity => {
            entity.finalize(deltaTime, this);
        });
        this.totalTime += deltaTime;
    }
}
