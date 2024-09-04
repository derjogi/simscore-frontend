"use client";
import BubbleChart from "@/app/components/BubbleChart";
import ClusterChart from "@/app/components/ClusterChart";
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

          <h2>{"Re-Rank this feedback, and submit when you're done:"}</h2>

            {ideasAndSimScores && (
              <>
                <div className="p-8">
                  
                </div>
                {showSubmitButton ? (
                  <div className="p-8">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter your name"
                      className="border rounded px-2 py-1 mr-2"
                    />

                    <button
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
                      onClick={() => {
                        console.log("Pushed the button! Name: ", name);
                        submitNewRanking(name);
                      }}
                      disabled={!name && !showSubmitButton}
                    >
                      Submit
                    </button>
                  </div>
                ) : (
                  <div>Already Submitted</div>
                )}
              </>
            )}

            <div className="p-8">
              <ClusterChart plotData={plotData} />
            </div>

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
