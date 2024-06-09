import Chart from 'chart.js/auto';
import { PlotData } from '../constants'
import { Bubble } from "react-chartjs-2";

interface BubbleChartProps {
  plotData: PlotData;
}

export default function BubbleChart({ plotData }: BubbleChartProps) {
  console.log(plotData)
  const { scatter_points } = plotData;
  const data = {
    datasets: [{
                data: Object.entries(scatter_points).map(([x, y]) => ({
                    x: x,
                    y: y,
                    r: 5, // Value for radius is not passed in yet, so use a constant
                })),
    }]
  };

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