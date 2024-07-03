import { Chart, ChartData, ChartOptions } from 'chart.js/auto'
import { PlotData, KmeansData } from "../constants"
import { Scatter } from "react-chartjs-2"
import ChartDataLabels from 'chartjs-plugin-datalabels'
import annotationPlugin from 'chartjs-plugin-annotation'

interface ClusterChartProps {
  plotData: PlotData
}

export default function ClusterChart({ plotData }: ClusterChartProps) {
  Chart.register(annotationPlugin)
  Chart.register(ChartDataLabels)
  const { kmeans_data } = plotData

  const data: ChartData<"scatter", (number[] | null)[]> = {
    datasets: Object.entries(kmeans_data || {}).map(([clusterNumber, { data, centers }]) => ({
      label: clusterNumber,
      data: data.map((point: [number, number]) => ({ x: point[0], y: point[1] })),
      backgroundColor: `hsl(${Math.random() * 360}, 100%, 50%)`,
      datalabels: {
        anchor: 'end',
        offset: 20, // This doesn't work for some reason
        formatter: (value, ctx) => {
          
          return value.label+1;
        },
      }
    }))
  }

  const options: ChartOptions<"scatter"> = {
    plugins: {
      title: {
        display: true,
        text: "Cluster Chart"
      },
      annotation: {
        annotations: Object.entries(kmeans_data || {}).flatMap(([clusterNumber, { centers }]) =>
          centers.map((center: number[], i: number) => ({
            type: "label",
            xValue: i,
            yValue: "",
            content: `Cluster ${clusterNumber}`,
            color: "black",
          }))
        ),
      },
    },
    aspectRatio: 1,
    scales: {
      x: {
        type: "linear",
        min: Math.min(...Object.values(kmeans_data || {}).flatMap(({ data }) => data.map(([x]: [number]) => x))),
        max: Math.max(...Object.values(kmeans_data || {}).flatMap(({ data }) => data.map(([x]: [number]) => x))),
      },
      y: {
        type: "linear",
        min: Math.min(...Object.values(kmeans_data || {}).flatMap(({ data }) => data.map(([, y]) => y))),
        max: Math.max(...Object.values(kmeans_data || {}).flatMap(({ data }) => data.map(([, y]) => y))),
      },
    },
  }

  return (
    <div className="chart-container">
      <h2 className='text-center'>Cluster Chart</h2>
      <Scatter data={data} options={options} />
    </div>
  )
}
