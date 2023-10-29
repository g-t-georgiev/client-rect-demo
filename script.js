const controlsWrapper = document.querySelector('.controls-wrapper');
const errMsgElem = document.querySelector('.err-msg');
const rotationInputElem = controlsWrapper.querySelector('#rotation-input');
const decrBtn = controlsWrapper.querySelector('.decr-btn');
const incrBtn = controlsWrapper.querySelector('.incr-btn');
const toggleCheckbox = controlsWrapper.querySelector('.toggle-checkbox');
const boxList = document.querySelectorAll('.box');
const pointsList = document.querySelectorAll('.box-center');

let currentRotation;

initializeBox();

function initializeBox() {
    let rotationProp = getCSSProperty('transform', getStyleMap(boxList.item(0)));
    // console.log('Initial rotation property', rotationProp);
    let rotationValue = rotationProp[0]?.angle.value ?? 0;
    // console.log('Initial rotation property value', rotationValue);
    rotationInputElem.value = rotationValue;
    let rotation = Number(rotationValue);
    boxList.forEach(function (box, key) {
        const center = pointsList.item(key);

        if (key + 1 !== 3) {
            updateBoxes(box, center, rotation);
            return;
        }

        updateBoxes(box, center, 0);
    });
    currentRotation = rotation;

    decrBtn.addEventListener('click', decrementRotation);
    incrBtn.addEventListener('click', incrementRotation);
    rotationInputElem.addEventListener('input', debouncer(inputHandler, 500));
    rotationInputElem.addEventListener('change', changeHandler);
    toggleCheckbox.addEventListener('change', checkboxChangeHandler);
    window.addEventListener('resize', resizeHandler);
}

function debouncer(f, timeout) {
    let timeoutId;
    return new Proxy(f, {
        apply(target, thisArg, argsArray) {
            timeoutId && clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                clearTimeout(timeoutId);
                Reflect.apply(target, thisArg, argsArray);
            }, timeout);
        }
    });
}

function checkboxChangeHandler(ev) {
    const checkbox = ev.target;
    pointsList.forEach(function (center) {
        center.classList.toggle('show', checkbox.checked);
    });
}

function resizeHandler() {
    boxList.forEach(function (box, key) {
        const boxRect = box.getBoundingClientRect();
        const center = pointsList.item(key);
        updateBoxes(box, center, currentRotation);
        setCentralPoint(center, boxRect);
        
    });
}

function inputHandler(ev) {
    let rotation = ev.target.value.trim();
    rotation = Number(rotation);
    let isInvalid = isNaN(rotation);

    decrBtn.toggleAttribute('disabled', isInvalid);
    incrBtn.toggleAttribute('disabled', isInvalid);

    if (isInvalid) {
        errMsgElem.textContent = 'Only numbers allowed!';
        return;
    }

    errMsgElem.textContent = '';

    boxList.forEach(function (box, key) {
        const center = pointsList.item(key);
        
        if (key + 1 !== 3) {
            updateRotation(box, rotation);
            updateBoxes(box, center, rotation);
            return;
        }

        updateBoxes(box, center, 0);
    });

    currentRotation = rotation;
}

function changeHandler(ev) {
    let value = ev.target.value.trim();
    let isInvalid = isNaN(value);

    if (value.length === 0) ev.target.value = 0;

    decrBtn.toggleAttribute('disabled', isInvalid);
    incrBtn.toggleAttribute('disabled', isInvalid);

    if (isInvalid) {
        ev.target.focus({ focusVisible: true });
        errMsgElem.textContent = 'Only numbers allowed!';
        return;
    }

    errMsgElem.textContent = '';
}

/**
 * Update rotation value on element.
 * @param {HTMLElement} box 
 * @param {number} value 
 */
function updateRotation(box, value) {
    box.style.setProperty('--rotation', `${value}deg`);
}

function incrementRotation(ev) {
    let value = Number(rotationInputElem.value.trim());

    if (isNaN(value)) return;

    value++;

    rotationInputElem.value = value;
    let rotation = Number(rotationInputElem.value);
    boxList.forEach(function (box, key) {
        const center = pointsList.item(key);
        
        if (key + 1 !== 3) {
            updateRotation(box, rotation)
            updateBoxes(box, center, rotation);
            return;
        }

        updateBoxes(box, center, 0);
    });
}

