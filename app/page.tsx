"use client";

import { useState } from "react";
import BubbleChart from "./components/BubbleChart";
import ClusterChart from "./components/ClusterChart";
import { PlotData, IdeasAndSimScores } from "./constants";
import Textarea from "react-dropzone-textarea";
import DragDrop from "./components/DragDrop";
import Link from "next/link";

export default function Home() {

  return (
    <div className="flex min-h-screen flex-col items-center justify-around p-24">
      <div className="relative flex place-items-center">
        <div className="text-2xl font-semibold relative dark:drop-shadow-[0_0_0.3rem_#ffffff70] dark:invert">
          <h1>SimScore</h1>
        </div>
      </div>
      <div className="flex justify-center space-x-4">
        <Link href="/create" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
          Create Analysis
        </Link>
        <Link href="/manage" className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
          Manage Submissions
        </Link>
      </div>
    </div>
  );
}
