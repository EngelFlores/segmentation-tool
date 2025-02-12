import { useEffect, useRef, useState, useCallback } from "react";
import { InputNumber, Button, Radio, Input } from "antd";
import { v4 as uuidv4 } from "uuid";
import ClassSelector from "../ClassSelector/ClassSelector";
import * as fabric from "fabric";
import "antd/dist/reset.css";
import "./SegmentationTool.css";

import encodeRLE from "../../utils/encodeRLE"
import convertToArray from "../../utils/converArray"

const Segmentation = ({ setAnnotation }) => {
  const canvasRef = useRef(null);
  const canvasInstance = useRef(null);
  const brushInstance = useRef(null);
  const polygonInstance = useRef(null);
  const [tool, setTool] = useState("brush");
  const [brushSize, setBrushSize] = useState(10);
  const [color, setColor] = useState("#ff0000");
  const [classes, setClasses] = useState([])
  const [polygonPoints, setPolygonPoints] = useState([]);
  const [brushPoints, setBrushPoints] = useState([]);
  const [showCanvas, setShowCanvas] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [fileInfo, setFileInfo] = useState(null)

  useEffect(() => {
    if (tool === "brush" && brushInstance.current) {
      brushInstance.current.color = color;
      brushInstance.current.width = brushSize;
    }

    if (tool === "polygon" && polygonInstance.current) {
      polygonInstance.current.set({ fill: color })
      canvasInstance.current.renderAll();
    }
  }, [color, tool, brushSize])

  useEffect(() => {
    if (tool === "brush" && brushPoints.length) {
      let { width, height } = fileInfo
      const convertedPoints = encodeRLE(width, height, brushPoints)
      setClasses((prevClasses) =>
        prevClasses?.map((cls) =>
          cls.id === selectedClassId
            ? { ...cls, annotations: convertedPoints }
            : cls
        )
      )
    }
    else if (tool === "polygon" && polygonPoints.length) {
      let { width, height } = fileInfo
      const convertedArray = convertToArray(polygonPoints)
      const convertedPoints = encodeRLE(width, height, convertedArray)
      setClasses((prevClasses) =>
        prevClasses?.map((cls) =>
          cls.id === selectedClassId
            ? { ...cls, annotations: convertedPoints }
            : cls
        )
      )
    }
  }, [polygonPoints, brushPoints, fileInfo])


  const handleAnnotation = useCallback((newAnnotation) => {
    setAnnotation((prev) => [...prev, newAnnotation]);
  }, []);

  const exportAnnotations = () => {
    fileInfo.segmentation = classes
    console.log(fileInfo)
    handleAnnotation(fileInfo)
  }

  const handleImageUpload = (event) => {
    if (!canvasInstance.current) {
      canvasInstance.current = new fabric.Canvas(canvasRef.current);
    }

    setShowCanvas(true)
    const file = event.target.files[0];
    if (file && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const imgObj = new Image();
        imgObj.src = event.target.result;

        imgObj.onload = () => {
          const canvas = canvasInstance.current
          setFileInfo({ id: uuidv4(), fileName: file.name, width: imgObj.width, height: imgObj.height })

          handleTool(tool)

          const fabricImage = new fabric.FabricImage(imgObj, {
            left: 0,
            top: 0,
            scaleX: canvas.width / imgObj.width,
            scaleY: canvas.height / imgObj.height,
            selectable: false,
          });
          canvas.add(fabricImage);
        };
      };
      reader.readAsDataURL(file);
    }
  };

  const clearCanvas = () => {
    canvasInstance.current.clear();
    setPolygonPoints([]);
    setShowCanvas(false)
    setBrushPoints([])
    setClasses([])
    setColor("#ff0000")
    setTool("brush")
    setSelectedClassId(null)
    setFileInfo(null)
  };

  const handleTool = (value) => {
    setTool(value);

    const canvas = canvasInstance.current

    if (value === "brush") {
      let points = [];
      brushInstance.current = new fabric.PencilBrush(canvas);
      brushInstance.current.width = brushSize;
      brushInstance.current.color = color;
      canvas.freeDrawingBrush = brushInstance.current;
      canvas.isDrawingMode = true;

      canvas.on('mouse:up', () => {
        if (canvas.freeDrawingBrush && canvas.freeDrawingBrush._points) {
          points = canvas.freeDrawingBrush._points.map((p) => ([p.x, p.y]));

          setBrushPoints((prevPoints) => {
            const newPoints = [...prevPoints, ...points];

            return newPoints
          })
        }
      });
    }

    else if (value === "polygon") {
      canvas.isDrawingMode = false;
      canvas.off("mouse:down");
      canvas.on('mouse:down', (options) => {
        const pointer = canvas.getViewportPoint(options.e);
        setPolygonPoints((prevPoints) => {
          const polygonNewPoints = [...prevPoints, { "x": pointer.x, "y": pointer.y }];

          if (polygonInstance.current) {
            canvas.remove(polygonInstance.current);
          }

          const polygon = new fabric.Polygon(polygonNewPoints, {
            stroke: 'blue',
            strokeWidth: 2,
            fill: color,
          });

          polygonInstance.current = polygon
          canvas.add(polygon);
          return polygonNewPoints
        })
      });
    }
  };

  const disabledExport = () => {
    return !((polygonPoints.length || brushPoints.length) && classes.length)
  }

  return (
    <>
      <div className="container-section left">
        <h1>Upload the image</h1>
        <Input className="input" type="file" accept="image/*" onChange={handleImageUpload} />
        <canvas ref={canvasRef} className="canvas" width={500} height={500}></canvas>
      </div>
      <div className="container-section right">
        <ClassSelector
          polygonInstance={polygonInstance.current}
          brushInstance={brushInstance.current}
          setColor={setColor}
          classes={classes}
          setClasses={setClasses}
          selectedClassId={selectedClassId}
          setSelectedClassId={setSelectedClassId}
          polygonPoints={polygonPoints}
          brushPoints={brushPoints}
          tool={tool}
        >
        </ClassSelector>
        {showCanvas && (
          <>
            {!!classes.length && (
              <>
                <div>
                  <Radio.Group value={tool} onChange={(event) => handleTool(event.target.value)}>
                    <Radio.Button className="button" value="brush">Brush Anotation</Radio.Button>
                    <Radio.Button className="button" value="polygon">Polygon Anotation</Radio.Button>
                  </Radio.Group>
                </div>
                {tool === "brush" && (
                  <>
                    <InputNumber
                      className="button"
                      min={1}
                      max={50}
                      value={brushSize}
                      onChange={setBrushSize}
                      addonBefore="Brush Size"
                    />
                  </>
                )}
              </>
            )}

            <Button className="button" onClick={clearCanvas}>Clear Canvas</Button>
            <Button className="button" disabled={disabledExport()} onClick={exportAnnotations}>Export Annotations COCO Format</Button>
          </>
        )}
      </div>
    </>
  );
};

export default Segmentation;