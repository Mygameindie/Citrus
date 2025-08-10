let fpsHistory = [];

function monitorFPS() {
    frameCount++;
    const now = performance.now();

    if (now - lastFpsCheck >= 1000) {
        const rawFps = Math.round((frameCount * 1000) / (now - lastFpsCheck));
        fpsHistory.push(rawFps);
        if (fpsHistory.length > 5) fpsHistory.shift();

        const avgFps = Math.round(fpsHistory.reduce((a, b) => a + b, 0) / fpsHistory.length);
        let prevBatch = dynamicBatchSize;

        if (avgFps < 60 && dynamicBatchSize > 1) {
            dynamicBatchSize = Math.max(1, dynamicBatchSize - 2);
        } else if (avgFps < 30 && dynamicBatchSize > 1) {
            dynamicBatchSize = Math.max(1, dynamicBatchSize - 1);
        } else if (avgFps > 60 && dynamicBatchSize < 10) {
            dynamicBatchSize = Math.min(10, dynamicBatchSize + 2);
        } else if (avgFps > 50 && dynamicBatchSize < 10) {
            dynamicBatchSize = Math.min(10, dynamicBatchSize + 1);
        }

        if (dynamicBatchSize !== prevBatch) {
            console.log(`📊 Avg FPS: ${avgFps} → Batch size adjusted to ${dynamicBatchSize}`);
        }

        frameCount = 0;
        lastFpsCheck = now;
    }

    const stillLoading = allItemsData.some(item => !item.element);
    const fpsUnstable = fpsHistory.length < 5 || Math.max(...fpsHistory) - Math.min(...fpsHistory) > 5;

    if (stillLoading || fpsUnstable) {
        requestAnimationFrame(monitorFPS);
    } else {
        console.log("✅ FPS stable and all items loaded — stopping FPS monitor.");
    }
}