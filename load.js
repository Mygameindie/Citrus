document.addEventListener("DOMContentLoaded", function() {
	// MAIN LOADER
	window.addEventListener("load", function() {
		const loader = document.getElementById("loading-screen");
		const mainMenu = document.querySelector(".main-menu");

		setTimeout(() => {
			loader.classList.add("hidden");
			setTimeout(() => {
				loader.style.display = "none";
				mainMenu.style.display = "flex";
			}, 500);
		}, 1);
	});
});

// ==== IN-GAME LOADING SYSTEM ====
function showGameLoader(message = "Loading Items...") {
	const loader = document.getElementById("game-loading");
	loader.style.display = "flex";
	loader.querySelector("div + div").textContent = message;
}

function hideGameLoader() {
	document.getElementById("game-loading").style.display = "none";
}

/**
 * Load multiple game items with spinner active until all are downloaded
 * @param {Array} items - Array of [imagePath, slot] pairs
 * @param {Function} onComplete - Callback when all items loaded
 */
function loadGameItems(items, onComplete) {
	showGameLoader("Loading Items...");

	let loadedCount = 0;
	const totalItems = items.length;
	const batchSize = 250; // Number of images per batch
	let index = 0;

	function loadBatch() {
		const batch = items.slice(index, index + batchSize);
		let batchLoaded = 0;

		batch.forEach(([img, slot]) => {
			const image = new Image();

			image.onload = () => {
				try {
					showItem(img, slot);
				} catch (err) {
					console.warn(`❌ showItem failed: ${img}`, err);
				}
				batchLoaded++;
				loadedCount++;
				checkBatchComplete();
			};

			image.onerror = () => {
				console.warn(`⚠️ Failed to load: ${img}`);
				batchLoaded++;
				loadedCount++;
				checkBatchComplete();
			};

			image.src = `assets/${img}`;
		});

		function checkBatchComplete() {
			if (batchLoaded === batch.length) {
				index += batchSize;
				if (index < totalItems) {
					setTimeout(loadBatch, 10); // Small delay between batches
				} else {
					hideGameLoader();
					if (onComplete) onComplete();
				}
			}
		}
	}

	loadBatch();
}
