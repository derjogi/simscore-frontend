import React from 'react'
import { Chart, ChartData, BubbleDataPoint, ChartOptions, CategoryScale } from 'chart.js/auto';
import { EvaluatedIdea, RelationshipGraph } from "../constants"
import { Bubble } from "react-chartjs-2";
import ChartDataLabels from 'chartjs-plugin-datalabels';
import annotationPlugin from 'chartjs-plugin-annotation';
import { ChartEvent } from 'chart.js/dist/core/core.interaction';

interface BubbleChartProps {
  plotData: RelationshipGraph;
  rankedIdeas: EvaluatedIdea[];
}

const BubbleChart = React.memo((props: BubbleChartProps) => {
  Chart.register(annotationPlugin);
  Chart.register(ChartDataLabels);
  Chart.register(CategoryScale);
  const { plotData, rankedIdeas } = props;
  const scatterPoints = plotData.nodes;
  const centroid = scatterPoints.at(-1)!;
  console.log("Centroid coords: ", centroid)
  const markerSizes: number[] = scatterPoints.slice(0, -1).map(point => {
    const ranked = rankedIdeas.find(ranked => ranked.id === point.id);
    if (!ranked) {
      throw new Error(`No ranked idea found for point id ${point.id}`);
    }
    return ranked.similarity_score;
  });
  // rankedIdeas.sort((a, b) => a.similarity_score - b.similarity_score)
  const ideas = rankedIdeas.map(ranked => ranked.idea);
  const minSize = 2;
  const maxSize = 15;
  const minMarker = Math.min(...markerSizes);
  const maxMarker = Math.max(...markerSizes);
  const normalizedMarkerSizes =
    [
      ...markerSizes.map((size) => {
        const normalizedValue = (size - minMarker) / (maxMarker - minMarker);
        const normalized = minSize + normalizedValue * (maxSize - minSize);
        return normalized;
      }),
      maxSize
    ];
    
  const colors: string[] = normalizedMarkerSizes.map((size, i) => {
    // Creates a color gradient based on the size from red (smallest, hue = 0) to green (largest, hue = 120)
    const hue = (size / Math.max(...normalizedMarkerSizes)) * 120;
    const saturation = 100;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%, 0.5)`;
  });

  const data: ChartData<"bubble", (BubbleDataPoint)[]> = {
    labels: [...ideas, "Centroid"],
    datasets: [{
      label: 'Statements',
      data: scatterPoints.map(
        (node, i) => ({
          x: node.coordinates.x,
          y: node.coordinates.y,
          r: normalizedMarkerSizes[i],
          label: i, // To uniquely identify this item. This is not printed to the UI.
        })
      ),
      backgroundColor: colors,
      datalabels: {
        anchor: 'end',
        align: 'top',
        formatter: (value, ctx) => {
          if (value.label == scatterPoints.length - 1) {
            return "Centroid";
          }
          return rankedIdeas[Number(value.label)].id;
        },
      }
    }]
  };

  function getStrongestConnections(id: number | string) {
    const edges = plotData.edges.filter(edge => (String(edge.from_id) === String(id) || String(edge.to_id) === String(id)))
    console.log(`Found ${edges.length} edges for ${id}`)
    const bestConnections = edges.sort((a, b) => b.similarity - a.similarity).slice(0, Math.min(10, edges.length))
    const connectedPointsIndices = new Set(bestConnections.flatMap(edge => [edge.from_id, edge.to_id]))
    const asLines = bestConnections.map(edge => {
      const from = scatterPoints.find(point => edge.from_id === point.id)
      const to = scatterPoints.find(point => edge.to_id === point.id)
      if (!from || !to) throw new Error("Didn't find expected coordinates for x/y");
      return {
          type: "line",
          xMin: from.coordinates.x,
          xMax: to.coordinates.x,
          yMin: from.coordinates.y,
          yMax: to.coordinates.y,
          borderColor: "rgba(111, 111, 132)",
          borderWidth: edge.similarity,
        }
    })
    console.log('Lines to draw: ', asLines)
    return { connectedPointsIndices, asLines }
  } 


  function idLookupFromIndex(index: number) {
    if (index === rankedIdeas.length) return 'Centroid'
    return rankedIdeas[index].id
  }

  const options = {
    plugins: {
      title: {
        display: true,
        text: "Displays the distance of each idea to the Centroid and each other."
      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const dataPoint = context.raw as { x: number; y: number; label: number };
            if (dataPoint.label == scatterPoints.length - 1) {
              return "Centroid"
            }
            // return `Idea ${dataPoint.label + 1}: ${ideas[dataPoint.label]}`;
            return '';
          }
        }
      }
    },
    onClick: (event: ChartEvent, elements, chart: any) => {
      if (elements.length > 0) {
        const id = idLookupFromIndex(elements[0].index);
        const { connectedPointsIndices, asLines } = getStrongestConnections(id);
        chart.options.plugins.annotation.annotations = asLines 
        const selectedIdea = rankedIdeas.find(p => p.id === id);
        chart.data.datasets[0].backgroundColor = rankedIdeas.map((idea, index) => {
          const isConnected = connectedPointsIndices.has(idLookupFromIndex(index));
          const isSameCluster = selectedIdea && idea.cluster_id === selectedIdea.cluster_id;
          return isConnected 
            ? colors[index].replace(/[\d.]+\)$/, '1)') 
            : isSameCluster ? colors[index]
            : '#fff';
        });
      } else {
        chart.options.plugins.annotation.annotations = {};
        chart.data.datasets[0].backgroundColor = colors
      }
      chart.update('none');
    },
    aspectRatio: 1,
    scales: {
      x: {
        type: "linear",
        min: -1,
        max: 1
      },
      y: {
        type: "linear",
        min: -1,
        max: 1
      },
    }
  } as ChartOptions<"bubble">;

  return (
    <>
      <h2 className='text-center'>Similarity Score</h2>
      <Bubble
        data={data}
        options={options}
      />
    </>
  );
});

BubbleChart.displayName = 'BubbleChart';
export default BubbleChart;