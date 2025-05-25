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

const conversionTable = {
	flour: { cup: 120, tbsp: 7.5, tsp: 2.5 },
	sugar: { cup: 200, tbsp: 12.5, tsp: 4.2 },
	brown_sugar: { cup: 220, tbsp: 13.75, tsp: 4.6 },
	butter: { cup: 227, tbsp: 14, tsp: 4.7 },
	chocolate_chips: { cup: 170, tbsp: 10.6, tsp: 3.5 },
	vanilla_extract: { tsp: 4.2 },
	baking_soda: { tsp: 4.6 },
	sea_salt: { tsp: 6 },
	eggs: { unit: 50 }, // 1 large egg ≈ 50g
	// Add more as needed
};

function parseAmount(amountStr) {
	// Handles fractions like "2¼"
	if (amountStr.includes('¼')) return parseFloat(amountStr) + 0.25;
	if (amountStr.includes('½')) return parseFloat(amountStr) + 0.5;
	if (amountStr.includes('¾')) return parseFloat(amountStr) + 0.75;
	return parseFloat(amountStr);
}

function convertToGrams() {
	document.querySelectorAll('.ingredient-item').forEach(item => {
		const unit = item.dataset.unit;
		const type = item.dataset.type;
		const amountSpan = item.querySelector('.amount');
		if (!amountSpan) return;
		const amount = parseAmount(amountSpan.textContent);
		const conversion = conversionTable[type] && conversionTable[type][unit];
		if (conversion) {
			const grams = Math.round(amount * conversion);
			if (!amountSpan.nextSibling.textContent.includes('g')) {
				amountSpan.insertAdjacentHTML('afterend', ` <span class="grams">(${grams}g)</span>`);
			}
		}
	});
}