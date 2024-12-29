function buttonHasBeenOpended(element) {
    console.log(element.classList.contains('activate'));
    return element.classList.contains('activate');
}

function elementWasClicked(element) {
    console.log(element.classList.contains('activate'));
	return element.classList.contains('activate');
}

export { buttonHasBeenOpended, elementWasClicked };