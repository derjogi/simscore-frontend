'use client'

import { useState } from "react";
import BubbleChart from "./components/BubbleChart";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { PlotData, OutputItem } from "./constants";

export default function Home() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputItem[]>([]);
  const [plotData, setPlotData] = useState<PlotData>();

  Chart.register(CategoryScale);
  
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const host = "https://" + process.env.BACKEND_URL
    console.log(host)
    const processAPI = host + "/api/process"
    const response = await fetch(processAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify({
        content: input,
      }),
    })
     .then((res) => res.json())
     .then((data) => {
        setOutput(data.message)
        setPlotData(data.plot_data)
      }
    );
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center bg-gradient-to-t from-white via-white dark:from-black dark:via-black lg:static lg:h-auto lg:w-auto lg:bg-none">
          
        </div>
      </div>

      <div className="relative flex place-items-center before:absolute before:h-[300px] before:w-[480px] before:-translate-x-1/2 before:rounded-full before:bg-gradient-radial before:from-white before:to-transparent before:blur-2xl before:content-[''] after:absolute after:-z-20 after:h-[180px] after:w-[240px] after:translate-x-1/3 after:bg-gradient-conic after:from-sky-200 after:via-blue-200 after:blur-2xl after:content-[''] before:dark:bg-gradient-to-br before:dark:from-transparent before:dark:to-blue-700 before:dark:opacity-10 after:dark:from-sky-900 after:dark:via-[#0141ff] after:dark:opacity-40 before:lg:h-[360px]">
        <div
          className="text-2xl font-semibold relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert">
          <h1>Centroid Analysis</h1>   
        </div>
      </div>

      <div className="w-full space-y-4">
        <form className="space-y-2" onSubmit={handleSubmit}>
          <label htmlFor={"answer"} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Type or upload your answer(s). Separate them by ⏎ new lines</label>
          <textarea 
            id="answer" 
            rows={4}
            className="p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" 
            placeholder="Enter your answers..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          ></textarea>
          <button 
            type="submit" 
            onClick={handleSubmit}
            className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
          >
            Process
          </button>
        </form>
        
        {plotData &&
          (<div>
              <hr />
              <div className="pt-4 space-y-2">
                <h2>Results:</h2>
                  <BubbleChart plotData={plotData} />
                <div className="space-y-2">
                  {output.map((item, index) => (
                    <div key={index} className="flex justify-between">
                      <span>{item.idea}</span>
                      <span>Similarity: {item.similarity}</span>
                    </div>
                  ))}
                </div>
            </div>
          </div>
          )
        }
      </div>
    </main>
  );
}
