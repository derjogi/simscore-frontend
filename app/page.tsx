'use client'

import { SetStateAction, useState } from "react";
import BubbleChart from "./components/BubbleChart";
import Chart from "chart.js/auto";
import { CategoryScale } from "chart.js";
import { PlotData, OutputItem } from "./constants";
import Textarea from "react-dropzone-textarea";

export default function Home() {

  const [input, setInput] = useState("");
  const [output, setOutput] = useState<OutputItem[]>([]);
  const [plotData, setPlotData] = useState<PlotData>();

  Chart.register(CategoryScale);
  
  const handleSubmit = async (e: any) => {
    console.log("Submitted!")
    e.preventDefault();
    const host = process.env.BACKEND_URL
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

  const [textInput, setTextInput] = useState("");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <div className="fixed bottom-0 left-0 flex h-48 w-full items-end justify-center  lg:static lg:h-auto lg:w-auto lg:bg-none">
          
        </div>
      </div>

      <div className="relative flex place-items-center">
        <div
          className="text-2xl font-semibold relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert">
          <h1>Centroid Analysis</h1>   
        </div>
      </div>

      <div className="w-full space-y-4">
        <form className="space-y-2" onSubmit={handleSubmit}>
          <label htmlFor={"answer"} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Type or upload your answer(s). Separate them by ⏎ new lines</label>
            <Textarea
            id="answer"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)}
              onDropRead={(text: string) => setInput(text)}
              textareaProps={{
                cols: 80,
                rows: 8,
                placeholder: "Enter your answers, or upload a file here...",
                className:"!bg-white border-2 rounded-lg p-2"
              }}
            />

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
