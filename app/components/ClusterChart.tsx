import React from "react"
import { Chart, ChartData, ChartDataset, ChartOptions, ScatterDataPoint } from 'chart.js/auto'
import { PlotData, KmeansData } from "../constants"
import { Scatter } from "react-chartjs-2"
import annotationPlugin from 'chartjs-plugin-annotation'

interface ClusterChartProps {
  plotData: PlotData
}

type DataPointWithIndex = ScatterDataPoint
  & { label: number | string };

const ClusterChart = React.memo(({ plotData }: ClusterChartProps) => {
  Chart.register(annotationPlugin)
  const { kmeans_data: kmeans } = plotData
  console.log("Kmeans data: ", kmeans)
  if (!kmeans) {
    return <div>No data to display</div>
  }

  const datasetPoints = Object.entries(
    kmeans.data.reduce((acc, point, index) => {
      const cluster = kmeans.cluster[index];
      if (!acc[cluster]) {
        acc[cluster] = [];
      }
      acc[cluster].push({
        x: point[0],
        y: point[1],
        label: index + 1
      });
      return acc;
    }, {} as Record<number, DataPointWithIndex[]>)
  ).map(([cluster, points]): ChartDataset<"scatter", DataPointWithIndex[]> => ({
    type: 'scatter',
    label: `Cluster ${parseInt(cluster) + 1}`,
    data: points,
    backgroundColor: `hsl(${parseInt(cluster) * 360 / kmeans!.centers.length}, 100%, 50%)`,
    pointRadius: 5,
    datalabels: {
      align: 'top',
      anchor: 'start',
      formatter: (value: DataPointWithIndex) => {
        return value.label;
      },
    }
  }));

  const datasetCenters = {
    type: 'scatter',
    label: 'Cluster Centers',
    data: kmeans.centers.map((center, index) => ({
      x: center[0],
      y: center[1],
      label: `Cluster ${index}`
    })),
    backgroundColor: 'rgba(0, 0, 0, 1)',
    pointRadius: 10,
    pointStyle: 'triangle',
  } as ChartDataset<"scatter", DataPointWithIndex[]>;

  const data: ChartData<"scatter", DataPointWithIndex[]> = {
    datasets: [
      ...datasetPoints,
      datasetCenters
    ]
  };

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
            const dataPoint = context.raw as DataPointWithIndex;
            return typeof dataPoint.label === 'number'
              ? `Idea ${dataPoint.label}: ${plotData.ideas[dataPoint.label - 1]}`
              : `Center of ${dataPoint.label}`;
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
});

export default ClusterChart;
