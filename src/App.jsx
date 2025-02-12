import { useState } from "react"
import SegmentationTool from "./components/SegmentationTool/SegmentationTool.jsx"

import "./App.css"

function App() {
  const [annotation, setAnnotation] = useState([])

  return (
    <div className="container">
      <SegmentationTool setAnnotation={setAnnotation}></SegmentationTool>
    </div>

  )
}

export default App
