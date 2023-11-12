const RESIZE_HANDLE_WIDTH = 17;
const ROTATE_HANLE_WIDTH = 12;
const ROTATE_HANLE_HEIGHT = 13;

const R2D = 180 / Math.PI;
const D2R = Math.PI / 180;

/** @type HTMLElement */
const rectElem = document.querySelector('[data-rect]');
/** @type HTMLElement */
const boxElem = document.querySelector('[data-box]');
/** @type HTMLElement */
const rotateHandleElem = document.querySelector('[data-box-rotate-handle]');
/** @type HTMLElement */
const resizeHandleElem = document.querySelector('[data-box-resize-handle]');
/** @type HTMLElement */
const boxInfoElem = document.querySelector('[data-box-info]');
const boxInfoLabels = boxInfoElem.children;
/** @type HTMLElement[] */
const points = [];
/** @type HTMLElement[] */
const lines = [];
const boxRect = { width: 150, height: 150, x: 100, y: 200, rotation: 0 };
const center = { x: 0, y: 0 };

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let isDragging = false;
let isResizing = false;
let isRotating = false;
initialize();

/**
 * Equalize touch and pointer/mouse event inputs,
 * and call a handler method passing down the event.
 * @param {(event: Event) => void} handler 
 * @param {PointerEvent | MouseEvent | TouchEvent} event 
 */
function normalize(handler, event) {
    event.preventDefault();
    event = globalThis.TouchEvent && event instanceof TouchEvent ? event.changedTouches[0] : event;
    handler.call(this, event);
}

