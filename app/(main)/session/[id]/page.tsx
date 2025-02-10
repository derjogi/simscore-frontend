"use client";
import BubbleChart from "@/app/components/BubbleChart";
import {
  EvaluatedIdea,
  RelationshipGraph,
} from "@/app/constants";
import { useState, useEffect, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCompress, faExpand } from "@fortawesome/free-solid-svg-icons";
import ClusterView from "@/app/components/ClusterView";
import LZString from "lz-string";
import { useSearchParams } from "next/navigation";
import * as XLSX from "xlsx";

export default function SessionPage({ params }: { params: { id: string } }) {
  // const [ideasAndSimScores, setIdeasAndSimScores] =
  //   useState<IdeasAndSimScores>();
  // const [plotData, setPlotData] = useState<PlotData>();
  const [pairwiseSimMatrix, setPairwiseSimilarityMatrix] = useState<number[][] | null>()
  const [relationshipGraph, setRelationshipGraph] = useState<RelationshipGraph | null>()
  const [isLoading, setIsLoading] = useState(true);
  const [evaluatedIdeas, setEvaluatedIdeas] = useState<EvaluatedIdea[]>([]);
  const [summaries, setSummaries] = useState<{ id: number, name: string }[]>([]);
  const [showSubmitButton, setShowSubmitButton] = useState(true);
  const [name, setName] = useState("");
  const [ids, setIds] = useState<string[]>([]);

  const searchParams = useSearchParams();
  const version = searchParams.get("version") ?? "v1";

  useEffect(() => {
    setIsLoading(true);
    const storedData = localStorage.getItem(`sessionData_${params.id}`);
    if (storedData) {
      setValues(storedData);
    } else {
      fetchSessionData();
    }
  }, [params.id]);

  const setValues = (compressedData: string) => {
    if (compressedData) {
      const decompressedData = LZString.decompress(compressedData);
      const data = JSON.parse(decompressedData);
      console.log("Data found in localStorage:", data);
      const rankedIdeas: EvaluatedIdea[] = data.ranked_ideas
      setEvaluatedIdeas(rankedIdeas);
      setIds(rankedIdeas.map(idea => String(idea.id)))
      setPairwiseSimilarityMatrix(data.pairwise_similarity_matrix)
      setRelationshipGraph(data.relationship_graph)
      setSummaries(data.cluster_names);
      setIsLoading(false);
    } else {
      console.log("no data in localStorage 😢");
    }
  };

  const fetchSessionData = async () => {
    console.log("Fetching data for session ID:", params.id);
    try {
      const response = await fetch(`/fastapi/session/${params.id}`);
      if (!response.ok) {
        console.log(`HTTP error! status: ${response.status}`);
        setIsLoading(false);
      }
      const data = await response.json();
      console.log("Fetched data:", data);
      const compressedData = LZString.compress(JSON.stringify(data));
      try {
        localStorage.setItem(`sessionData_${params.id}`, compressedData);
      } catch (error) {
        // Probably too much data stored. Let's delete previous ones.
        console.log("Removing cached session data due to error: ", error);
        localStorage.keys().forEach((key: string) => {
          if (key.startsWith("sessionData_")) {
            localStorage.removeItem(key);
          }
        });
        // And now try again.
        localStorage.setItem(`sessionData_${params.id}`, compressedData);
      }
      setValues(compressedData);
    } catch (error) {
      console.log("Error fetching data:", error);
    }
  };

  const [openDetail, setOpenDetail] = useState<string | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const chartRef = useRef<HTMLDivElement>(null);

  const expand = <FontAwesomeIcon icon={faExpand} />;
  const collapse = <FontAwesomeIcon icon={faCompress} />;

  const updateDivHeight = () => {
    if (chartRef.current) {
      const width = chartRef.current.offsetWidth;
      chartRef.current.style.height = `${1.2 * width}px`;
    }
  };

  useEffect(() => {
    updateDivHeight();
    window.addEventListener("resize", updateDivHeight);
    return () => window.removeEventListener("resize", updateDivHeight);
  }, []);

  const copyToClipboard = (idea: string, event: React.MouseEvent) => {
    setMousePosition({ x: event.clientX, y: event.clientY });
    navigator.clipboard.writeText(idea).then(() => {
      setShowPopup(true);
      setTimeout(() => setShowPopup(false), 2000); // Hide popup after 2 seconds
    });
  };

  const exportMatrix = () => {
    if (!evaluatedIdeas || !pairwiseSimMatrix) return;

    const headers = evaluatedIdeas.map(
      (evaluated) => `"${evaluated.idea.replace(/"/g, '""')}"`
    ); // replace single quotes with double quotes, it's TSV standard)
    if (!headers) return;
    const firstRow = [...headers];
    headers.unshift(""); // Insert an empty top-left cell
    headers.push("Centroid");
    firstRow.push("Centroid");
    const pairwiseWithIdeaPrepended = pairwiseSimMatrix.map(
      (scoresForOneIdeaAgainstAllOthers, index) => [
        firstRow[index],
        ...scoresForOneIdeaAgainstAllOthers,
      ]
    );
    if (!pairwiseWithIdeaPrepended) return;
  
    const data = [headers, ...pairwiseWithIdeaPrepended];
  
    const asTSV = data.map((row) => row.join("\t")).join("\n");
    const blob = new Blob([asTSV], { type: "text/tsv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `pairwise_similarity_${params.id}.tsv`);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const exportToFile = (type: "csv" | "xlsx" | "matrix") => {
    if (!evaluatedIdeas) return;

    const headers = ["Idea", "Similarity Score", "Cluster"];
    if (ids.length > 0) {
      headers.unshift("ID");
    }
    if (summaries) {
      headers.push("Category")
    }
    console.log("Ids: ", ids);
    console.log("Headers: ", headers);
    const data = [
      headers,
      ...evaluatedIdeas.map(
        (idea, index) => {
         console.log("Idea: ", idea)
          return [
            ids.length > 0 ? ids[index] : null,
            `"${idea.idea.replace(/"/g, '""')}"`, // replace single quotes with double quotes, it's CSV standard
            idea.similarity_score,
            idea.cluster_id + 1, // If this was 0-based the boolean filter below would remove it, so we need to increase by 1. Better anyway.
            summaries ? summaries.find(summary => summary.id === idea.cluster_id)?.name : null,
          ].filter(Boolean) // Removes nulls        
        }
      ),
    ];

    if (type === "xlsx") {
      const ws = XLSX.utils.aoa_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Evaluated Ideas");
      XLSX.writeFile(wb, "evaluated_ideas.xlsx");
    } else {
      const asCSV = data.map((row) => row.join("|")).join("\n");
      const blob = new Blob([asCSV], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute("href", url);
        link.setAttribute("download", "evaluated_ideas.csv");
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  const [showReRankSection, setShowReRankSection] = useState(false);
  const [showStarRatingSection, setShowStarRatingSection] = useState(false);

  return (
    <div>
      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}

      {relationshipGraph && !isLoading && (
        <>
          <div className="flex justify-center items-center">
            <button
              className="m-4 p-2 bg-slate-500 rounded-md shadow-lg"
              onClick={() => exportToFile("csv")}
            >
              {"Export to CSV"}
            </button>
            <button
              className="m-4 p-2 bg-slate-500 rounded-md shadow-lg"
              onClick={() => exportToFile("xlsx")}
            >
              {"Export to XLSX"}
            </button>
            <button
              className="m-4 p-2 bg-slate-500 rounded-md shadow-lg"
              onClick={() => exportMatrix()}
            >
              {"Export pairwise similarity"}
            </button>
            {version === "v2" && (
              <button
                className="m-4 p-2 bg-blue-500 text-white rounded-md shadow-lg"
                onClick={() => setShowStarRatingSection(!showStarRatingSection)}
              >
                {showStarRatingSection
                  ? "Collapse"
                  : "Expand Categorized Star Ranking View"}
              </button>
            )}
          </div>

          {version === "v2" && showStarRatingSection && evaluatedIdeas && (
            <>
              <div className="p-8">
                <ClusterView
                  data={evaluatedIdeas}
                  clusterTitles={summaries.sort((a, b) => a.id - b.id).map(cluster => cluster.name)}
                  sessionId={params.id}
                />
              </div>
            </>
          )}

          {version === "v1" && (
            <div className="flex flex-wrap align-middle justify-center transition-all duration-300">
              <div
                ref={chartRef}
                className={`relative p-4 m-2 bg-white shadow-md rounded-lg transition-all duration-300 ${
                  openDetail === "table"
                    ? "w-4/5 h-dvh"
                    : openDetail === "chart"
                    ? "w-1/6 h-56"
                    : "w-2/5 h-[500px]"
                }`}
              >
                {openDetail === "table" && (
                  <button
                    className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full"
                    onClick={() => setOpenDetail(null)}
                  >
                    {collapse}
                  </button>
                )}
                <div className="flex overflow-scroll h-full">
                  <div className="p-4">
                    <table>
                      <caption>Similarity Details</caption>
                      <thead>
                        <tr key="header" className="px-4">
                          <td className="px-4">#</td>
                          <td className="px-4">Idea</td>
                          <td className="px-4">Similarity</td>
                        </tr>
                      </thead>
                      <tbody>
                        {evaluatedIdeas?.map((evalIdea, i) => (
                          <tr
                            key={i}
                            className="px-4 hover:bg-slate-100 cursor-copy"
                            onClick={(e) => copyToClipboard(evalIdea.idea, e)}
                          >
                            <td className="px-4">{i + 1}</td>
                            <td className="px-4">{evalIdea.idea}</td>
                            <td className="px-4">
                              {evalIdea.similarity_score.toFixed(2)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {showPopup && (
                      <div
                        className="fixed bg-green-500 text-white px-2 py-1 rounded shadow text-sm"
                        style={{
                          left: `${mousePosition.x + 15}px`,
                          top: `${mousePosition.y + 12}px`,
                        }}
                      >
                        Copied to clipboard!
                      </div>
                    )}
                  </div>
                </div>

                <button
                  className="absolute bottom-2 right-2 p-2 bg-gray-200 rounded-full"
                  onClick={() =>
                    setOpenDetail(openDetail === "table" ? null : "table")
                  }
                >
                  {openDetail === "table" ? collapse : expand}
                </button>
              </div>
              {evaluatedIdeas && evaluatedIdeas.length < 200 && (
                <div
                  ref={chartRef}
                  className={`relative p-4 m-2 bg-white shadow-md rounded-lg transition-all duration-300 ${
                    openDetail === "chart"
                      ? "w-4/5"
                      : openDetail === "table"
                      ? "w-1/6 h-56"
                      : "h-[500px] w-[450px]"
                  }`}
                >
                  {openDetail === "chart" && (
                    <button
                      className="absolute top-2 right-2 p-2 bg-gray-200 rounded-full"
                      onClick={() => setOpenDetail(null)}
                    >
                      {collapse}
                    </button>
                  )}
                  <div className="w-full flex items-center justify-center">
                    <div className="p-4 w-full h-full">
                      <BubbleChart plotData={relationshipGraph} rankedIdeas={evaluatedIdeas}/>
                    </div>
                  </div>
                  <button
                    className="absolute bottom-2 right-2 p-2 bg-gray-200 rounded-full"
                    onClick={() =>
                      setOpenDetail(openDetail === "chart" ? null : "chart")
                    }
                  >
                    {openDetail === "chart" ? collapse : expand}
                  </button>
                </div>
              )}
            </div>
          )}
          {version === "v2" && (
            <div className="w-full flex items-center justify-center">
              <div className="p-4 w-full h-full">
              <BubbleChart plotData={relationshipGraph} rankedIdeas={evaluatedIdeas}/>
              </div>
            </div>
          )}

          {evaluatedIdeas && evaluatedIdeas.length >= 200 && (
            <div className="flex justify-center items-center">
              {"Cannot display SimScore chart for more than 200 statements."}
            </div>
          )}
        </>
      )}
      {!isLoading && !evaluatedIdeas && (
        <div className="flex justify-center items-center">
          {"Aww, sorry. We couldn't find any data for that session."}
        </div>
      )}
    </div>
  );
}
