"use client";
import BubbleChart from "@/app/components/BubbleChart";
import ClusterChart from "@/app/components/ClusterChart";
import DragDrop from "@/app/components/DragDrop";
import { IdeasAndSimScores, PlotData } from "@/app/constants";
import Link from "next/link";
import { useState, useEffect } from "react";

export default function SessionPage({ params }: { params: { id: string } }) {
  const [ideasAndSimScores, setIdeasAndSimScores] =
    useState<IdeasAndSimScores>();
  const [plotData, setPlotData] = useState<PlotData>();
  const [isLoading, setIsLoading] = useState(true);
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [name, setName] = useState("");

  useEffect(() => {
    const fetchSessionData = async () => {
      const host = process.env.SIMSCORE_API;
      const response = await fetch(`${host}/session/${params.id}`);
      if (!response.ok) {
        console.log(`HTTP error! status: ${response.status}`);
        setIsLoading(false);
      }
      const data = await response.json();
      console.log(`Data in session/${params.id} :`, data);
      setIdeasAndSimScores(data.results);
      setPlotData(data.plot_data);
      setIsLoading(false);
    };
    setIsLoading(true);
    fetchSessionData();
  }, [params.id]);

  const handleDragDropUpdate = (updatedOutput: string[]) => {
    setIdeasAndSimScores((prevState) => ({
      ...(prevState ?? { similarity: [], distance: [] }),
      ideas: updatedOutput,
    }));
    setShowSubmitButton(true);
    console.log("Updated ideas: ", updatedOutput);
  };

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}

      {plotData && !isLoading && (
        <div>
          <hr />
          <div className="pt-4 space-y-2">
            <div className="p-8">
              <BubbleChart plotData={plotData} />
            </div>

            <div className="space-y-2">
              <table>
                <caption>Similarity Details</caption>
                <thead>
                  <tr key="header" className="px-4">
                    <td className="px-4">#</td>
                    <td className="px-4">Idea</td>
                    <td className="px-4">Similarity</td>
                    <td className="px-4">Distance</td>
                  </tr>
                </thead>
                <tbody>
                  {ideasAndSimScores?.ideas.map((idea, i) => (
                    <tr key={i} className="px-4">
                      <td className="px-4">{i + 1}</td>
                      <td className="px-4">{idea}</td>
                      <td className="px-4">
                        {ideasAndSimScores.similarity[i].toFixed(2)}
                      </td>
                      <td className="px-4">
                        {ideasAndSimScores.distance[i].toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  async function submitNewRanking(name: string) {
    console.log("Submitting reranked data.");
    const host = process.env.SIMSCORE_API;
    try {
      const response = await fetch(`${host}/session/${params.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        redirect: "follow",
        body: JSON.stringify({ name: name, ideasAndSimScores }),
      });
      if (response.ok) {
        setShowSubmitButton(false);
        console.log("Successfully submitted data.");
      } else {
        setShowSubmitButton(true);
        console.log("Na uh, something went wrong: ", response.status);
        throw new Error("Failed to submit data: ", await response.json());
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to submit data.");
    }
  }
}