function setupActions() {
    let locked = false;
    let x = 0;
    let y = 0;
    let startAngle = 0;
    let deltaAngle = 0;

    function rotateStartHandler(event) {
        if (isRotating || isDragging || isResizing) return false;
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        x = event.clientX - center.x;
        y = event.clientY - center.y;
        startAngle = Math.round(R2D * Math.atan2(y, x));
        isRotating = true;
        boxElem.classList.add('active', 'rotate');
        document.body.style.setProperty('--cursor', 'grabbing');
        locked = true;
        return true;
    }

    function rotateEndHandler(event) {
        if (!isRotating || isDragging || isResizing) return false;
        updateBoxRect({ rotation: deltaAngle });
        isRotating = false;
        boxElem.classList.remove('active', 'rotate');
        document.body.style.removeProperty('--cursor');
        locked = false;
        return true;
    }

    function rotateHandler(event) {
        if (!isRotating || isDragging || isResizing) return false;
        x = event.clientX - center.x;
        y = event.clientY - center.y;
        let currentAngle = Math.round(R2D * Math.atan2(y, x));
        deltaAngle = (boxRect.rotation + (currentAngle - startAngle)) % 360;
        updateBoxInfo({ rotation: deltaAngle });
        // Update bounding box
        const boundingRect = getBoundingRect(boxElem, deltaAngle);
        attachBoundingRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height, deltaAngle);
        // Update corner points
        const c1 = getPoint(boxRect.x, boxRect.y, center.x, center.y, deltaAngle * D2R);
        const c2 = getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, deltaAngle * D2R);
        const c3 = getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, deltaAngle * D2R);
        const c4 = getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, deltaAngle * D2R);
        const c1a = getPoint(c1.x, c1.y, (c1.x + c3.x) / 2, (c1.y + c3.y) / 2, -(deltaAngle * D2R));
        const b1 = { x: boundingRect.x, y: boundingRect.y };
        const b2 = { x: boundingRect.x + boundingRect.width, y: boundingRect.y };
        const b3 = { x: boundingRect.x + boundingRect.width, y: boundingRect.y + boundingRect.height };
        const b4 = { x: boundingRect.x, y: boundingRect.y + boundingRect.height };
        const b0 = { x: (b1.x + b3.x) / 2, y: (b1.y + b3.y) / 2 };
        movePoint(points[0], center);
        movePoint(points[1], c1);
        movePoint(points[2], c2);
        movePoint(points[3], c3);
        movePoint(points[4], c4);
        movePoint(points[5], c1a);
        movePoint(points[6], b0);
        movePoint(points[7], b1);
        movePoint(points[8], b2);
        movePoint(points[9], b3);
        movePoint(points[10], b4);
        // Update diagonal lines
        adjustLine(lines[0], c1.x, c1.y, calcLineLength(boxRect.width, boxRect.height), calcLineAngle(boxRect.width, boxRect.height) + deltaAngle);
        adjustLine(lines[1], b1.x, b1.y, calcLineLength(boundingRect.width, boundingRect.height), calcLineAngle(boundingRect.width, boundingRect.height));
        // Update UI
        boxElem.style.setProperty('--rotation', deltaAngle);
        return true;
    }

    function resizeStartHandler(event) {
        if (isResizing || isDragging || isRotating) return false;
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        x = event.clientX - boxRect.width;
        y = event.clientY - boxRect.height;
        isResizing = true;
        boxElem.classList.add('active', 'resize');
        document.body.style.setProperty('--cursor', 'nwse-resize');
        locked = true;
        return true;
    }

    function resizeEndHandler(event) {
        if (!isResizing || isDragging || isRotating) return false;
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.x - (RESIZE_HANDLE_WIDTH / 2));
        y = Math.min(Math.max(event.clientY - y, 0), viewportHeight - boxRect.y - (RESIZE_HANDLE_WIDTH / 2));
        isResizing = false;
        boxElem.classList.remove('active', 'resize');
        document.body.style.removeProperty('--cursor');
        locked = false;
        return true;
    }

    function resizeHandler(event) {
        if (!isResizing || isDragging || isRotating) return false;
        let deltaX = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.x - (RESIZE_HANDLE_WIDTH / 2));
        let deltaY = Math.min(Math.max(event.clientY - y, 0), viewportHeight - boxRect.y - (RESIZE_HANDLE_WIDTH / 2));
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
        updateBoxRect({ width: deltaX, height: deltaY });
        updateBoxInfo({ width: deltaX, height: deltaY });
        // Update bounding box element
        const boundingRect = getBoundingRect(boxElem);
        attachBoundingRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height, boxRect.rotation);
        // Update center point
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        // Update corner points
        const c1 = getPoint(boxRect.x, boxRect.y, center.x, center.y, boxRect.rotation * D2R);
        const c2 = getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, boxRect.rotation * D2R);
        const c3 = getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R);
        const c4 = getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R);
        const c1a = getPoint(c1.x, c1.y, (c1.x + c3.x) / 2, (c1.y + c3.y) / 2, -(boxRect.rotation * D2R));
        const b1 = { x: boundingRect.x, y: boundingRect.y };
        const b2 = { x: boundingRect.x + boundingRect.width, y: boundingRect.y };
        const b3 = { x: boundingRect.x + boundingRect.width, y: boundingRect.y + boundingRect.height };
        const b4 = { x: boundingRect.x, y: boundingRect.y + boundingRect.height };
        const b0 = { x: (b1.x + b3.x) / 2, y: (b1.y + b3.y) / 2 };
        movePoint(points[0], center);
        movePoint(points[1], c1);
        movePoint(points[2], c2);
        movePoint(points[3], c3);
        movePoint(points[4], c4);
        movePoint(points[5], c1a);
        movePoint(points[6], b0);
        movePoint(points[7], b1);
        movePoint(points[8], b2);
        movePoint(points[9], b3);
        movePoint(points[10], b4);
        // TODO: Correct top left corner position
        // Update diagonal lines
        adjustLine(lines[0], c1.x, c1.y, calcLineLength(boxRect.width, boxRect.height), calcLineAngle(boxRect.width, boxRect.height) + boxRect.rotation);
        adjustLine(lines[1], b1.x, b1.y, calcLineLength(boundingRect.width, boundingRect.height), calcLineAngle(boundingRect.width, boundingRect.height));
        // Update UI
        boxElem.style.setProperty('--width', deltaX);
        boxElem.style.setProperty('--height', deltaY);
        return true;
    }

    function dragStartHandler(event) {
        if (isDragging || isResizing || isRotating) return false;
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        x = event.clientX - boxRect.x;
        y = event.clientY - boxRect.y;
        isDragging = true;
        boxElem.classList.add('active', 'move');
        document.body.style.setProperty('--cursor', 'move');
        locked = true;
        return true;
    }

    function dragEndHandler(event) {
        if (!isDragging || isResizing || isRotating) return false;
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - (RESIZE_HANDLE_WIDTH / 2));
        y = Math.min(Math.max(event.clientY - y, ROTATE_HANLE_WIDTH + ROTATE_HANLE_HEIGHT), viewportHeight - boxRect.height - (RESIZE_HANDLE_WIDTH / 2));
        isDragging = false;
        boxElem.classList.remove('active', 'move');
        document.body.style.removeProperty('--cursor');
        locked = false;
        return true;
    }

    function dragHandler(event) {
        if (!isDragging || isResizing || isRotating) return false;
        let deltaX = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - (RESIZE_HANDLE_WIDTH / 2));
        let deltaY = Math.min(Math.max(event.clientY - y, ROTATE_HANLE_WIDTH + ROTATE_HANLE_HEIGHT), viewportHeight - boxRect.height - (RESIZE_HANDLE_WIDTH / 2));
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
        center.x = deltaX + (boxRect.width / 2);
        center.y = deltaY + (boxRect.height / 2);
        updateBoxRect({ x: deltaX, y: deltaY });
        updateBoxInfo({ x: deltaX, y: deltaY });
        // Update bounding box element
        const boundingRect = getBoundingRect(boxElem);
        attachBoundingRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height, boxRect.rotation);
        // Update corner points
        const c1 = getPoint(boxRect.x, boxRect.y, center.x, center.y, boxRect.rotation * D2R);
        const c2 = getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, boxRect.rotation * D2R);
        const c3 = getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R);
        const c4 = getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R);
        const c1a = getPoint(c1.x, c1.y, (c1.x + c3.x) / 2, (c1.y + c3.y) / 2, -(boxRect.rotation * D2R));
        const b1 = { x: boundingRect.x, y: boundingRect.y };
        const b2 = { x: boundingRect.x + boundingRect.width, y: boundingRect.y };
        const b3 = { x: boundingRect.x + boundingRect.width, y: boundingRect.y + boundingRect.height };
        const b4 = { x: boundingRect.x, y: boundingRect.y + boundingRect.height };
        const b0 = { x: (b1.x + b3.x) / 2, y: (b1.y + b3.y) / 2 };
        movePoint(points[0], center);
        movePoint(points[1], c1);
        movePoint(points[2], c2);
        movePoint(points[3], c3);
        movePoint(points[4], c4);
        movePoint(points[5], c1a);
        movePoint(points[6], b0);
        movePoint(points[7], b1);
        movePoint(points[8], b2);
        movePoint(points[9], b3);
        movePoint(points[10], b4);
        // Update diagonal lines
        adjustLine(lines[0], c1.x, c1.y, calcLineLength(boxRect.width, boxRect.height), calcLineAngle(boxRect.width, boxRect.height) + boxRect.rotation);
        adjustLine(lines[1], b1.x, b1.y, calcLineLength(boundingRect.width, boundingRect.height), calcLineAngle(boundingRect.width, boundingRect.height));
        // Update UI
        boxElem.style.setProperty('--x', deltaX);
        boxElem.style.setProperty('--y', deltaY);
        return true;
    }

    function pointerdownHandler(event) {
        // Drag start
        if (!locked && event.target == boxElem) {
            return dragStartHandler.call(boxElem, event);
        }

        // Resize start
        if (!locked && event.target == resizeHandleElem) {
            return resizeStartHandler.call(resizeHandleElem, event);
        }

        // Rotate start
        if (!locked && event.target == rotateHandleElem) {
            return rotateStartHandler.call(rotateHandleElem, event);
        }
    }

    function pointerupHandler(event) {
        if (!isDragging && !isResizing && !isRotating) return false;

        // Drag end
        if (locked && isDragging) {
            return dragEndHandler.call(boxElem, event);
        }

        // Resize end
        if (locked && isResizing) {
            return resizeEndHandler.call(resizeHandleElem, event);
        }

        // Rotate end
        if (locked && isRotating) {
            return rotateEndHandler.call(rotateHandleElem, event);
        }
    }

    function pointermoveHandler(event) {
        if (!isDragging && !isResizing && !isRotating) return false;

        // Dragging..
        if (locked && isDragging) {
            return dragHandler.call(boxElem, event);
        }

        // Resizing..
        if (locked && isResizing) {
            return resizeHandler.call(resizeHandleElem, event);
        }

        // Rotating..
        if (locked && isRotating) {
            return rotateHandler.call(rotateHandleElem, event);
        }
    }

    boxElem.addEventListener('mousedown', normalize.bind(boxElem, pointerdownHandler));
    boxElem.addEventListener('touchstart', normalize.bind(boxElem, pointerdownHandler), { passive: false });
    document.addEventListener('mouseup', normalize.bind(boxElem, pointerupHandler));
    document.addEventListener('touchend', normalize.bind(boxElem, pointerupHandler), { passive: false });
    document.addEventListener('touchcancel', normalize.bind(boxElem, pointerupHandler), { passive: false });
    document.addEventListener('mousemove', normalize.bind(boxElem, pointermoveHandler));
    document.addEventListener('touchmove', normalize.bind(boxElem, pointermoveHandler), { passive: false });
}

