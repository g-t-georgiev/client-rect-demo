const rotatorBoxElem = document.querySelector('.rotator');
const errMsgElem = document.querySelector('.err-msg');
const rotationInputElem = rotatorBoxElem.querySelector('[type="text"]');
const decrBtn = rotatorBoxElem.querySelector('.decr-btn');
const incrBtn = rotatorBoxElem.querySelector('.incr-btn');
const rotatedContainer = document.querySelector('.rotated-box-1');
const rotatedContainer2 = document.querySelector('.rotated-box-2');
const nonrotatedContainer = document.querySelector('.non-rotated');

let currentInputValue;

initializeBox();

function initializeBox() {
    let rotationProp = getCSSProperty('transform', getStyleMap(rotatedContainer));
    // console.log('Initial rotation property', rotationProp);
    let rotationValue = rotationProp[0]?.angle.value ?? 0;
    // console.log('Initial rotation property value', rotationValue);
    rotationInputElem.value = rotationValue;
    updateBoxes(rotationValue);
    currentInputValue = rotationValue;

    decrBtn.addEventListener('click', decreaseRotationHandler);
    incrBtn.addEventListener('click', increateRotationHandler);
    rotationInputElem.addEventListener('input', debouncer(onInputHandler, 500));
    rotationInputElem.addEventListener('change', onChangeHandler);
}

function debouncer(f, timeout) {
    let timeoutId;
    return new Proxy(f, { 
        apply(target, thisArg, argsArray) {
            timeoutId && clearTimeout(timeoutId);
            timeoutId = setTimeout(function () {
                clearTimeout(timeoutId);
                console.log(argsArray);
                Reflect.apply(target, thisArg, argsArray);
            }, timeout);
        } 
    });
}

function onInputHandler(ev) {
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

    rotatedContainer.style.setProperty('--rotation', `${value}deg`);
    rotatedContainer2.style.setProperty('--rotation', `${value}deg`);
    updateBoxes(value);
    currentInputValue = value;
}

function onChangeHandler(ev) {
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

function increateRotationHandler(ev) {
    let value = Number(rotationInputElem.value.trim());

    if (isNaN(value)) return;

    value++;

    rotationInputElem.value = value;
    rotatedContainer.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
    rotatedContainer2.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
    updateBoxes(rotationInputElem.value);
}

function decreaseRotationHandler(ev) {
    let value = Number(rotationInputElem.value.trim());

    if (isNaN(value)) return;

    value--;

    rotationInputElem.value = value;
    rotatedContainer.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
    rotatedContainer2.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
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
    const rotatedContainerRect = getBoundingClientRect(rotatedContainer);
    rotatedContainer.innerHTML = '';
    const rect1Details0 = document.createElement('div');
    const rect1Details1 = document.createElement('div');
    const rect1Details2 = document.createElement('div');
    const rect1Details3 = document.createElement('div');
    const rect1Details4 = document.createElement('div');
    const rect1Details5 = document.createElement('div');
    const rect1Details6 = document.createElement('div');
    rect1Details0.textContent = `Rotation: ${rotationValue}deg`;
    rect1Details1.textContent = `\nTop: ${rotatedContainerRect.top.toFixed(2)}`;
    rect1Details2.textContent = `\nLeft: ${rotatedContainerRect.left.toFixed(2)}`;
    rect1Details3.textContent = `\nRight: ${rotatedContainerRect.right.toFixed(2)}`;
    rect1Details4.textContent = `\nBottom: ${rotatedContainerRect.bottom.toFixed(2)}`;
    rect1Details5.textContent = `\nWidth: ${rotatedContainerRect.width.toFixed(2)}`;
    rect1Details6.textContent = `\nHeight: ${rotatedContainerRect.height.toFixed(2)}`;
    rotatedContainer.append(rect1Details0, rect1Details1, rect1Details2, rect1Details3, rect1Details4, rect1Details5, rect1Details6);

    const nonrotatedContainerRect = getBoundingClientRect(nonrotatedContainer);
    nonrotatedContainer.innerHTML = '';
    const rect2Details0 = document.createElement('div');
    const rect2Details1 = document.createElement('div');
    const rect2Details2 = document.createElement('div');
    const rect2Details3 = document.createElement('div');
    const rect2Details4 = document.createElement('div');
    const rect2Details5 = document.createElement('div');
    const rect2Details6 = document.createElement('div');
    rect2Details0.textContent = 'Rotation: 0deg';
    rect2Details1.textContent = `\nTop: ${nonrotatedContainerRect.top.toFixed(2)}`;
    rect2Details2.textContent = `\nLeft: ${nonrotatedContainerRect.left.toFixed(2)}`;
    rect2Details3.textContent = `\nRight: ${nonrotatedContainerRect.right.toFixed(2)}`;
    rect2Details4.textContent = `\nBottom: ${nonrotatedContainerRect.bottom.toFixed(2)}`;
    rect2Details5.textContent = `\nWidth: ${nonrotatedContainerRect.width.toFixed(2)}`;
    rect2Details6.textContent = `\nHeight: ${nonrotatedContainerRect.height.toFixed(2)}`;
    nonrotatedContainer.append(rect2Details0, rect2Details1, rect2Details2, rect2Details3, rect2Details4, rect2Details5, rect2Details6);

    const rotatedContainer2Rect = getBoundingClientRect(rotatedContainer2);
    const normalizedRect = normalizeClientRect(rotatedContainer2, rotatedContainer2Rect, rotationValue);
    console.log('Normalized container rect', normalizedRect);
    rotatedContainer2.innerHTML = '';
    const rect3Details0 = document.createElement('div');
    const rect3Details1 = document.createElement('div');
    const rect3Details2 = document.createElement('div');
    const rect3Details3 = document.createElement('div');
    const rect3Details4 = document.createElement('div');
    const rect3Details5 = document.createElement('div');
    const rect3Details6 = document.createElement('div');
    rect3Details0.textContent = `Rotation: ${rotationValue}deg`;
    rect3Details1.textContent = `\nTop: ${rotatedContainer2Rect.top.toFixed(2)}`;
    rect3Details2.textContent = `\nLeft: ${rotatedContainer2Rect.left.toFixed(2)}`;
    rect3Details3.textContent = `\nRight: ${rotatedContainer2Rect.right.toFixed(2)}`;
    rect3Details4.textContent = `\nBottom: ${rotatedContainer2Rect.bottom.toFixed(2)}`;
    rect3Details5.textContent = `\nWidth: ${rotatedContainer2Rect.width.toFixed(2)}`;
    rect3Details6.textContent = `\nHeight: ${rotatedContainer2Rect.height.toFixed(2)}`;
    rotatedContainer2.append(rect3Details0, rect3Details1, rect3Details2, rect3Details3, rect3Details4, rect3Details5, rect3Details6);
}

/**
 * Takes a DOMRect of an element, to which a rotational 
 * transformation was applied and the angle of the rotation applied, 
 * calculating and returning normalized client rect values.
 * @param {HTMLElement} element
 * @param {DOMRect} clientRect 
 * @param {number} rotationAngle 
 */
function normalizeClientRect(element, clientRect, rotationAngle) {
    // Convert the rotation angle to radians
    const radians = rotationAngle * (Math.PI / 180);

    return new DOMRect(clientRect.x, clientRect.y, clientRect.width, clientRect.height);
}