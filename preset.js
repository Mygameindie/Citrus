
// === Utility: Debounce ===
function debounce(func, wait = 100) {
    let timeout;
    return function(...args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, args), wait);
    };
}
// ==== CENTRAL CATEGORY LIST ====
const allCategories = [
	'bottomunderwear1', 'bottomunderwear2', 'bottomunderwear3', 'bottomunderwear4',
	'topunderwear1', 'topunderwear2', 'topunderwear3', 'topunderwear4',
	'onepiece1', 'onepiece3', 'onepiece4',
	'socks1', 'socks2', 'socks3', 'socks4',
	'boxers1', 'boxers2', 'boxers3', 'boxers4',
	'sweatshirt1', 'sweatshirt2', 'sweatshirt3', 'sweatshirt4', 'bodysuit4',
	'shoes1', 'shoes2', 'shoes3', 'shoes4',
	'pants1', 'pants2', 'pants3', 'pants4',
	'skirt1', 'skirt2', 'skirt3', 'skirt4',
	'top1', 'top2', 'top3', 'top4',
	'dress1', 'dress2', 'dress3', 'dress4',
	'jacket1', 'jacket2', 'jacket3', 'jacket4',
	'dress1w', 'dress2w', 'dress3w', 'dress4w',
	'skirt1w', 'skirt2w', 'skirt3w', 'skirt4w',
	'accessories1', 'accessories2', 'accessories3', 'accessories4',
	'hat1', 'hat2', 'hat3', 'hat4',
	'glove4', 'scarf4', 'leaf1'
];

// ==== PRESET CONFIGURATION ====
const presets = {
	default: [
		{ id: "bottomunderwear1_1.png", category: "bottomunderwear1" },
		{ id: "bottomunderwear3_1.png", category: "bottomunderwear3" },
		{ id: "bottomunderwear4_1.png", category: "bottomunderwear4" },

		{ id: "topunderwear1_1.png", category: "topunderwear1" },
		{ id: "topunderwear3_1.png", category: "topunderwear3" },
		{ id: "topunderwear4_1.png", category: "topunderwear4" },

		{ id: "boxers2_1.png", category: "boxers2" },
		{ id: "boxers1_1.png", category: "boxers1" },

		{ id: "socks1_1.png", category: "socks1" },
		{ id: "socks2_1.png", category: "socks2" },
		{ id: "socks4_1.png", category: "socks4" },

		{ id: "shoes1_1.png", category: "shoes1" },
		{ id: "shoes2_1.png", category: "shoes2" },
		{ id: "shoes4_1.png", category: "shoes4" },

		{ id: "hat1_1.png", category: "hat1" },
		{ id: "hat4_1.png", category: "hat4" },

		{ id: "skirt1_1.png", category: "skirt1" },
		{ id: "skirt3_1.png", category: "skirt3" },

		{ id: "top1_1.png", category: "top1" },
		{ id: "top2_1.png", category: "top2" },

		{ id: "pants2_1.png", category: "pants2" },
		{ id: "jacket2_1.png", category: "jacket2" },

		{ id: "bodysuit4_1.png", category: "bodysuit4" },
		{ id: "glove4_1.png", category: "glove4" },
		{ id: "scarf4_1.png", category: "scarf4" },

		{ id: "leaf1_1.png", category: "leaf1" }
	],
	underwear: [
		{ id: "bottomunderwear1_1.png", category: "bottomunderwear1" },
		{ id: "bottomunderwear3_1.png", category: "bottomunderwear3" },
		{ id: "bottomunderwear4_1.png", category: "bottomunderwear4" },

		{ id: "topunderwear1_1.png", category: "topunderwear1" },
		{ id: "topunderwear3_1.png", category: "topunderwear3" },
		{ id: "topunderwear4_1.png", category: "topunderwear4" },

		{ id: "boxers2_1.png", category: "boxers2" }
	]
};

// ==== PRESET HANDLER ====
function applyPreset(presetName) {
	hideSpecificCategories(allCategories);
	const items = presets[presetName];
	if (!items) {
		console.warn(`Preset not found: ${presetName}`);
		return;
	}
	items.forEach(({ id, category }) => showItem(id, category));
}

// ==== UTIL ====
function showItem(itemId, categoryName) {
	const selectedItem = document.getElementById(itemId);
	if (selectedItem) {
		Object.assign(selectedItem.style, {
			visibility: "visible",
			display: "block",
			position: "absolute",
			left: "0",
			top: "0",
			zIndex: getZIndex(categoryName)
		});
	} else {
		console.warn(`Item not found: ${itemId} in category ${categoryName}`);
	}
}
function safeApplyPreset(name) {
	const items = presets[name];
	if (!items) {
		console.warn(`Preset not found: ${name}`);
		return;
	}

	const checkReady = () => {
		const allReady = items.every(({ id }) => document.getElementById(id));
		if (allReady) {
			withLoadingScreen(async () => {
				applyPreset(name);
			}, `Applying preset: ${name}`);
		} else {
			console.warn("Waiting for all items to be available...");
			setTimeout(() => safeApplyPreset(name), 100);
		}
	};

	checkReady();
}


// === Lazy Preloading of Preset Images ===
(function preloadPresetImages() {
    if (typeof presets !== "undefined") {
        const allImages = new Set();
        Object.values(presets).forEach(items => {
            items.forEach(({ id }) => allImages.add(id));
        });
        allImages.forEach(id => {
            const img = new Image();
            img.src = id;
        });
    }
})(); // IIFE end

