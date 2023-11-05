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
    let dragStartX = boxRect.x;
    let dragStartY = boxRect.y;

    let resizeStartX = boxRect.width;
    let resizeStartY = boxRect.height;

    // Resizing action
    resizeHandleElem.addEventListener('mousedown', function (event) {
        if (isDragging) return;
        console.log('Resize start', resizeStartX, resizeStartY);
        isResizing = true;
        resizeStartX = event.clientX - resizeStartX;
        resizeStartY = event.clientY - resizeStartY;
    });

    document.addEventListener('mousemove', function (event) {
        if (!isResizing || isDragging) return;

        let deltaWidth = event.clientX - resizeStartX;
        let deltaHeight = event.clientY - resizeStartY;

        console.log('Resizing...', deltaWidth, deltaHeight);
        boxElem.style.setProperty('--width', Math.max(0, deltaWidth / viewportWidth));
        boxElem.style.setProperty('--height', Math.max(0, deltaHeight / viewportHeight));
        // rotateHandleElem.style.setProperty('--line-height', );
        boxRect.width = deltaWidth;
        boxRect.height = deltaHeight;
    });

    document.addEventListener('mouseup', function (event) {
        if (!isResizing || isDragging) return;
        console.log('Resize end');
        resizeStartX = event.clientX - resizeStartX;
        resizeStartY = event.clientY - resizeStartY;
        isResizing = false;
    });

    // Dragging action
    boxElem.addEventListener('mousedown', function (event) {
        if (isResizing) return;

        isDragging = true;
        dragStartX = event.clientX - dragStartX;
        dragStartY = event.clientY - dragStartY;
    });
    document.addEventListener('mouseup', function (event) {
        if (!isDragging || isResizing) return;

        dragStartX = event.clientX - dragStartX;
        dragStartY = event.clientY - dragStartY;
        isDragging = false;
    });
    document.addEventListener('mousemove', function (event) {
        if (!isDragging || isResizing) return;

        let deltaX = event.clientX - dragStartX;
        let deltaY = event.clientY - dragStartY;
        boxElem.style.setProperty('--x', Math.max(0, Math.min(deltaX / viewportWidth, 100)));
        boxElem.style.setProperty('--y', Math.max(0, Math.min(deltaY / viewportHeight, 100)));
        boxRect.x = deltaX;
        boxRect.y = deltaY;
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
    boxElem.style.setProperty('--width', boxRect.width / viewportWidth);
    boxElem.style.setProperty('--height', boxRect.height / viewportHeight);
    boxElem.style.setProperty('--x', Math.max(0, Math.min(boxRect.x / viewportWidth, 80)));
    boxElem.style.setProperty('--y', Math.max(0, Math.min(boxRect.y / viewportHeight, 80)));
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
        setupBox();
    });
}