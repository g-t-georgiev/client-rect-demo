/** @type HTMLElement */
const rectElem = document.querySelector('[data-rect]');
/** @type HTMLElement */
const boxElem = document.querySelector('[data-box]');
/** @type HTMLElement */
const rotateHandleElem = document.querySelector('[data-box-rotate-handle]');
/** @type HTMLElement */
const resizeHandleElem = document.querySelector('[data-box-resize-handle]');

const boxRect = {
    width: 150,
    height: 150,
    x: 350,
    y: 350, 
    rotation: 0
}

let viewportWidth = window.innerWidth;
let viewportHeight = window.innerHeight;
let isDragging = false;
let isResizing = false;
let isRotating = false;
initialize();

function setupActions() {
    initDraggingActions();
    initResizingActions();
    initRotatingActions();
}

function initRotatingActions() {
    const R2D = 180 / Math.PI;
    let center = { x: 0, y: 0 };
    let startAngle;
    let prevAngle;
    // Rotate
    rotateHandleElem.addEventListener('mousedown', function (event) {
        if (isDragging || isResizing) return;
        event.preventDefault();
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        let x = event.clientX - center.x;
        let y = event.clientY - center.y;
        startAngle = Math.round(R2D * Math.atan2(y, x));
        isRotating = true;
        boxElem.classList.add('active', 'rotate');
        document.body.style.setProperty('--cursor', 'grabbing');
    });
    document.addEventListener('mouseup', function (event) {
        if (!isRotating || isResizing || isDragging) return;
        event.preventDefault();
        updateBoxRect({ rotation: prevAngle });
        isRotating = false;
        boxElem.classList.remove('active', 'rotate');
        document.body.style.removeProperty('--cursor');
        // Attach bounding rect
        if (boxRect.rotation != 0) {
            let boundingRect = boxElem.getBoundingClientRect();
            attachBoundingRect(boundingRect.x, boundingRect.y, boundingRect.width, boundingRect.height);
        }
    });
    document.addEventListener('mousemove', function (event) {
        if (!isRotating || isResizing || isDragging) return;
        event.preventDefault();
        let x = event.clientX - center.x;
        let y = event.clientY - center.y;
        let currentAngle = Math.round(R2D * Math.atan2(y, x));
        let deltaAngle = (currentAngle - startAngle) % 360;
        prevAngle = (boxRect.rotation + deltaAngle) % 360;
        boxElem.style.setProperty('--rotation', prevAngle);
    });
}

function initResizingActions() {
    let x = boxRect.width;
    let y = boxRect.height;
    // Resize
    resizeHandleElem.addEventListener('mousedown', function (event) {
        if (isDragging || isRotating) return;
        event.preventDefault();
        x = event.clientX - x;
        y = event.clientY - y;
        isResizing = true;
        boxElem.classList.add('active', 'resize');
        document.body.style.setProperty('--cursor', 'nwse-resize');
    });
    document.addEventListener('mouseup', function (event) {
        if (!isResizing || isDragging || isRotating) return;
        event.preventDefault();
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.x - 8.5);
        y = Math.min(Math.max(event.clientY - y, 0), viewportHeight - boxRect.y - 8.5);
        isResizing = false;
        boxElem.classList.remove('active', 'resize');
        document.body.style.removeProperty('--cursor');
    });
    document.addEventListener('mousemove', function (event) {
        if (!isResizing || isDragging || isRotating) return;
        event.preventDefault();
        let deltaX = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.x - 8.5);
        let deltaY = Math.min(Math.max(event.clientY - y, 0), viewportHeight - boxRect.y - 8.5);
        updateBoxRect({ width: deltaX, height: deltaY });
        boxElem.style.setProperty('--width', boxRect.width);
        boxElem.style.setProperty('--height', boxRect.height);
    });
}

function initDraggingActions() {
    let x = boxRect.x;
    let y = boxRect.y;
    // Drag
    boxElem.addEventListener('mousedown', function (event) {
        if (isResizing || isRotating) return;
        event.preventDefault();
        x = event.clientX - x;
        y = event.clientY - y;
        isDragging = true;
        boxElem.classList.add('active', 'move');
        document.body.style.setProperty('--cursor', 'move');
    });
    document.addEventListener('mouseup', function (event) {
        if (!isDragging || isResizing || isRotating) return;
        event.preventDefault();
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - 8.5);
        y = Math.min(Math.max(event.clientY - y, 25), viewportHeight - boxRect.height - 8.5);
        isDragging = false;
        boxElem.classList.remove('active', 'move');
        document.body.style.removeProperty('--cursor');
    });
    document.addEventListener('mousemove', function (event) {
        if (!isDragging || isResizing || isRotating) return;
        event.preventDefault();
        let deltaX = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - 8.5);
        let deltaY = Math.min(Math.max(event.clientY - y, 25), viewportHeight - boxRect.height - 8.5);
        updateBoxRect({ x: deltaX, y: deltaY });
        boxElem.style.setProperty('--x', boxRect.x);
        boxElem.style.setProperty('--y', boxRect.y);
    });
}

function setupBox() {
    boxElem.style.setProperty('--width', boxRect.width);
    boxElem.style.setProperty('--height', boxRect.height);
    boxElem.style.setProperty('--x', boxRect.x);
    boxElem.style.setProperty('--y', boxRect.y);
    boxElem.style.setProperty('--rotation', boxRect.rotation);
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