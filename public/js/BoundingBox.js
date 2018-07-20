export default class BoundingBox {
    constructor(position, size, offset) {
        this.position = position;
        this.size = size;
        this.offset = offset;
    }
    overlaps(box) {
        return this.top <= box.bottom
            && this.bottom >= box.top
            && this.left <= box.right
            && this.right >= box.left;
    }
    get top() {
        return this.position.y + this.offset.y;
    }
    set top(y) {
        this.position.y = y - this.offset.y;
    }
    get bottom() {
        return this.position.y + this.size.y + this.offset.y;
    }
    set bottom(y) {
        this.position.y = y - this.size.y - this.offset.y
    }
    get left() {
        return this.position.x + this.offset.x;
    }
    set left(x) {
        this.position.x = x - this.offset.x;
    }
    get right() {
        return this.position.x + this.size.x + this.offset.x;
    }
    set right(x) {
        this.position.x = x - this.size.x - this.offset.x
    }
    get centerX() {
        return this.position.x + this.offset.x + Math.floor(this.size.x/2);
    }
    get centerY() {
        return this.position.y + this.offset.y + Math.floor(this.size.y/2);
    }
}
