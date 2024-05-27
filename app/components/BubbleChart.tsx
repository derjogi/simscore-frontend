import Chart from 'chart.js/auto';

const data = {
  labels: ["x1", "x2"],
  datasets: [{
    labels: ["y1", "y2"],
    data: [{ x: 123, y: 2, r: 10 }, {x: 456, y:5, r: 20}],
  }]
};

import { Bubble } from "react-chartjs-2";

export default function BubbleChart() {
  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>Pie Chart</h2>
      <Bubble
        data={data}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Some label"
            }
          }
        }}
      />
    </div>
  );
}