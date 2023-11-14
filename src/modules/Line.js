/** @type HTMLElement */
const canvas = document.querySelector('[data-canvas]');

export class Line {
    #x = 0;
    #y = 0;
    #z = 0;
    #len = 0;
    #angle = 0;
    #ref = null;
    #init = false;

    /**
     * Instantiate a line on the canvas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} len 
     * @param {number} angle 
     */
    constructor(x, y, z, len, angle) {
        this.#x = x ?? 0;
        this.#y = y ?? 0;
        this.#z = z ?? 0;
        this.#len = len ?? 0;
        this.#angle = angle ?? 0;
        this.#render();
    }

    get x() {
        return this.#x;
    }

    get y() {
        return this.#y;
    }

    get z() {
        return this.#z;
    }

    get len() {
        return this.#len;
    }

    get angle() {
        return this.#angle;
    }

    /**
     * Update line's coordinates on the canvas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} len 
     * @param {number} angle 
     */
    update(x, y, z, len, angle) {
        this.#x = x ?? 0;
        this.#y = y ?? 0;
        this.#z = z ?? 0;
        this.#len = len ?? 0;
        this.#angle = angle ?? 0;
        this.#render();
    }

    #render() {
        if (!this.#init) {
            this.#createElement();
            this.#init = true;
        }

        this.#ref.style.setProperty('--x', this.x);
        this.#ref.style.setProperty('--y', this.y);
        this.#ref.style.setProperty('--z', this.z);
        this.#ref.style.setProperty('--len', this.len);
        this.#ref.style.setProperty('--angle', this.angle);
    }

    #createElement() {
        let element = document.createElement('div');
        element.classList.add('line');
        this.#ref = element;
        canvas.append(element);
    }
}