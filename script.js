const RESIZE_HANDLE_WIDTH = 17;
const ROTATE_HANLE_WIDTH = 12;
const ROTATE_HANLE_HEIGHT = 13;

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

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let boxRect = { width: 150, height: 150, x: 100, y: 200 };
let isDragging = false;
let isResizing = false;
let isRotating = false;
initialize();

/**
 * Normalize touch and pointer/mouse event inputs.
 * @param {PointerEvent | MouseEvent | TouchEvent} event 
 */
function normalize(event) {
    if (!window.TouchEvent) return event;
    return event instanceof TouchEvent ? event.changedTouches[0] : event;
}

function setupActions() {
    initDraggingActions();
    initResizingActions();
    initRotatingActions();
}

function initRotatingActions() {
    const R2D = 180 / Math.PI;
    const D2R = Math.PI / 180;
    let rect = null;
    let center = { x: 0, y: 0 };
    let startAngle = 0;
    let deltaAngle = 0;
    let rotation = 0;

    function rotateStart(event) {
        if (isDragging || isResizing) return;
        event.preventDefault();
        event = normalize(event);
        center = {
            x: boxRect.x + (boxRect.width / 2),
            y: boxRect.y + (boxRect.height / 2)
        };
        let x = event.clientX - center.x;
        let y = event.clientY - center.y;
        startAngle = Math.round(R2D * Math.atan2(y, x));
        isRotating = true;
        boxElem.classList.add('active', 'rotate');
        document.body.style.setProperty('--cursor', 'grabbing');
    }
    function rotateStop(event) {
        if (!isRotating || isResizing || isDragging) return;
        event.preventDefault();
        event = normalize(event);
        rotation = deltaAngle;
        isRotating = false;
        let c1 = getPoint(boxRect.x, boxRect.y, center.x, center.y, rotation * D2R);
        let c2 = getPoint(boxRect.x + boxRect.width, boxRect.y, center.x, center.y, rotation * D2R);
        let c3 = getPoint(boxRect.x + boxRect.width, boxRect.y + boxRect.height, center.x, center.y, rotation * D2R);
        let c4 = getPoint(boxRect.x, boxRect.y + boxRect.height, center.x, center.y, rotation * D2R);
        let bx1 = Math.min(c1[0], c2[0], c3[0], c4[0]);
        let by1 = Math.min(c1[1], c2[1], c3[1], c4[1]);
        let bx2 = Math.max(c1[0], c2[0], c3[0], c4[0]);
        let by2 = Math.max(c1[1], c2[1], c3[1], c4[1]);
        pinPoint(c1[0], c1[1]);
        pinPoint(c2[0], c2[1]);
        pinPoint(c3[0], c3[1]);
        pinPoint(c4[0], c4[1]);
        pinPoint(bx1, by1);
        pinPoint(bx2, by2);
        boxElem.classList.remove('active', 'rotate');
        document.body.style.removeProperty('--cursor');
        // Attach bounding rect
        if (rotation != 0) {
            rect = boxElem.getBoundingClientRect();
            attachBoundingRect(rect.x, rect.y, rect.width, rect.height);
        }
    }
    function rotate(event) {
        if (!isRotating || isResizing || isDragging) return;
        event.preventDefault();
        event = normalize(event);
        let x = event.clientX - center.x;
        let y = event.clientY - center.y;
        let currentAngle = Math.round(R2D * Math.atan2(y, x));
        deltaAngle = (rotation + (currentAngle - startAngle)) % 360;
        updateBoxInfo({ rotation: deltaAngle });
        boxElem.style.setProperty('--rotation', deltaAngle);
    }

    rotateHandleElem.addEventListener('mousedown', rotateStart);
    rotateHandleElem.addEventListener('touchstart', rotateStart);

    document.addEventListener('mouseup', rotateStop);
    document.addEventListener('touchend', rotateStop, { passive: false });

    document.addEventListener('mousemove', rotate);
    document.addEventListener('touchmove', rotate, { passive: false });
}

function initResizingActions() {
    let x;
    let y;

    function resizeStart(event) {
        if (isDragging || isRotating) return;
        event.preventDefault();
        event = normalize(event);
        x = event.clientX - boxRect.width;
        y = event.clientY - boxRect.height;
        isResizing = true;
        boxElem.classList.add('active', 'resize');
        document.body.style.setProperty('--cursor', 'nwse-resize');
    }
    function resizeStop(event) {
        if (!isResizing || isDragging || isRotating) return;
        event.preventDefault();
        event = normalize(event);
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.x - (RESIZE_HANDLE_WIDTH / 2));
        y = Math.min(Math.max(event.clientY - y, 0), viewportHeight - boxRect.y - (RESIZE_HANDLE_WIDTH / 2));
        isResizing = false;
        boxElem.classList.remove('active', 'resize');
        document.body.style.removeProperty('--cursor');
    }
    function resize(event) {
        if (!isResizing || isDragging || isRotating) return;
        event.preventDefault();
        event = normalize(event);
        let deltaX = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.x - (RESIZE_HANDLE_WIDTH / 2));
        let deltaY = Math.min(Math.max(event.clientY - y, 0), viewportHeight - boxRect.y - (RESIZE_HANDLE_WIDTH / 2));
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
        updateBoxRect({ width: deltaX, height: deltaY });
        updateBoxInfo({ width: deltaX, height: deltaY });
        boxElem.style.setProperty('--width', deltaX);
        boxElem.style.setProperty('--height', deltaY);
    }

    resizeHandleElem.addEventListener('mousedown', resizeStart);
    resizeHandleElem.addEventListener('touchstart', resizeStart);

    document.addEventListener('mouseup', resizeStop);
    document.addEventListener('touchend', resizeStop, { passive: false });

    document.addEventListener('mousemove', resize);
    document.addEventListener('touchmove', resize, { passive: false });
}

