/* Chart.js helpers for price history. */
window.Charts = (() => {
  let chart = null;
  function renderPriceChart(canvasId, points) {
    const el = document.getElementById(canvasId);
    if (!el || typeof Chart === "undefined") return;
    if (chart) chart.destroy();
    chart = new Chart(el, {
      type: "line",
      data: {
        labels: points.map(p => p.date),
        datasets: [
          { label: "Avg ₹/kg", data: points.map(p => p.avg), borderColor: "#2E7D32", fill: false, tension: 0.2 },
          { label: "Min", data: points.map(p => p.min), borderColor: "#9E9E9E", borderDash: [5, 5], fill: false, pointRadius: 0 },
          { label: "Max", data: points.map(p => p.max), borderColor: "#C62828", borderDash: [5, 5], fill: false, pointRadius: 0 }
        ]
      },
      options: { responsive: true, plugins: { legend: { position: "bottom" } }, scales: { x: { ticks: { maxTicksLimit: 8 } } } }
    });
  }
  return { renderPriceChart };
})();
