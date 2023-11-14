/** @type HTMLElement */
const canvas = document.querySelector('[data-canvas]');

export class Point {
    #x = 20;
    #y = 20;
    #z = 0;
    #ref = null;
    #init = false;

    /**
     * Instantiate a point on the canvas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    constructor(x, y, z = 0) {
        let isObjArg = arguments.length == 1 && typeof arguments[0] === 'object';
        this.#x = isObjArg ? arguments[0].x ?? 20 : x ?? 20;
        this.#y = isObjArg ? arguments[0].y ?? 20 : y ?? 20;
        this.#z = isObjArg ? arguments[0].z ?? 0 : z ?? 0;
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

    /**
     * Update point's coordinates on the canvas.
     * @param {number} x 
     * @param {number} y 
     * @param {number} z 
     */
    update(x, y, z) {
        let isObjArg = arguments.length == 1 && typeof arguments[0] === 'object';
        this.#x = isObjArg ? arguments[0].x ?? this.#x : x ?? this.#x;
        this.#y = isObjArg ? arguments[0].y ?? this.#y : y ?? this.#y;
        this.#z = isObjArg ? arguments[0].z ?? this.#z : z ?? this.#z;
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
    }

    #createElement() {
        let element = document.createElement('div');
        element.classList.add('point');
        this.#ref = element;
        canvas.append(element);
    }
}