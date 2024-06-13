import {Chart, ChartData, Point, BubbleDataPoint } from 'chart.js/auto';
import { PlotData } from "../constants"
import { Bubble } from "react-chartjs-2";

interface BubbleChartProps {
  plotData: PlotData;
}

export default function BubbleChart({ plotData }: BubbleChartProps) {
  console.log(plotData)
  const { scatter_points, marker_sizes, ideas, pairwise_similarity } = plotData;
  const minSize = 2;
  const maxSize = Math.max(15, marker_sizes.slice(-1)[0][0]);
  const normalizedMarkerSizes =
    [
      ...marker_sizes.slice(0, -1).map((size) => {
        const minValue = Math.min(...marker_sizes.slice(0, -1).flat());
        const maxValue = Math.max(...marker_sizes.slice(0, -1).flat());
        const normalizedValue = (size[0] - minValue) / (maxValue - minValue);
        return minSize + normalizedValue * (maxSize - minSize);
      }),
      maxSize
    ];
    
  const colors: string[] = normalizedMarkerSizes.map((size, i) => {
    // Creates a color gradient based on the size from red (smallest, hue = 0) to green (largest, hue = 120)
    const hue = (size / Math.max(...normalizedMarkerSizes)) * 120;
    const saturation = 100;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  });

  const data: ChartData<"bubble", (BubbleDataPoint)[]> = {
    labels: [...ideas, "Centroid"],
    datasets: [{
      label: 'Statements',
      data: scatter_points.map(
        ([x, y], i) => ({
          x,
          y,
          r: normalizedMarkerSizes[i],
          label: i, // To uniquely identify this item. This is not printed to the UI.
          display_label: "Something " + i,
          backgroundColor: "rgba(111, 111, 132, 0.2)",
        })
      ),
      backgroundColor: colors,
      borderColor: "rgba(255, 99, 132, 1)",
      borderWidth: 1,
    }]
  };
  console.log('Data:', data)

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Displays the distance of each idea to the Centroid and each other."
      },
      // display_label: {
      //   id: "display_label",
      //   beforeD
      // }
    }
  }

  return (
    <div className="chart-container">
      <h2 style={{ textAlign: "center" }}>Similarity Score</h2>
      <Bubble
        data={data}
        options={options}
      />
    </div>
  );
}