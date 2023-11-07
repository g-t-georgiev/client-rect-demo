/** @type HTMLElement */
const rectElem = document.querySelector('[data-rect]');
/** @type HTMLElement */
const boxElem = document.querySelector('[data-box]');
/** @type HTMLElement */
const rotateHandleElem = document.querySelector('[data-box-rotate-handle]');
/** @type HTMLElement */
const resizeHandleElem = document.querySelector('[data-box-resize-handle]');

const queue = new Set();
const cursors = {
    types: {
        move: document.querySelector('[data-cursor="move"]'),
        resize: document.querySelector('[data-cursor="resize"]'),
        rotate: document.querySelector('[data-cursor="rotate"]'),
    },
    /**
     * @param {SVGAElement} cursor 
     * @param {PointerEvent} event 
     */
    attach(cursor, event) {
        if (!cursor) return;

        if (cursors.current) {
            if (cursor.current.classList.contains('active')) return;
            cursors.current.replaceWith(cursor);
            return;
        }

        document.body.append(cursor);
        cursors.current = cursor;
    },
    /**
     * Detach cursor
     * @param {PointerEvent} event
     */
    detach(event) {
        if (!cursors.current) return;

        if (cursors.current.classList.contains('active')) {
            queue.add(cursors.detach);
        }

        cursors.current.remove();
        cursors.current = null;
    },
    /**
     * Move cursor.
     * @param {PointerEvent} event 
     */
    move(event) {
        if (cursors.current && event) {
            cursors.current.style.setProperty('--x', event.clientX);
            cursors.current.style.setProperty('--y', event.clientY);
        }
    },
    current: null
};

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

cursors.types.move.remove();
cursors.types.resize.remove();
cursors.types.rotate.remove();
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
        toggleCursor(cursors.types.rotate, true);
        center.x = boxRect.x + (boxRect.width / 2);
        center.y = boxRect.y + (boxRect.height / 2);
        let x = event.clientX - center.x;
        let y = event.clientY - center.y;
        startAngle = R2D * Math.atan2(y, x);
        isRotating = true;
    });
    document.addEventListener('mouseup', function (event) {
        if (!isRotating || isResizing || isDragging) return;
        event.preventDefault();
        totalAngle += rotationAngle;
        isRotating = false;
        toggleCursor(cursors.types.rotate, false);
        if (queue.has(cursors.detach)) cursors.detach();
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
        toggleCursor(cursors.types.resize, true);
        x = event.clientX - x;
        y = event.clientY - y;
        isResizing = true;
    });
    document.addEventListener('mouseup', function (event) {
        if (!isResizing || isDragging || isRotating) return;
        event.preventDefault();
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.x - 8.5);
        y = Math.min(Math.max(event.clientY - y, 0), viewportHeight - boxRect.y - 8.5);
        isResizing = false;
        toggleCursor(cursors.types.resize, false);
        if (queue.has(cursors.detach)) cursors.detach();
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
        toggleCursor(cursors.types.move, true);
        x = event.clientX - x;
        y = event.clientY - y;
        isDragging = true;
    });
    document.addEventListener('mouseup', function (event) {
        if (!isDragging || isResizing || isRotating) return;
        event.preventDefault();
        x = Math.min(Math.max(event.clientX - x, 0), viewportWidth - boxRect.width - 8.5);
        y = Math.min(Math.max(event.clientY - y, 25), viewportHeight - boxRect.height - 8.5);
        isDragging = false;
        toggleCursor(cursors.types.move, false);
        if (queue.has(cursors.detach)) cursors.detach();
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

function setupCursors() {
    boxElem.addEventListener('pointermove', cursors.move);
    boxElem.addEventListener('pointerover', function (event) {
        // console.log(event.target);
        if (event.target == resizeHandleElem) {
            cursors.attach.call(this, cursors.types.resize);
            return;
        }

        if (event.target == rotateHandleElem) {
            cursors.attach.call(this, cursors.types.rotate);
            return;
        }

        cursors.attach.call(this, cursors.types.move);
    });
    boxElem.addEventListener('pointerout', cursors.detach);
}

function toggleCursor(cursor, flag = false) {
    if (!cursor) return;
    cursor.classList.toggle('active', flag);
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

    setupCursors();
    setupBox();
    setupActions();

    window.addEventListener('resize', function () {
        viewportWidth = window.innerWidth;
        viewportHeight = window.innerHeight;
    });
}
