import { Chart, ChartData, ChartOptions, ScatterDataPoint } from 'chart.js/auto'
import { PlotData, KmeansData } from "../constants"
import { Scatter } from "react-chartjs-2"
import annotationPlugin from 'chartjs-plugin-annotation'

interface ClusterChartProps {
  plotData: PlotData
}

export default function ClusterChart({ plotData }: ClusterChartProps) {
  Chart.register(annotationPlugin)
  const { kmeans_data: kmeans } = plotData
  console.log("Kmeans data: ", kmeans)
  if (!kmeans) {
    return <div>No data to display</div>
  }

  const data: ChartData<"scatter", (ScatterDataPoint)[]> = {
    datasets: Object.entries(
      kmeans.data.reduce((acc, point, index) => {
        const cluster = kmeans.cluster[index];
        if (!acc[cluster]) {
          acc[cluster] = [];
        }
        acc[cluster].push({ x: point[0], y: point[1], index: index+1 });
        return acc;
      }, {} as Record<number, { x: number; y: number, index: number }[]>)
    ).map(([cluster, points]) => ({
      label: `Cluster ${parseInt(cluster) + 1}`,
      data: points.map(({ x, y, index }) => ({ x, y, index, r: 20})),
      backgroundColor: `hsl(${parseInt(cluster) * 360 / kmeans!.centers.length}, 100%, 50%)`,
      pointRadius: 5,
      datalabels: {
        align: 'top',
        anchor: 'start',
        formatter: (value: any, ctx: any) => {
          return value.index;
        },
      }
    }))
  }

  console.log(data);
  const options: ChartOptions<"scatter"> = {
    plugins: {
      title: {
        display: true,
        text: "Cluster Chart"
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataPoint = context.raw as { x: number; y: number; index: number };
            return `Idea ${dataPoint.index}: ${plotData.ideas[dataPoint.index - 1]}`;
          }
        }
      }
    },
    interaction: {
      mode: 'nearest',
    },
    aspectRatio: 1,
    scales: {
      x: {
        type: "linear",
        min: Math.min(...kmeans.data.map(point => point[0])),
        max: Math.max(...kmeans.data.map(point => point[0])),
      },
      y: {
        type: "linear",
        min: Math.min(...kmeans.data.map(point => point[1])),
        max: Math.max(...kmeans.data.map(point => point[1])),
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
