// Store original ingredient amounts for scaling
const originalAmounts = [];

// Initialize original amounts on page load
document.addEventListener('DOMContentLoaded', function () {
	const amounts = document.querySelectorAll('.amount');
	amounts.forEach(amount => {
		originalAmounts.push(amount.textContent);
	});
});

// Toggle ingredient as completed
function toggleIngredient(item) {
	const checkbox = item.querySelector('.ingredient-checkbox');
	checkbox.checked = !checkbox.checked;
	item.classList.toggle('checked');
}

// Scale recipe functionality
function scaleRecipe() {
	const scaleFactor = parseFloat(document.getElementById('scale-factor').value);
	const amounts = document.querySelectorAll('.amount');
	const servings = document.getElementById('servings');

	amounts.forEach((amount, index) => {
		const originalValue = originalAmounts[index];
		const newValue = scaleAmount(originalValue, scaleFactor);
		amount.textContent = newValue;
	});

	// Update servings
	const originalServings = 24;
	const newServings = Math.round(originalServings * scaleFactor);
	servings.textContent = newServings + ' cookies';
}

function resetScale() {
	document.getElementById('scale-factor').value = 1;
	const amounts = document.querySelectorAll('.amount');
	const servings = document.getElementById('servings');

	amounts.forEach((amount, index) => {
		amount.textContent = originalAmounts[index];
	});

	servings.textContent = '24 cookies';
}

function scaleAmount(originalAmount, scaleFactor) {
	// Handle fractions and mixed numbers
	const fractionRegex = /(\d+)?[\s]?(\d+)\/(\d+)/;
	const decimalRegex = /(\d+\.?\d*)/;

	let numericValue = 0;

	if (fractionRegex.test(originalAmount)) {
		const match = originalAmount.match(fractionRegex);
		const wholeNumber = match[1] ? parseInt(match[1]) : 0;
		const numerator = parseInt(match[2]);
		const denominator = parseInt(match[3]);
		numericValue = wholeNumber + (numerator / denominator);
	} else if (decimalRegex.test(originalAmount)) {
		numericValue = parseFloat(originalAmount.match(decimalRegex)[1]);
	} else {
		return originalAmount; // Return original if can't parse
	}

	const scaledValue = numericValue * scaleFactor;

	// Convert back to fraction format if appropriate
	if (scaledValue < 1 && scaledValue > 0) {
		return convertToFraction(scaledValue);
	} else if (scaledValue % 1 !== 0) {
		return scaledValue.toFixed(2).replace(/\.?0+$/, '');
	} else {
		return scaledValue.toString();
	}
}

function convertToFraction(decimal) {
	const commonFractions = {
		0.125: '⅛', 0.25: '¼', 0.333: '⅓', 0.375: '⅜',
		0.5: '½', 0.625: '⅝', 0.667: '⅔', 0.75: '¾', 0.875: '⅞'
	};

	for (let frac in commonFractions) {
		if (Math.abs(decimal - parseFloat(frac)) < 0.01) {
			return commonFractions[frac];
		}
	}

	return decimal.toFixed(2);
}

// Share recipe functionality
function copyRecipe() {
	navigator.clipboard.writeText(window.location.href).then(() => {
		alert('Recipe URL copied to clipboard!');
	});
}

// Print optimization
window.addEventListener('beforeprint', function () {
	// Reset any checked ingredients for printing
	document.querySelectorAll('.ingredient-item.checked').forEach(item => {
		item.classList.remove('checked');
		item.querySelector('.ingredient-checkbox').checked = false;
	});
});