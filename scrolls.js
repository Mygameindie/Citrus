function debounce(func, wait = 100) {
	let timeout;
	return function (...args) {
		clearTimeout(timeout);
		timeout = setTimeout(() => func.apply(this, args), wait);
	};
}

document.addEventListener("DOMContentLoaded", () => {
	const presetScrollBar = document.getElementById("presetScrollBar");
	const categoryScrollBar = document.getElementById("categoryScrollBar");
	const buttonContainer = document.querySelector(".scrollable-buttons");

	// Use the presets defined in preset.js
	const presetButtons = Object.keys(presets).map(name => ({
		name,
		action: () => applyPreset(name)
	}));

	const categories = [
		'bottomunderwear1', 'bottomunderwear2', 'bottomunderwear3', 'bottomunderwear4',
		'topunderwear1', 'topunderwear2', 'topunderwear3', 'topunderwear4',
		'onepiece1', 'onepiece3', 'onepiece4',
		'socks1', 'socks2', 'socks3', 'socks4',
		'boxers1', 'boxers2', 'boxers3', 'boxers4',
		'sweatshirt1', 'sweatshirt2', 'sweatshirt3', 'sweatshirt4',
		'shoes1', 'shoes2', 'shoes3', 'shoes4',
		'pants1', 'pants2', 'pants3', 'pants4',
		'skirt1', 'skirt2', 'skirt3', 'skirt4',
		'top1', 'top2', 'top3', 'top4',
		'dress1', 'dress2', 'dress3', 'dress4',
		'jacket1', 'jacket2', 'jacket3', 'jacket4',
		'accessories1', 'accessories2', 'accessories3', 'accessories4',
		'hat1', 'hat2', 'hat3', 'hat4',
		'mask1', 'mask2', 'mask3', 'mask4',
		'bow1', 'bow2', 'bow3', 'bow4'
	];

	function getButtonImageSrc(imgSrc) {
		return imgSrc.replace(/\.png$/, "b.png");
	}

	function generatePresetButtons() {
		presetScrollBar.innerHTML = "";
		presetButtons.forEach(preset => {
			const presetButton = document.createElement("button");
			presetButton.textContent = preset.name;
			presetButton.classList.add("preset-button");
			presetButton.onclick = preset.action;
			presetScrollBar.appendChild(presetButton);
		});
	}

	function generateCategoryButtons() {
		const catFragment = document.createDocumentFragment();
		categoryScrollBar.innerHTML = "";
		categories.forEach(cat => {
			const tab = document.createElement("button");
			tab.textContent = cat;
			tab.classList.add("preset-button");
			tab.setAttribute("aria-label", `Category ${cat}`);
			tab.onclick = () => showCategoryButtons(cat);
			catFragment.appendChild(tab);
		});
		categoryScrollBar.appendChild(catFragment);
	}

	const showCategoryButtons = debounce(async function (categoryName) {
		await loadCategory(categoryName); // Lazy load if not loaded

		buttonContainer.innerHTML = "";
		const items = document.querySelectorAll(`img.${categoryName}`);
		items.forEach(item => {
			const buttonWrap = document.createElement('div');
			buttonWrap.classList.add('button-wrap');

			const button = document.createElement("img");
			button.src = getButtonImageSrc(item.src);
			button.classList.add("item-button");
			button.setAttribute("alt", item.alt || categoryName);
			button.onclick = () => toggleVisibility(item.id, categoryName);
			buttonWrap.appendChild(button);

			const colorButton = document.createElement("button");
			colorButton.textContent = "🎨";
			colorButton.classList.add("color-change-button");
			colorButton.setAttribute("title", "Change color");
			colorButton.onclick = (e) => {
				e.stopPropagation();
				if (item.style.visibility === "hidden") {
					toggleVisibility(item.id, categoryName);
				}
				showColorPicker(item.id);
			};
			buttonWrap.appendChild(colorButton);

			buttonContainer.appendChild(buttonWrap);
		});
	});

	// Generate both sets of buttons
	generatePresetButtons();
	generateCategoryButtons();

	// Enable horizontal scroll with mouse wheel
	[presetScrollBar, categoryScrollBar].forEach(scrollEl => {
		scrollEl.addEventListener("wheel", (evt) => {
			if (evt.deltaY !== 0) {
				evt.preventDefault();
				scrollEl.scrollLeft += evt.deltaY;
			}
		}, { passive: false });
	});
});

// === Lazy Preloading of Category Thumbnails ===
(function preloadCategoryThumbnails() {
	if (typeof categories !== "undefined" && Array.isArray(categories)) {
		categories.forEach(cat => {
			const dummyImg = new Image();
			dummyImg.src = cat + "b.png";
		});
	}
})();