/**
 * Update box info labels.
 * @param {object} data 
 * @param {number | undefined} data.x 
 * @param {number | undefined} data.y 
 * @param {number | undefined} data.width 
 * @param {number | undefined} data.height 
 * @param {number | undefined} data.rotation
 */
function updateBoxInfo({ x, y, width, height, rotation }) {
    if (x != null && typeof x == 'number') boxInfoLabels.item(0).textContent = x;
    if (y != null && typeof y == 'number') boxInfoLabels.item(1).textContent = y;
    if (width != null && typeof width == 'number') boxInfoLabels.item(2).textContent = width;
    if (height != null && typeof height == 'number') boxInfoLabels.item(3).textContent = height;
    if (rotation != null && typeof rotation == 'number') boxInfoLabels.item(4).textContent = rotation;
}

/**
 * Update box rect data.
 * @param {object} data 
 * @param {number | undefined} data.x 
 * @param {number | undefined} data.y 
 * @param {number | undefined} data.width 
 * @param {number | undefined} data.height 
 * @param {number | undefined} data.rotation
 */
function updateBoxRect({ x, y, width, height, rotation }) {
    if (x != null && typeof x == 'number') boxRect.x = x;
    if (y != null && typeof y == 'number') boxRect.y = y;
    if (width != null && typeof width == 'number') boxRect.width = width;
    if (height != null && typeof height == 'number') boxRect.height = height;
    if (rotation != null && typeof rotation == 'number') boxRect.rotation = rotation;
}

