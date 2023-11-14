import { Point } from "./modules/Point.js"
import { Line } from "./modules/Line.js"
import { BoundingBox } from "./modules/BoundingBox.js"

const RESIZE_HANDLE_WIDTH = 17;
const ROTATE_HANLE_WIDTH = 12;
const ROTATE_HANLE_HEIGHT = 13;

const R2D = 180 / Math.PI;
const D2R = Math.PI / 180;

/** @type HTMLElement */
const canvas = document.querySelector('[data-canvas]');
/** @type HTMLElement */
const boxElem = document.querySelector('[data-box]');
/** @type HTMLElement */
const rotateHandleElem = document.querySelector('[data-box-rotate-handle]');
/** @type HTMLElement */
const resizeHandleElem = document.querySelector('[data-box-resize-handle]');
/** @type HTMLElement */
const boxInfoElem = document.querySelector('[data-box-info]');
const boxInfoLabels = boxInfoElem.children;
/** @type Point[] */
const points = [];
/** @type Line[] */
const lines = [];
const boxRect = { width: 150, height: 150, x: 100, y: 200, rotation: 0 };
const center = new Point(0, 0);

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let isDragging = false;
let isResizing = false;
let isRotating = false;
/** @type BoundingBox */
let boundingBox;
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
        center.update(
            (boxRect.x + window.scrollX) - window.scrollX + (boxRect.width / 2),
            (boxRect.y + window.scrollY) - window.scrollY + (boxRect.height / 2)
        );
        x = event.clientX - center.x;
        y = event.clientY - center.y;
        startAngle = R2D * Math.atan2(y, x);
        startAngle = Math.round(startAngle % 360);
        startAngle = startAngle < 0 ? 360 + startAngle : startAngle;
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
        let currentAngle = R2D * Math.atan2(y, x);
        deltaAngle = boxRect.rotation + (currentAngle - startAngle);
        deltaAngle = Math.round(deltaAngle % 360);
        deltaAngle  = deltaAngle < 0 ? 360 + deltaAngle : deltaAngle;
        updateBoxInfo({ rotation: deltaAngle });
        // Update bounding box
        const boundingRect = getBoundingRect(boxElem, deltaAngle);
        boundingBox.update(boundingRect.x, boundingRect.y, 0, boundingRect.width, boundingRect.height, deltaAngle);
        // Update corner points
        points[1].update(getPoint(boxRect.x, boxRect.y, center.x, center.y, deltaAngle * D2R));
        points[2].update(getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, deltaAngle * D2R));
        points[3].update(getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, deltaAngle * D2R));
        points[4].update(getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, deltaAngle * D2R));
        points[5].update(getPoint(points[1].x, points[1].y, (points[1].x + points[3].x) / 2, (points[1].y + points[3].y) / 2, -(deltaAngle * D2R)));
        points[7].update({ x: boundingRect.x, y: boundingRect.y });
        points[8].update({ x: boundingRect.x + boundingRect.width, y: boundingRect.y });
        points[9].update({ x: boundingRect.x + boundingRect.width, y: boundingRect.y + boundingRect.height });
        points[10].update({ x: boundingRect.x, y: boundingRect.y + boundingRect.height });
        points[6].update({ x: (points[7].x + points[9].x) / 2, y: (points[7].y + points[9].y) / 2 });
        // Update diagonal lines
        lines[0].update(points[1].x, points[1].y, 0, calcLineLength(boxRect.width, boxRect.height), calcLineAngle(boxRect.width, boxRect.height) + deltaAngle);
        lines[1].update(points[7].x, points[7].y, 0, calcLineLength(boundingRect.width, boundingRect.height), calcLineAngle(boundingRect.width, boundingRect.height));
        // Update UI
        boxElem.style.setProperty('--rotation', deltaAngle);
        return true;
    }

    function resizeStartHandler(event) {
        if (isResizing || isDragging || isRotating) return false;
        center.update(
            (boxRect.x + window.scrollX) - window.scrollX + (boxRect.width / 2),
            (boxRect.y + window.scrollY) - window.scrollY + (boxRect.height / 2)
        );
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
        center.update(
            (boxRect.x + window.scrollX) - window.scrollX + (boxRect.width / 2),
            (boxRect.y + window.scrollY) - window.scrollY + (boxRect.height / 2)
        );
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
        boundingBox.update(boundingRect.x, boundingRect.y, 0, boundingRect.width, boundingRect.height, boxRect.rotation);
        // Update center point
        center.update(
            (boxRect.x + window.scrollX) - window.scrollX + (boxRect.width / 2),
            (boxRect.y + window.scrollY) - window.scrollY + (boxRect.height / 2)
        );
        // Update corner points
        points[1].update(getPoint(boxRect.x, boxRect.y, center.x, center.y, boxRect.rotation * D2R));
        points[2].update(getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, boxRect.rotation * D2R));
        points[3].update(getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R));
        points[4].update(getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R));
        points[5].update(getPoint(points[1].x, points[1].y, (points[1].x + points[3].x) / 2, (points[1].y + points[3].y) / 2, -(boxRect.rotation * D2R)));
        points[7].update(boundingRect.x, boundingRect.y);
        points[8].update(boundingRect.x + boundingRect.width, boundingRect.y);
        points[9].update(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
        points[10].update(boundingRect.x, boundingRect.y + boundingRect.height);
        points[6].update((points[7].x + points[9].x) / 2, (points[7].y + points[9].y) / 2);
        // TODO: Correct top left corner position
        // Update diagonal lines
        lines[0].update(points[1].x, points[1].y, 0, calcLineLength(boxRect.width, boxRect.height), calcLineAngle(boxRect.width, boxRect.height) + boxRect.rotation);
        lines[1].update(points[7].x, points[7].y, 0, calcLineLength(boundingRect.width, boundingRect.height), calcLineAngle(boundingRect.width, boundingRect.height));
        // Update UI
        boxElem.style.setProperty('--width', deltaX);
        boxElem.style.setProperty('--height', deltaY);
        return true;
    }

    function dragStartHandler(event) {
        if (isDragging || isResizing || isRotating) return false;
        center.update(
            (boxRect.x + window.scrollX) - window.scrollX + (boxRect.width / 2),
            (boxRect.y + window.scrollY) - window.scrollY + (boxRect.height / 2)
        );
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
        center.update(
            (boxRect.x + window.scrollX) - window.scrollX + (boxRect.width / 2),
            (boxRect.y + window.scrollY) - window.scrollY + (boxRect.height / 2)
        );
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
        // if (boxRect.rotation != 0) {
        //     const thresholds = [points[1], points[2], points[3], points[4]];
        //     const t1 = thresholds.find(point => Math.round(point.x) <= 0 || Math.round(point.y) <= 0);
        //     const t2 = thresholds.find(point => Math.round(point.x) >= viewportWidth || Math.round(point.y) >= viewportHeight);
        //     if (t1 || t2) return true;
        // }
        let deltaX = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - (RESIZE_HANDLE_WIDTH / 2));
        let deltaY = Math.min(Math.max(event.clientY - y, ROTATE_HANLE_WIDTH + ROTATE_HANLE_HEIGHT), viewportHeight - boxRect.height - (RESIZE_HANDLE_WIDTH / 2));
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
        center.update(
            (boxRect.x + window.scrollX) - window.scrollX + (boxRect.width / 2),
            (boxRect.y + window.scrollY) - window.scrollY + (boxRect.height / 2)
        );
        updateBoxRect({ x: deltaX, y: deltaY });
        updateBoxInfo({ x: deltaX, y: deltaY });
        // Update box corner points
        points[1].update(getPoint(boxRect.x, boxRect.y, center.x, center.y, boxRect.rotation * D2R));
        points[2].update(getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, boxRect.rotation * D2R));
        points[3].update(getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R));
        points[4].update(getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R));
        points[5].update(getPoint(points[1].x, points[1].y, (points[1].x + points[3].x) / 2, (points[1].y + points[3].y) / 2, -(boxRect.rotation * D2R)));
        // Update bounding box element
        const boundingRect = getBoundingRect(boxElem);
        boundingBox.update(boundingRect.x, boundingRect.y, 0, boundingRect.width, boundingRect.height, boxRect.rotation);
        // Update bounding box points
        points[7].update(boundingRect.x, boundingRect.y);
        points[8].update(boundingRect.x + boundingRect.width, boundingRect.y);
        points[9].update(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
        points[10].update(boundingRect.x, boundingRect.y + boundingRect.height);
        points[6].update((points[7].x + points[9].x) / 2, (points[7].y + points[9].y) / 2);
        // Update diagonal lines
        lines[0].update(points[1].x, points[1].y, 0, calcLineLength(boxRect.width, boxRect.height), calcLineAngle(boxRect.width, boxRect.height) + boxRect.rotation);
        lines[1].update(points[7].x, points[7].y, 0, calcLineLength(boundingRect.width, boundingRect.height), calcLineAngle(boundingRect.width, boundingRect.height));
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
    center.update(
        (boxRect.x + window.scrollX) - window.scrollX + (boxRect.width / 2),
        (boxRect.y + window.scrollY) - window.scrollY + (boxRect.height / 2)
    );
    // Attach bounding box
    const boundingRect = getBoundingRect(boxElem);
    boundingBox = new BoundingBox(boundingRect.x, boundingRect.y, 0, boundingRect.width, boundingRect.height, boxRect.rotation);
    // Attach corner points
    const c1 = new Point(getPoint(boxRect.x, boxRect.y, center.x, center.y, boxRect.rotation * D2R));
    const c2 = new Point(getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, boxRect.rotation * D2R));
    const c3 = new Point(getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R));
    const c4 = new Point(getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, boxRect.rotation * D2R));
    const c1a = new Point(getPoint(c1.x, c1.y, (c1.x + c3.x) / 2, (c1.y + c3.y) / 2, -(boxRect.rotation * D2R)));
    const b1 = new Point(boundingRect.x, boundingRect.y);
    const b2 = new Point(boundingRect.x + boundingRect.width, boundingRect.y);
    const b3 = new Point(boundingRect.x + boundingRect.width, boundingRect.y + boundingRect.height);
    const b4 = new Point(boundingRect.x, boundingRect.y + boundingRect.height);
    const b0 = new Point((b1.x + b3.x) / 2, (b1.y + b3.y) / 2);
    points.push(center, c1, c2, c3, c4, c1a, b0, b1, b2, b3, b4);
    // Attach lines
    const l1 = new Line(c1.x, c1.y, 0, calcLineLength(boxRect.width, boxRect.height), calcLineAngle(boxRect.width, boxRect.height) + boxRect.rotation);
    const l2 = new Line(b1.x, b1.y, 0, calcLineLength(boundingRect.width, boundingRect.height), calcLineAngle(boundingRect.width, boundingRect.height));
    lines.push(l1, l2);

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