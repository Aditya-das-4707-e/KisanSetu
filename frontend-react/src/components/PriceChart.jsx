import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Filler);

/** Price-history line chart — Chart.js, green ledger theme. */
export default function PriceChart({ points, unit }) {
  const green = "#1F5C3F";
  const ink = "#6B6355";
  const labels = points.map((p) => {
    const d = new Date(p.date + "T00:00:00");
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
  });
  const data = {
    labels,
    datasets: [
      {
        label: `Price per ${unit}`,
        data: points.map((p) => p.price),
        borderColor: green,
        backgroundColor: "rgba(31, 92, 63, 0.10)",
        fill: true,
        tension: 0.3,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2,
      },
    ],
  };
  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index", intersect: false },
    plugins: {
      legend: { display: false },
      tooltip: { callbacks: { label: (ctx) => `₹${ctx.parsed.y} / ${unit}` } },
    },
    scales: {
      x: {
        ticks: { color: ink, maxTicksLimit: 8, font: { family: "IBM Plex Sans" } },
        grid: { display: false },
      },
      y: {
        ticks: { color: ink, callback: (v) => `₹${v}`, font: { family: "IBM Plex Mono" } },
        grid: { color: "rgba(0,0,0,0.06)" },
      },
    },
  };
  return <Line data={data} options={options} />;
}
