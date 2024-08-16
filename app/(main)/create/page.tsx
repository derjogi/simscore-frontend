"use client";

import { useState } from "react";
import { useRouter } from 'next/navigation';
import { PlotData, IdeasAndSimScores } from "@/constants";
import Textarea from "react-dropzone-textarea";
import Link from "next/link";

export default function Create() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState<IdeasAndSimScores>();
  const [plotData, setPlotData] = useState<PlotData>();
  const [isLoading, setIsLoading] = useState(false);
  const [id, setId] = useState("");

  const router = useRouter();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    const host = process.env.SIMSCORE_API;
    const processAPI = host + "/process";

    let ideas = input.split("\n").filter((idea) => idea.trim() !== "");

    fetch(processAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(ideas),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Data: ", data);
        setIsLoading(false);
        setId(data.id);
        localStorage.setItem(`sessionData_${data.id}`, JSON.stringify(data));
        router.push(`/session/${data.id}`);
      })
  };

  return (
    <>
      {!plotData && (
        // Show a form if plotData isn't set yet:
        <div className="space-y-4">
          <form className="space-y-2" onSubmit={handleSubmit}>
            <label
              htmlFor={"answer"}
              className="block mb-2 text-sm font-medium text-gray-900 dark:text-white"
            >
              Type or upload your answer(s). Separate them by ⏎ (new lines)
            </label>
            <Textarea
              id="answer"
              value={input}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setInput(e.target.value)
              }
              onDropRead={(text: string) => setInput(text)}
              textareaProps={{
                cols: 80,
                rows: 8,
                placeholder: "Enter your answers, or upload a file here...",
                className: "!bg-white border-2 rounded-lg p-2",
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
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}
    </>
  );
}
