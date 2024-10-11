"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Textarea from "react-dropzone-textarea";
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

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsLoading(true);
    let ideas = input.split("\n").filter((idea) => idea.trim() !== "");

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
            onClick={handleSubmit}
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
