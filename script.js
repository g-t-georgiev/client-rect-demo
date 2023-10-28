const rotationInputWrapper = document.querySelector('.controls-wrapper');
const errMsgElem = document.querySelector('.err-msg');
const rotationInputElem = rotationInputWrapper.querySelector('#rotation-input');
const decrBtn = rotationInputWrapper.querySelector('.decr-btn');
const incrBtn = rotationInputWrapper.querySelector('.incr-btn');
const box1 = document.querySelector('.box1');
const box2 = document.querySelector('.box2');
const box3 = document.querySelector('.box3');
const box1center = document.querySelector('.box1-center');
const box2center = document.querySelector('.box2-center');
const box3center = document.querySelector('.box3-center');

let currentInputValue;

initializeBox();

function initializeBox() {
    let rotationProp = getCSSProperty('transform', getStyleMap(box1));
    // console.log('Initial rotation property', rotationProp);
    let rotationValue = rotationProp[0]?.angle.value ?? 0;
    // console.log('Initial rotation property value', rotationValue);
    rotationInputElem.value = rotationValue;
    updateBoxes(rotationValue);
    currentInputValue = rotationValue;

    decrBtn.addEventListener('click', decrementRotation);
    incrBtn.addEventListener('click', incrementRotation);
    rotationInputElem.addEventListener('input', debouncer(inputHandler, 500));
    rotationInputElem.addEventListener('change', changeHandler);
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

function resizeHandler() {
    const boxes = document.querySelectorAll('.box');
    const points = document.querySelectorAll('.box-center');
    boxes.forEach(function (box, key) {
        const boxRect = box.getBoundingClientRect();
        const center = points.item(key);
        setCentralPoint(center, boxRect);
    });
}

function inputHandler(ev) {
    let value = ev.target.value.trim();
    let isInvalid = isNaN(value);

    if (value.length === 0) value = 0;

    decrBtn.toggleAttribute('disabled', isInvalid);
    incrBtn.toggleAttribute('disabled', isInvalid);

    if (isInvalid) {
        errMsgElem.textContent = 'Only numbers allowed!';
        return;
    }

    value = Number(value);
    errMsgElem.textContent = '';

    updateRotation(box1, value);
    updateRotation(box2, value);
    updateBoxes(value);
    currentInputValue = value;
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
 * @param {HTMLElement} element 
 * @param {number} value 
 */
function updateRotation(element, value) {
    element.style.setProperty('--rotation', `${value}deg`);
    element.style.setProperty('--rotation', `${value}deg`);
}

function incrementRotation(ev) {
    let value = Number(rotationInputElem.value.trim());

    if (isNaN(value)) return;

    value++;

    rotationInputElem.value = value;
    box1.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
    box2.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
    updateBoxes(rotationInputElem.value);
}

function decrementRotation(ev) {
    let value = Number(rotationInputElem.value.trim());

    if (isNaN(value)) return;

    value--;

    rotationInputElem.value = value;
    box1.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
    box2.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
    updateBoxes(rotationInputElem.value);
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

function updateBoxes(data) {
    const rotationValue = Number(data);

    const box1Rect = getBoundingClientRect(box1);
    setCentralPoint(box1center, box1Rect);
    box1.innerHTML = '';
    const box1Deatils0 = document.createElement('div');
    const box1Deatils1 = document.createElement('div');
    const box1Deatils2 = document.createElement('div');
    const box1Deatils3 = document.createElement('div');
    const box1Deatils4 = document.createElement('div');
    const box1Deatils5 = document.createElement('div');
    const box1Deatils6 = document.createElement('div');
    box1Deatils0.textContent = `Rotation: ${rotationValue}deg`;
    box1Deatils1.textContent = `\nTop: ${box1Rect.top.toFixed(2)}`;
    box1Deatils2.textContent = `\nLeft: ${box1Rect.left.toFixed(2)}`;
    box1Deatils3.textContent = `\nRight: ${box1Rect.right.toFixed(2)}`;
    box1Deatils4.textContent = `\nBottom: ${box1Rect.bottom.toFixed(2)}`;
    box1Deatils5.textContent = `\nWidth: ${box1Rect.width.toFixed(2)}`;
    box1Deatils6.textContent = `\nHeight: ${box1Rect.height.toFixed(2)}`;
    box1.append(box1Deatils0, box1Deatils1, box1Deatils2, box1Deatils3, box1Deatils4, box1Deatils5, box1Deatils6);

    const box2Rect = getBoundingClientRect(box2);
    setCentralPoint(box2center, box2Rect);
    // const normalizedRect = adjustClientRect(box2Rect, rotationValue);
    // console.log('Normalized container rect', normalizedRect);
    box2.innerHTML = '';
    const rect2Details0 = document.createElement('div');
    const rect2Details1 = document.createElement('div');
    const rect2Details2 = document.createElement('div');
    const rect2Details3 = document.createElement('div');
    const rect2Details4 = document.createElement('div');
    const rect2Details5 = document.createElement('div');
    const rect2Details6 = document.createElement('div');
    rect2Details0.textContent = `Rotation: ${rotationValue}deg`;
    rect2Details1.textContent = `\nTop: ${box2Rect.top.toFixed(2)}`;
    rect2Details2.textContent = `\nLeft: ${box2Rect.left.toFixed(2)}`;
    rect2Details3.textContent = `\nRight: ${box2Rect.right.toFixed(2)}`;
    rect2Details4.textContent = `\nBottom: ${box2Rect.bottom.toFixed(2)}`;
    rect2Details5.textContent = `\nWidth: ${box2Rect.width.toFixed(2)}`;
    rect2Details6.textContent = `\nHeight: ${box2Rect.height.toFixed(2)}`;
    box2.append(rect2Details0, rect2Details1, rect2Details2, rect2Details3, rect2Details4, rect2Details5, rect2Details6);

    const box3Rect = getBoundingClientRect(box3);
    setCentralPoint(box3center, box3Rect);
    box3.innerHTML = '';
    const rect3Details0 = document.createElement('div');
    const rect3Details1 = document.createElement('div');
    const rect3Details2 = document.createElement('div');
    const rect3Details3 = document.createElement('div');
    const rect3Details4 = document.createElement('div');
    const rect3Details5 = document.createElement('div');
    const rect3Details6 = document.createElement('div');
    rect3Details0.textContent = 'Rotation: 0deg';
    rect3Details1.textContent = `\nTop: ${box3Rect.top.toFixed(2)}`;
    rect3Details2.textContent = `\nLeft: ${box3Rect.left.toFixed(2)}`;
    rect3Details3.textContent = `\nRight: ${box3Rect.right.toFixed(2)}`;
    rect3Details4.textContent = `\nBottom: ${box3Rect.bottom.toFixed(2)}`;
    rect3Details5.textContent = `\nWidth: ${box3Rect.width.toFixed(2)}`;
    rect3Details6.textContent = `\nHeight: ${box3Rect.height.toFixed(2)}`;
    box3.append(rect3Details0, rect3Details1, rect3Details2, rect3Details3, rect3Details4, rect3Details5, rect3Details6);
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
    center.style.setProperty('--x', `${cx}px`);
    center.style.setProperty('--y', `${cy}px`);
}