function initialize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;

    updateBoxInfo({ width: boxRect.width, height: boxRect.height, x: boxRect.x, y: boxRect.y, rotation: boxRect.rotation });
    setupActions();

    // Define center
    center.x = boxRect.x + (boxRect.width / 2);
    center.y = boxRect.y + (boxRect.height / 2);
    // Attach bounding box
    const boundingRect = getBoundingRect(boxElem);
    attachBoundingRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height, boxRect.rotation);
    // Attach corner points
    const c0 = { ...center };
    const c1 = getPoint(boxRect.x, boxRect.y, center.x, center.y, boxRect.rotation * D2R);
    const c2 = getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, boxRect.rotation * D2R);
    const c3 = getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R);
    const c4 = getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R);
    const c1a = getPoint(c1.x, c1.y, (c1.x + c3.x) / 2, (c1.y + c3.y) / 2, -(boxRect.rotation * D2R));
    const b1 = { x: boundingRect.x, y: boundingRect.y };
    const b2 = { x: boundingRect.x + boundingRect.width, y: boundingRect.y };
    const b3 = { x: boundingRect.x + boundingRect.width, y: boundingRect.y + boundingRect.height };
    const b4 = { x: boundingRect.x, y: boundingRect.y + boundingRect.height };
    const b0 = { x: (b1.x + b3.x) / 2, y: (b1.y + b3.y) / 2 };
    attachPoint(c0, c1, c2, c3, c4, c1a, b0, b1, b2, b3, b4);
    // Attach lines
    attachLine(c1.x, c1.y, calcLineLength(boxRect.width, boxRect.height), calcLineAngle(boxRect.width, boxRect.height) + boxRect.rotation);
    attachLine(b1.x, b1.y, calcLineLength(boundingRect.width, boundingRect.height), calcLineAngle(boundingRect.width, boundingRect.height));

    // Viewport resize handler
    window.addEventListener('resize', function () {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    });
}