function decrementRotation(ev) {
    let value = Number(rotationInputElem.value.trim());

    if (isNaN(value)) return;

    value--;

    rotationInputElem.value = value;
    let rotation = Number(rotationInputElem.value);
    boxList.forEach(function (box, key) {
        const center = pointsList.item(key);
        
        if (key + 1 !== 3) {
            updateRotation(box, rotation);
            updateBoxes(box, center, rotation);
            return;
        }

        updateBoxes(box, center, 0);
    });
}

function getBoundingClientRect(element) {
    return element.getBoundingClientRect();
}

function getStyleMap(element) {
    return element.computedStyleMap();
}

function getCSSProperty(property, styleMap) {
    return styleMap.get(property);
}

/**
 * Update box content data.
 * @param {HTMLElement} box 
 * @param {HTMLElement} center 
 * @param {number} rotation 
 */
function updateBoxes(box, center, rotation) {
    box.innerHTML = '';
    const boxRect = getBoundingClientRect(box);
    setCentralPoint(center, boxRect);
    const boxDeatils0 = document.createElement('div');
    const boxDeatils1 = document.createElement('div');
    const boxDeatils2 = document.createElement('div');
    const boxDeatils3 = document.createElement('div');
    const boxDeatils4 = document.createElement('div');
    const boxDeatils5 = document.createElement('div');
    const boxDeatils6 = document.createElement('div');
    boxDeatils0.textContent = `Rotation: ${rotation}deg`;
    boxDeatils1.textContent = `\nTop: ${boxRect.top.toFixed(2)}`;
    boxDeatils2.textContent = `\nLeft: ${boxRect.left.toFixed(2)}`;
    boxDeatils3.textContent = `\nRight: ${boxRect.right.toFixed(2)}`;
    boxDeatils4.textContent = `\nBottom: ${boxRect.bottom.toFixed(2)}`;
    boxDeatils5.textContent = `\nWidth: ${boxRect.width.toFixed(2)}`;
    boxDeatils6.textContent = `\nHeight: ${boxRect.height.toFixed(2)}`;
    box.append(boxDeatils0, boxDeatils1, boxDeatils2, boxDeatils3, boxDeatils4, boxDeatils5, boxDeatils6);
}

/**
 * Takes a DOMRect of an element, to which a rotational 
 * transformation was applied and the applied angle of the rotation, in degress, 
 * returning adjusted client rect.
 * @param {DOMRect} rectangle 
 * @param {number} rotation 
 */
function adjustClientRect(rectangle, rotation) {
    const [cx, cy] = calcCentralPointCoords(rectangle.x, rectangle.y, rectangle.width, rectangle.height);

    // Convert the rotation angle to radians
    const rotationRad = rotation * (Math.PI / 180);

    return new DOMRect(rectangle.x, rectangle.y, rectangle.width, rectangle.height);
}

/**
 * Applies rotation matrix to vector points.
 * @param {number} x 
 * @param {number} y 
 * @param {number} cx 
 * @param {number} cy 
 * @param {number} angle 
 * @returns 
 */
function rotate(x, y, cx, cy, angle) {
    return [
        (x - cx) * Math.cos(angle) - (y - cy) * Math.sin(angle) + cx,
        (x - cx) * Math.sin(angle) + (y - cy) * Math.cos(angle) + cy,
    ];
}

/**
 * Calculate central point x, y coordinates.
 * @param {number} x 
 * @param {number} y 
 * @param {number} width 
 * @param {number} height 
 */
function calcCentralPointCoords(x, y, width, height) {
    const cx = x + (width / 2);
    const cy = y + (height / 2);
    return [cx, cy];
}

/**
 * Pins a central point to specified x, y coordinates, depending on 
 * a bounding rectangular of a target element.
 * @param {HTMLElement} center 
 * @param {DOMRect} boxRect 
 */
function setCentralPoint(center, boxRect) {
    const [cx, cy] = calcCentralPointCoords(boxRect.x, boxRect.y, boxRect.width, boxRect.height);
    // console.log(cx, cy);
    center.style.setProperty('--x', `${cx}px`);
    center.style.setProperty('--y', `${cy}px`);
}