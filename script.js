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
    let totalAngle = 0;
    let startAngle = 0;
    let rotationAngle = 0;
    // Rotate
    rotateHandleElem.addEventListener('mousedown', function (event) {
        if (isDragging || isResizing) return;
        event.preventDefault();
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        let x = event.clientX - center.x;
        let y = event.clientY - center.y;
        startAngle = R2D * Math.atan2(y, x);
        isRotating = true;
        boxElem.classList.add('active');
        document.body.style.setProperty('--cursor', 'grabbing');
    });
    document.addEventListener('mouseup', function (event) {
        if (!isRotating || isResizing || isDragging) return;
        event.preventDefault();
        totalAngle += rotationAngle;
        isRotating = false;
        boxElem.classList.remove('active');
        document.body.style.removeProperty('--cursor');
    });
    document.addEventListener('mousemove', function (event) {
        if (!isRotating || isResizing || isDragging) return;
        event.preventDefault();
        let x = event.clientX - center.x;
        let y = event.clientY - center.y;
        let currentAngle = R2D * Math.atan2(y, x);
        rotationAngle = currentAngle - startAngle;
        boxElem.style.setProperty('--rotate', totalAngle + rotationAngle);
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
        boxElem.classList.add('active');
        document.body.style.setProperty('--cursor', 'nwse-resize');
    });
    document.addEventListener('mouseup', function (event) {
        if (!isResizing || isDragging || isRotating) return;
        event.preventDefault();
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.x - 8.5);
        y = Math.min(Math.max(event.clientY - y, 0), viewportHeight - boxRect.y - 8.5);
        isResizing = false;
        boxElem.classList.remove('active');
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
        boxElem.classList.add('active');
        document.body.style.setProperty('--cursor', 'move');
    });
    document.addEventListener('mouseup', function (event) {
        if (!isDragging || isResizing || isRotating) return;
        event.preventDefault();
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - 8.5);
        y = Math.min(Math.max(event.clientY - y, 25), viewportHeight - boxRect.height - 8.5);
        isDragging = false;
        boxElem.classList.remove('active');
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
}

/**
 * Updates box rect state values.
 * @param {object} rect 
 * @param {number | undefined} rect.x 
 * @param {number | undefined} rect.y 
 * @param {number | undefined} rect.width 
 * @param {number | undefined} rect.height 
 * @returns {{ x: number, y: number, width: number, height: number }}
 */
function updateBoxRect({ x, y, width, height }) {
    if (x && typeof x == 'number') boxRect.x = x;
    if (y && typeof y == 'number') boxRect.y = y;
    if (width && typeof width == 'number') boxRect.width = width;
    if (height && typeof height == 'number') boxRect.height = height;
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
