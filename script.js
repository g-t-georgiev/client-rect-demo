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

const boxRect = {
    width: 150,
    height: 150,
    x: 100,
    y: 200, 
    rotation: 0
}

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let isDragging = false;
let isResizing = false;
let isRotating = false;
initialize();

/**
 * Normalize touch and pointer/mouse event inputs.
 * @param {PointerEvent | MouseEvent | TouchEvent} event 
 */
function normalize(event) {
    return event instanceof TouchEvent ? event.changedTouches[0] : event;
}

function setupActions() {
    initDraggingActions();
    initResizingActions();
    initRotatingActions();
}

function initRotatingActions() {
    const R2D = 180 / Math.PI;
    let center;
    let startAngle;
    let prevAngle;

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
        updateBoxInfo({ rotation: prevAngle });
        updateBoxRect({ rotation: prevAngle });
        isRotating = false;
        boxElem.classList.remove('active', 'rotate');
        document.body.style.removeProperty('--cursor');
        // Attach bounding rect
        if (boxRect.rotation != 0) {
            let boundingRect = boxElem.getBoundingClientRect();
            attachBoundingRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height);
        }
    }
    function rotate(event) {
        if (!isRotating || isResizing || isDragging) return;
        event.preventDefault();
        event = normalize(event);
        let x = event.clientX - center.x;
        let y = event.clientY - center.y;
        let currentAngle = Math.round(R2D * Math.atan2(y, x));
        let deltaAngle = (currentAngle - startAngle) % 360;
        prevAngle = (boxRect.rotation + deltaAngle) % 360;
        updateBoxInfo({ rotation: prevAngle });
        boxElem.style.setProperty('--rotation', prevAngle);
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
        updateBoxRect({ width: deltaX, height: deltaY });
        updateBoxInfo({ width: boxRect.width, height: boxRect.height });
        boxElem.style.setProperty('--width', boxRect.width);
        boxElem.style.setProperty('--height', boxRect.height);
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
        updateBoxRect({ x: deltaX, y: deltaY });
        updateBoxInfo({ x: boxRect.x, y: boxRect.y });
        boxElem.style.setProperty('--x', boxRect.x);
        boxElem.style.setProperty('--y', boxRect.y);
    }

    boxElem.addEventListener('mousedown', dragStart);
    boxElem.addEventListener('touchstart', dragStart);

    document.addEventListener('mouseup', dragStop);
    document.addEventListener('touchend', dragStop, { passive: false });

    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
}

function setupBox() {
    boxElem.style.setProperty('--width', boxRect.width);
    boxElem.style.setProperty('--height', boxRect.height);
    boxElem.style.setProperty('--x', boxRect.x);
    boxElem.style.setProperty('--y', boxRect.y);
    boxElem.style.setProperty('--rotation', boxRect.rotation);
    updateBoxInfo(boxRect);
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
 * Updates box rect state values.
 * @param {object} rect 
 * @param {number | undefined} rect.x 
 * @param {number | undefined} rect.y 
 * @param {number | undefined} rect.width 
 * @param {number | undefined} rect.height 
 * @param {number | undefined} rect.rotation 
 */
function updateBoxRect({ x, y, width, height, rotation }) {
    if (x != null && typeof x == 'number') boxRect.x = x;
    if (y != null && typeof y == 'number') boxRect.y = y;
    if (width != null && typeof width == 'number') boxRect.width = width;
    if (height != null && typeof height == 'number') boxRect.height = height;
    if (rotation != null && typeof rotation == 'number') boxRect.rotation = rotation;
    return boxRect;
}

function initialize() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;

    setupBox();
    setupActions();

    window.addEventListener('resize', function () {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    });
}

function attachBoundingRect(x, y, width, height) {
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
    }, 1000);
}