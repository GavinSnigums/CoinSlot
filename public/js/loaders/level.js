import Level from '../Level.js';
import {loadJSON, loadSpriteSheet} from './loaders.js';
import {Matrix} from '../math.js';
import {createBackgroundLayer} from '../layers/background.js';
import {createSpriteLayer} from '../layers/sprite.js';

function createCollisionMatrix(tiles, patterns) {
    const grid = new Matrix();

    for (const {tile, x, y} of expandTiles(tiles, patterns)) {
        grid.set(x, y, {type: tile.type});
    }

    return grid;
}

function createTileMatrix(tiles, patterns) {
    const grid = new Matrix();

    for (const {tile, x, y} of expandTiles(tiles, patterns)) {
        grid.set(x, y, {name: tile.name});
    }

    return grid;
}

function expandRange(range) {
    if (range.length === 4) {
        const [xStart, xLength, yStart, yLength] = range;
        return expandSpan(xStart, xLength, yStart, yLength);
    } else if (range.length === 3) {
        const [xStart, xLength, yStart] = range;
        return expandSpan(xStart, xLength, yStart, 1);
    } else if (range.length === 2) {
        const [xStart, yStart] = range;
        return expandSpan(xStart, 1, yStart, 1);
    }
}

function* expandRanges(ranges) {
    for (const range of ranges) {
        yield* expandRange(range)
    }
}

//this is called a generator function, it can be used for lazy iteration
//yield returns an iterator. e.g. {value: {x, y}, done: false}
function* expandSpan(xStart, xLength, yStart, yLength) {
    const xEnd = xStart + xLength;
    const yEnd = yStart + yLength;
    for (let x = xStart; x < xEnd; ++x) {
        for (let y = yStart; y < yEnd; ++y) {
            yield {x, y};
        }
    }
}

function* expandTiles(tiles, patterns) {
    function* walkTiles(tiles, offsetX, offsetY) {
        for (const tile of tiles) {
            for (let {x, y} of expandRanges(tile.ranges)) {
                const derivedX = x + offsetX;
                const derivedY = y + offsetY;
                if (tile.pattern) {
                    let t = patterns[tile.pattern].tiles;
                    yield* walkTiles(t, derivedX, derivedY);
                } else {
                    yield {
                        tile: tile, 
                        x: derivedX,
                        y: derivedY
                    };
                }
            }
        }
    }
    yield* walkTiles(tiles, 0, 0);
}

export function createLevelFactory(entityFactory) {
    return function loadLevel(name) {
        return loadJSON(`../levels/${name}.json`)
            .then(levelSpec => Promise.all([
                levelSpec,
                loadSpriteSheet('tiles')
            ]))
            .then(([levelSpec, tileSprites]) => {
                const level = new Level();

                setupCollision(levelSpec, level);
                setupBackgroundLayers(levelSpec, level, tileSprites);
                setupEntityLayer(levelSpec, level, entityFactory);

                return level;
            });
    }
}

function setupBackgroundLayers(levelSpec, level, tileSprites) {
    levelSpec.layers.forEach((layer, index) => {
        const tileMatrix = createTileMatrix(layer.tiles, levelSpec.patterns);
        const backgroundLayer = createBackgroundLayer(level, tileMatrix, tileSprites);
        level.comp.layers.set('backgroundLayer' + (index+1), backgroundLayer);
    });
}

function setupCollision(levelSpec, level) {
    const mergedTiles = levelSpec.layers.reduce((mergedTiles, layerSpec) => {
        return mergedTiles.concat(layerSpec.tiles);
    }, []);
    const collisionMatrix = createCollisionMatrix(mergedTiles, levelSpec.patterns);
    level.setCollisionGrid(collisionMatrix);
}

function setupEntityLayer(levelSpec, level, entityFactory) {
    levelSpec.entities.forEach(({name, position: [x, y]}) => {
        const entity = entityFactory[name]();
        entity.position.set(x, y);
        level.entities.add(entity);
    });
    const spriteLayer = createSpriteLayer(level.entities);
    level.comp.layers.set('spriteLayer', spriteLayer);
}