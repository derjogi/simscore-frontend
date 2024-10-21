"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PlotData, IdeasAndSimScores } from "@/constants";
import Textarea from "react-dropzone-textarea";
import * as XLSX from "xlsx";
import { data } from "autoprefixer";
import LZString from "lz-string";
import { useSearchParams } from 'next/navigation';

export default function Create() {
  const [input, setInput] = useState("");
  const [storeResults, setStoreResults] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [_, setId] = useState("");

  const searchParams = useSearchParams();
  const showIdeaInput = searchParams.get('advanced') == 'true';

  const router = useRouter();

  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<string[][]>([]);
  const [fullData, setFullData] = useState<string[][]>([]);

  const [idColumn, setIdColumn] = useState<number | null>(null);
  const [dataColumn, setDataColumn] = useState<number | null>(null);

  const handleSubmitForm = async (e: any) => {
    e.preventDefault();
    const ideas = input.split("\n").filter((idea) => idea.trim() !== "");
    handleSubmit(ideas);
  }

  const handleSubmitXLS = async (processedData: string[][]) => {
    handleSubmit(processedData);
  }
  const handleSubmit = async (ideas: string[][] | string[]) => {        
    setIsLoading(true);

    const payload = {
      ideas: ideas,
      store_results: storeResults,
    };
    
    // This is being processed with python, which goes to a separate server:
    const processAPI = "/fastapi/process";
  
    fetch(processAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: JSON.stringify(payload),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log("Data: ", data);
        setIsLoading(false);
        setId(data.id);
        const compressedData = LZString.compress(JSON.stringify(data));
        localStorage.setItem(`sessionData_${data.id}`, compressedData);
        router.push(`/session/${data.id}`);
      });
  };

  const customTextConverter = (binary: any) => {
    console.log(`Converting ${binary.byteLength} bytes`);
    return new Promise((resolve, reject) => {
      try {
        //
        // Read and parse workbook using XLSX, first worksheet only
        //
        // https://github.com/sheetjs/
        // https://github.com/sheetjs/sheetjs#utility-functions
        //
        const workbook = XLSX.read(binary, { type: "array" });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];

        // const csv = XLSX.utils.sheet_to_csv(worksheet);
        // resolve(csv);

        const json = XLSX.utils.sheet_to_json<string[]>(worksheet, {
          header: 1,
          blankrows: false,
        });
        // This will be an array of arrays, with the headers in the first array.
        // Ask the user which of those headers (if any) they want to use as 'id', and which as the 'data'.
        const preview: string[][] = json.slice(0, 4);
        setPreviewData(preview); // Get first 4 rows (including header)
        setShowPreview(true);
        setFullData(json);

        resolve(json);
        console.log("parsed XLSX");
      } catch (error) {
        // Display error in textarea and console
        console.error(error);
        resolve(error);
      }
    });
  };

  const truncateText = (text: string, maxLength: number = 30) => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };

  interface PreviewPopupProps {
    data: string[][];
    onClose: () => void;
    onConfirm: () => void;
  }

  const PreviewPopup: React.FC<PreviewPopupProps> = ({
    data,
    onClose,
    onConfirm,
  }) => {
    const headerValues = data[0];
    const dataValues = data.slice(1);
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center">
        <div className="bg-white p-5 rounded-lg">
          <h2 className="text-xl mb-4">Select ID and Data Columns</h2>
          <table className="mb-4">
            <thead>
              <tr>
                {data[0].map((header: string, index: number) => (
                  <th key={index} className="px-4 py-2">
                    {truncateText(header)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataValues.map((row: string[], rowIndex: number) => (
                <tr key={rowIndex}>
                  {row.map((cell: string, cellIndex: number) => (
                    <td key={cellIndex} className="border px-4 py-2">
                      {truncateText(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <div className="flex justify-evenly">
            <select
              value={idColumn !== null ? idColumn.toString() : "Select a value"}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setIdColumn(Number(e.target.value))
              }
            >
              <option value="">Select ID Column</option>
              {headerValues.map((header: string, index: number) => (
                <option key={index} value={index}>
                  {header}
                </option>
              ))}
            </select>
            <select
              value={dataColumn !== null ? dataColumn.toString() : "Select a alue"}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                setDataColumn(Number(e.target.value))
              }
            >
              <option value="">Select Data Column</option>
              {headerValues.map((header: string, index: number) => (
                <option key={index} value={index}>
                  {header}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              onClick={onClose}
              className="mr-2 px-4 py-2 bg-gray-300 rounded"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 bg-blue-500 text-white rounded"
            >
              Confirm
            </button>
          </div>
        </div>
      </div>
    );
  };

  type IdeaValidity = {
    idea: string;
    // These are error strings, indicating what is wrong with the corresponding qualifier.
    // If the idea is valid, these are all empty strings.
    length: string;
    sentiment?: IndividualRating;
    singlePointFocus?: IndividualRating;
  };

  type IndividualRating = {
    quality: number;
    message: string;
  };

  type IdeaRating = {
    rating: {
      singlePointFocus: IndividualRating;
      sentiment: IndividualRating;
    };
  };

  // For individual input fields:
  const [ideas, setIdeas] = useState<string[]>([""]);
  const [ideaValidity, setIdeaValidity] = useState<IdeaValidity[]>([]);

  const addEmptyIdea = () => {
    setIdeas([...ideas, ""]);
  };

  const removeIdea = (index: number) => {
    const newIdeas = [...ideas];
    newIdeas.splice(index, 1);
    setIdeas(newIdeas);

    const newIdeaValidity = [...ideaValidity];
    newIdeaValidity.splice(index, 1);
    setIdeaValidity(newIdeaValidity);
  };

  const updateIdea = (index: number, value: string) => {
    validateFast(index, value);
    const newIdeas = [...ideas];
    newIdeas[index] = value;
    setIdeas(newIdeas);
  };

  const addNewIdeaOnEnter = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addEmptyIdea();
    }
  };

  const validateIdea = (index: number, idea: string) => {
    const lengthValidity = validateFast(index, idea);
    if (lengthValidity.length == 0) {
      queryForIdeaValidity(idea, index);
    }
  };

  const validateFast = (index: number, idea: string) => {
    console.log(`Validating idea ${index}: `, idea);
    const newIdeaValidity = [...ideaValidity];
    const lengthValidity =
      idea.trim().length < 60
        ? "Idea must be at least 60 characters long."
        : idea.trim().length > 150
        ? "Idea must be at most 150 characters long."
        : "";

    newIdeaValidity[index] = {
      idea: idea,
      length: lengthValidity,
    };
    setIdeaValidity(newIdeaValidity);
    console.log("Idea validity: ", newIdeaValidity);
    return lengthValidity;
  };

  function queryForIdeaValidity(idea: string, index: number) {
    const host = process.env.SIMSCORE_API;
    const validateAPI = host + "/validate";
    const body = JSON.stringify({ idea: idea });
    console.log("Querying for idea validity: ", body);
    fetch(validateAPI, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      redirect: "follow",
      body: body,
    })
      .then((res) => {
        try {
          const parsed = res.json();
          return parsed;
        } catch (error) {
          console.error("Error parsing JSON:", error);
          throw error;
        }
      })
      .then((stringData) => {
        const data: IdeaRating = JSON.parse(stringData);
        console.log("Data: ", data);
        console.log("Rating Manual: ", data["rating"]);
        console.log("Rating: ", data.rating);
        const prevIdeaValidity = [...ideaValidity];
        prevIdeaValidity[index] = {
          ...prevIdeaValidity[index],
          sentiment: data.rating.sentiment,
          singlePointFocus: data.rating.singlePointFocus,
        };
        setIdeaValidity(prevIdeaValidity);
      });
  }

  const getValidityError = (index: number) => {
    const validity = ideaValidity[index];
    if (!validity) return null;
    if (validity.length) return validity.length;
    if (validity.sentiment && validity.sentiment.quality < 5) {
      return validity.sentiment.message;
    }
    if (validity.singlePointFocus && validity.singlePointFocus.quality < 5) {
      return validity.singlePointFocus.message;
    }

    return null;
  };

  return (
    <>
      {showPreview && (
        <PreviewPopup
          data={previewData}
          onClose={() => setShowPreview(false)}
          onConfirm={() => {
            console.log(`Confirmed preview. id: ${idColumn}; data: ${dataColumn}`)
            if (idColumn !== null && dataColumn !== null) {
              const processedData = fullData
                .slice(1)
                .map((row) => [row[idColumn], row[dataColumn]])
                .filter(([id, data]) => id !== undefined && data !== undefined);
              setShowPreview(false);
              console.log(`Processed data: `, processedData)
              handleSubmitXLS(processedData)
            }
          }}
        />
      )}

      <div className="space-y-4">
        {/* This is an advanced input field, by default */}
        {showIdeaInput && ideas.map((idea, index) => (
          <>
            <div key={index} className="flex items-center space-x-2">
              <input
                type="text"
                value={idea}
                onChange={(e) => updateIdea(index, e.target.value)}
                onKeyUp={(e) => addNewIdeaOnEnter(e)}
                onBlur={(e) => validateIdea(index, e.target.value)}
                className={`flex-grow p-2 border rounded-lg ${
                  getValidityError(index) ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter an idea"
                autoFocus={index === ideas.length - 1}
              />
              {index === ideas.length - 1 && (
                <button
                  onClick={addEmptyIdea}
                  className="p-2 bg-blue-500 text-white rounded-lg"
                >
                  +
                </button>
              )}
              {ideas.length > 1 && (
                <button
                  onClick={() => removeIdea(index)}
                  className="p-2 bg-red-500 text-white rounded-lg"
                >
                  -
                </button>
              )}
            </div>
            {getValidityError(index) && (
              <p className="text-red-500 text-sm">{getValidityError(index)}</p>
            )}
          </>
        ))}

        <form className="space-y-2" onSubmit={handleSubmitForm}>
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
            customTextConverter={customTextConverter}
            onDropRead={(text: string) => setInput(text)}
            textareaProps={{
              cols: 80,
              rows: 8,
              placeholder: "Enter your answers, or upload a file here...",
              className: "!bg-white border-2 rounded-lg p-2",
            }}
          />
          <div className="flex items-center mb-4">
            <input
              id="store-results"
              type="checkbox"
              checked={storeResults}
              onChange={() => setStoreResults(!storeResults)}
              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
            />
            <label
              htmlFor="store-results"
              className="ml-2 text-sm font-medium text-gray-900 dark:text-gray-300"
            >
              Store results to make them shareable
            </label>
          </div>

            <button
              type="submit"
              onClick={handleSubmitForm}
              className="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Process
            </button>
          </form>
        </div>

      {isLoading && (
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
        </div>
      )}
    </>
  );
}