/**
 * Get element's bounding rect data.
 * @param {HTMLElement} element 
 * @returns {Omit<DOMRect, "toJSON">}
 */
function getBoundingRect(element, rotation) {
    const { rotation: r, ...box } = boxRect;
    rotation = rotation ?? r;
    /** @type {Omit<DOMRect, "toJSON">} */
    const rect = rotation ? element.getBoundingClientRect().toJSON() : box;
    for (const prop in rect) {
        const value = rect[prop];
        rect[prop] = Math.round(value);
    }
    return rect;
}

/**
 * Get coordinates of a point within applied 
 * rotation context and return it.
 * @param {number} x Point's previous X coordinate value
 * @param {number} y Point's previous Y coordinate value
 * @param {number} cx Central point X coordinate value
 * @param {number} cy Central point Y coordinate value
 * @param {number} angle Applied angle of rotation value in radians.
 * @returns {{ x: number, y: number }}
 */
function getPoint(x, y, cx, cy, angle) {
    return {
        x: (x - cx) * Math.cos(angle) - ((y - cy) * Math.sin(angle)) + cx,
        y: (x - cx) * Math.sin(angle) + ((y - cy) * Math.cos(angle)) + cy
    };
}

/**
 * Create a point in the canvas.
 * @param  {...{ x: number, y: number }} coords 
 * @returns {Set<{ x: number, y: number }>}
 */
function attachPoint(...coords) {
    for (const { x, y } of coords) {
        const point = document.createElement('div');
        point.classList.add('point');
        point.style.setProperty('--x', x);
        point.style.setProperty('--y', y);
        points.push(point);
        document.body.append(point);
    }

    return points;
}

/**
 * Move a point in the canvas.
 * @param {HTMLElement} point 
 * @param {object} coords 
 * @param {number} coords.x 
 * @param {number} coords.y  
 */
function movePoint(point, { x, y }) {
    point.style.setProperty('--x', x);
    point.style.setProperty('--y', y);
}

/**
 * Attach bounding box element.
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 * @param {number} rotation
 */
function attachBoundingRect(x, y, width, height, rotation) {
    let boundingRect = document.querySelector('.bounding-rect');
    if (boundingRect) {
        boundingRect.style.setProperty('--opacity', rotation && 1);
        boundingRect.style.setProperty('--width', width);
        boundingRect.style.setProperty('--height', height);
        boundingRect.style.setProperty('--x', x);
        boundingRect.style.setProperty('--y', y);
        return;
    }

    boundingRect = document.createElement('div');
    boundingRect.classList.add('bounding-rect');
    boundingRect.style.setProperty('--width', width);
    boundingRect.style.setProperty('--height', height);
    boundingRect.style.setProperty('--x', x);
    boundingRect.style.setProperty('--y', y);
    document.body.append(boundingRect);
}

/**
 * Create a line in the canvas.
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} angle 
 */
function attachLine(x, y, width, angle) {
    const line = document.createElement('div');
    line.classList.add('line');
    line.style.setProperty('--x', x);
    line.style.setProperty('--y', y);
    line.style.setProperty('--width', width);
    line.style.setProperty('--angle', angle);
    lines.push(line);
    document.body.append(line);
}

/**
 * Create a line in the canvas.
 * @param {HTMLElement} line 
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} angle 
 */
function adjustLine(line, x, y, width, angle) {
    line.style.setProperty('--x', x);
    line.style.setProperty('--y', y);
    line.style.setProperty('--width', width);
    line.style.setProperty('--angle', angle);
}

/**
 * Calculate the length of a line 
 * inside a rectangular shape.
 * @param {number} width  
 * @param {number} height 
 */
function calcLineLength(width, height) {
    return Math.sqrt(width ** 2 / 4 + height ** 2 / 4);
}

/**
 * Calculate angular displacement of 
 * a line inside a rectangular shape. 
 * @param {number} width 
 * @param {number} height 
 * @returns 
 */
function calcLineAngle(width, height) {
    return Math.atan(height / width) * R2D;
}