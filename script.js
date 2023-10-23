const rotatorBoxElem = document.querySelector('.rotator');
const rotationInputElem = rotatorBoxElem.querySelector('[type="text"]');
const decrBtn = rotatorBoxElem.querySelector('.decr-btn');
const incrBtn = rotatorBoxElem.querySelector('.incr-btn');
const rotatedContainer = document.querySelector('.rotated');
const nonrotatedContainer = document.querySelector('.non-rotated');

let currentInputValue;

initializeBox();

function initializeBox() {
    const rotationProp = getCSSProperty('transform', getStyleMap(rotatedContainer));
    const rotationValue = rotationProp[0].angle.value;
    rotationInputElem.value = rotationValue;
    updateBoxes(rotationValue);
    currentInputValue = rotationValue;

    decrBtn.addEventListener('click', decreaseRotationHandler);
    incrBtn.addEventListener('click', increateRotationHandler);
    rotationInputElem.addEventListener('input', onInputHandler);
}

function onInputHandler(ev) {
    let value = ev.currentTarget.value.trim();

    if (isNaN(value)) {
        alert('Only numbers allowed!');
        ev.currentTarget.value = currentInputValue;
        return;
    }

    if (value.length === 0) {
        value = currentInputValue;
    }

    rotatedContainer.style.setProperty('--rotation', `${value}deg`);
    updateBoxes(value);
    currentInputValue = value;
}

function increateRotationHandler(ev) {
    rotationInputElem.value++;
    rotatedContainer.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
    updateBoxes(rotationInputElem.value);
}

function decreaseRotationHandler(ev) {
    rotationInputElem.value--;
    rotatedContainer.style.setProperty('--rotation', `${rotationInputElem.value}deg`);
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
    rect1Details0.textContent = `Rotation: ${rotationValue}deg`;
    rect1Details1.textContent = `\nTop: ${rotatedContainerRect.left.toFixed(2)}`;
    rect1Details2.textContent = `\nLeft: ${rotatedContainerRect.left.toFixed(2)}`;
    rect1Details3.textContent = `\nRight: ${rotatedContainerRect.left.toFixed(2)}`;
    rect1Details4.textContent = `\nBottom: ${rotatedContainerRect.left.toFixed(2)}`;
    rotatedContainer.append(rect1Details0, rect1Details1, rect1Details2, rect1Details3, rect1Details4);
    
    const nonrotatedContainerRect = getBoundingClientRect(nonrotatedContainer);
    nonrotatedContainer.innerHTML = '';
    const rect2Details0 = document.createElement('div');
    const rect2Details1 = document.createElement('div');
    const rect2Details2 = document.createElement('div');
    const rect2Details3 = document.createElement('div');
    const rect2Details4 = document.createElement('div');
    rect2Details0.textContent = 'Rotation: 0deg';
    rect2Details1.textContent = `\nTop: ${nonrotatedContainerRect.left.toFixed(2)}`;
    rect2Details2.textContent = `\nLeft: ${nonrotatedContainerRect.left.toFixed(2)}`;
    rect2Details3.textContent = `\nRight: ${nonrotatedContainerRect.left.toFixed(2)}`;
    rect2Details4.textContent = `\nBottom: ${nonrotatedContainerRect.left.toFixed(2)}`;
    nonrotatedContainer.append(rect2Details0, rect2Details1, rect2Details2, rect2Details3, rect2Details4);
    // console.log('Rotated container rect', rotatedContainerRect);
    // console.log('Non-rotated container rect', nonrotatedContainerRect);
}