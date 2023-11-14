/** @type HTMLElement */
const canvas = document.querySelector('[data-canvas]');

export class BoundingBox {
    #x;
    #y;
    #z;
    #width;
    #height;
    #rotation;
    #ref = null;
    #init = false;

    /**
     * Instantiate a bounding rect on the canvas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} width 
     * @param {number} height 
     * @param {number} rotation 
     */
    constructor(x, y, z, width, height, rotation) {
        this.#x = x ?? 0;
        this.#y = y ?? 0;
        this.#z = z ?? 0;
        this.#width = width ?? 0;
        this.#height = height ?? 0;
        this.#rotation = rotation ?? 0;
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
    get width() {
        return this.#width;
    }
    get height() {
        return this.#height;
    }
    get rotation() {
        return this.#rotation;
    }

    /**
     * Update bounding rect's coordinates on the canvas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     * @param {number} width 
     * @param {number} height 
     * @param {number} rotation 
     */
    update(x, y, z, width, height, rotation) {
        this.#x = x ?? 0;
        this.#y = y ?? 0;
        this.#z = z ?? 0;
        this.#width = width ?? 0;
        this.#height = height ?? 0;
        this.#rotation = rotation ?? 0;
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
        this.#ref.style.setProperty('--width', this.width);
        this.#ref.style.setProperty('--height', this.height);
        this.#ref.classList.toggle('visible', Boolean(this.rotation));
    }

    #createElement() {
        let element = document.createElement('div');
        element.classList.add('bounding-rect');
        this.#ref = element;
        canvas.append(element);
    }
}