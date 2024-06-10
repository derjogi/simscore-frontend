import {Chart, ChartData, Point, BubbleDataPoint } from 'chart.js/auto';
import { PlotData } from "../constants"
import { Bubble } from "react-chartjs-2";

interface BubbleChartProps {
  plotData: PlotData;
}

export default function BubbleChart({ plotData }: BubbleChartProps) {
  console.log(plotData)
  const { scatter_points, marker_sizes, ideas, pairwise_similarity} = plotData;
  const data: ChartData<"bubble", (BubbleDataPoint)[]> = {
    labels: [...ideas, "Centroid"],
    datasets: [{
      label: 'Statements',
      data: scatter_points.map(
        ([x, y], i) => ({
          x,
          y,
          r: marker_sizes[i][0],
          label: i, // To uniquely identify this item. This is not printed to the UI.
        })
      ),
      backgroundColor: "rgba(255, 99, 132, 0.2)",
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
    }]
  };
  console.log('Data:', data)

  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>Similarity Score</h2>
      <Bubble
        data={data}
        options={{
          plugins: {
            title: {
              display: true,
              text: "Displays the distance of each idea to the Centroid and each other."
            }
          }
        }}
      />
    </div>
  );
}