function initDraggingActions() {
    let x;
    let y;

    function dragStart(event) {
        if (isResizing || isRotating) return;
        event.preventDefault();
        event = normalize(event);
        x = event.clientX - boxRect.x;
        y = event.clientY - boxRect.y;
        isDragging = true;
        boxElem.classList.add('active', 'move');
        document.body.style.setProperty('--cursor', 'move');
    }
    function dragStop(event) {
        if (!isDragging || isResizing || isRotating) return;
        event.preventDefault();
        event = normalize(event);
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - (RESIZE_HANDLE_WIDTH / 2));
        y = Math.min(Math.max(event.clientY - y, ROTATE_HANLE_WIDTH + ROTATE_HANLE_HEIGHT), viewportHeight - boxRect.height - (RESIZE_HANDLE_WIDTH / 2));
        isDragging = false;
        boxElem.classList.remove('active', 'move');
        document.body.style.removeProperty('--cursor');
    }
    function drag(event) {
        if (!isDragging || isResizing || isRotating) return;
        event.preventDefault();
        event = normalize(event);
        let deltaX = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - (RESIZE_HANDLE_WIDTH / 2));
        let deltaY = Math.min(Math.max(event.clientY - y, ROTATE_HANLE_WIDTH + ROTATE_HANLE_HEIGHT), viewportHeight - boxRect.height - (RESIZE_HANDLE_WIDTH / 2));
        deltaX = Math.round(deltaX);
        deltaY = Math.round(deltaY);
        updateBoxRect({ x: deltaX, y: deltaY });
        updateBoxInfo({ x: deltaX, y: deltaY });
        boxElem.style.setProperty('--x', deltaX);
        boxElem.style.setProperty('--y', deltaY);
    }

    boxElem.addEventListener('mousedown', dragStart);
    boxElem.addEventListener('touchstart', dragStart);

    document.addEventListener('mouseup', dragStop);
    document.addEventListener('touchend', dragStop, { passive: false });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
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
function updateBoxRect({ x, y, width, height }) {
    if (x != null && typeof x == 'number') boxRect.x = x;
    if (y != null && typeof y == 'number') boxRect.y = y;
    if (width != null && typeof width == 'number') boxRect.width = width;
    if (height != null && typeof height == 'number') boxRect.height = height;
}

function initialize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;

    updateBoxInfo({ width: boxRect.width, height: boxRect.height, x: boxRect.x, y: boxRect.y, rotation: 0 });
    setupActions();

    window.addEventListener('resize', function () {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    });
}

/**
 * Attach a bounding rectangle element to 
 * specified [x, y] coordinates and width/height.
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 */
function attachBoundingRect(x, y, width, height) {
    let existingElem = document.querySelector('.bounding-rect');
    if (existingElem) existingElem.remove();

    let boundingRectElem = document.createElement('div');
    boundingRectElem.classList.add('bounding-rect');
    boundingRectElem.style.setProperty('--width', width);
    boundingRectElem.style.setProperty('--height', height);
    boundingRectElem.style.setProperty('--y', y);
    boundingRectElem.style.setProperty('--x', x);
    document.body.append(boundingRectElem);
    let timeoutId = setTimeout(function() {
        clearTimeout(timeoutId);
        boundingRectElem.remove();
    }, 3000);
}

/**
 * Get coordinates of a point in the 
 * context of applied rotational transformation.
 * @param {number} x 
 * @param {number} y 
 * @param {number} cx 
 * @param {number} cy 
 * @param {number} angle 
 * @returns 
 */
function getPoint(x, y, cx, cy, angle) {
    return [
        (x - cx) * Math.cos(angle) - ((y - cy) * Math.sin(angle)) + cx,
        (x - cx) * Math.sin(angle) + ((y - cy) * Math.cos(angle)) + cy
    ];
}

/**
 * Pin a point element to specified [x, y] coordinates.
 * A target count value can be passed down, as well, 
 * serving for a count threshold reference for cleaning up 
 * unnecessary elements on frequent calls of this method.
 * @param {number} x 
 * @param {number} y 
 * @param {number} count 
 */
function pinPoint(x, y, count = 6) {
    let existingElems = document.querySelectorAll('.point');
    if (existingElems.length == count) existingElems.forEach(elem => elem.remove());

    const point = document.createElement('div');
    point.classList.add('point');
    point.style.setProperty('--x', x);
    point.style.setProperty('--y', y);
    let color = getRandomColor();
    point.style.setProperty('--color', color);
    document.body.append(point);
    let timeoutId = setTimeout(function() {
        clearTimeout(timeoutId);
        point.remove();
    }, 3000);
}

/**
 * Generate stringified random 
 * 6-digit hex value color.
 * @returns {string}
 */
function getRandomColor() {
    let n = (Math.random() * 0xfffff * 1000000).toString(16);
    return `#${n.slice(0, 6)}`;
}