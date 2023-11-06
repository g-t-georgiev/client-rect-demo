/** @type HTMLElement */
const rectElem = document.querySelector('[data-rect]');
/** @type HTMLElement */
const boxElem = document.querySelector('[data-box]');
/** @type HTMLElement */
const rotateHandleElem = document.querySelector('[data-box-rotate-handle]');
/** @type HTMLElement */
const resizeHandleElem = document.querySelector('[data-box-resize-handle]');

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

cursors.types.move.remove();
cursors.types.resize.remove();
cursors.types.rotate.remove();
initialize();

function setupActions() {
    let dragX = boxRect.x;
    let dragY = boxRect.y;

    let resizeX = boxRect.width;
    let resizeY = boxRect.height;

    // Resizing action
    resizeHandleElem.addEventListener('mousedown', function (event) {
        if (isDragging) return;
        
        isResizing = true;
        resizeX = event.clientX - resizeX;
        resizeY = event.clientY - resizeY;
        // console.log('Resize start', resizeX, resizeY);
    });

    document.addEventListener('mousemove', function (event) {
        if (!isResizing || isDragging) return;

        let deltaWidth = Math.max(event.clientX - resizeX, 0);
        let deltaHeight = Math.max(event.clientY - resizeY, 0);
        // console.log('Resizing...', deltaWidth, deltaHeight);
        updateBoxRect({ width: deltaWidth, height: deltaHeight });
        boxElem.style.setProperty('--width', boxRect.width);
        boxElem.style.setProperty('--height', boxRect.height);
    });

    document.addEventListener('mouseup', function (event) {
        if (!isResizing || isDragging) return;
        resizeX = Math.max(event.clientX - resizeX, 0);
        resizeY = Math.max(event.clientY - resizeY, 0);
        // console.log('Resize end', resizeX, resizeY);
        isResizing = false;
    });

    // Dragging action
    boxElem.addEventListener('mousedown', function (event) {
        if (isResizing) return;

        isDragging = true;
        dragX = event.clientX - dragX;
        dragY = event.clientY - dragY;
        // console.log('Drag start', dragX, dragY);
    });
    document.addEventListener('mouseup', function (event) {
        if (!isDragging || isResizing) return;

        dragX = Math.min(Math.max(event.clientX - dragX, 0), viewportWidth - boxRect.width - 8.5);
        dragY = Math.min(Math.max(event.clientY - dragY, 25), viewportHeight - boxRect.height - 8.5);
        // console.log('Drag end', dragX, dragY);
        isDragging = false;
    });
    document.addEventListener('mousemove', function (event) {
        if (!isDragging || isResizing) return;

        let deltaX = Math.min(Math.max(event.clientX - dragX, 0), viewportWidth - boxRect.width - 8.5);
        let deltaY = Math.min(Math.max(event.clientY - dragY, 25), viewportHeight - boxRect.height - 8.5);
        // console.log('Dragging...', deltaX, deltaY);
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
