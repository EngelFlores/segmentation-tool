import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import { Button, Input } from "antd";

import "./ClassSelector.css"

const ClassSelector = ({ setColor, setClasses, classes, setSelectedClassId, selectedClassId }) => {
  const [newClassName, setNewClassName] = useState("");
  const [newClassColor, setNewClassColor] = useState("#000000");

  const handleColorChange = (index, newColor) => {
    setClasses((prevClasses) => {
      const updatedClasses = [...prevClasses];
      updatedClasses[index].color = newColor;
      return updatedClasses
    })
  };

  const handleSelectClass = (id) => {
    setSelectedClassId(id);

    const selectedClass = classes.find(cls => cls.id === id);

    if (selectedClass) {
      setColor(selectedClass.color);
    }
  }

  const addClass = () => {
    if (newClassName.trim() === "") return;

    const newClass = {
      id: uuidv4(),
      name: newClassName,
      color: newClassColor,
      annotations: []
    };

    setClasses((prevClasses) => {
      const updatedClasses = [...prevClasses, newClass];
      return updatedClasses
    })
    setNewClassName("");
  };

  const removeClass = (id) => {
    setClasses((prevClasses) => {
      const updatedClasses = prevClasses.filter(cls => cls.id !== id);
      return updatedClasses;
    });

    if (selectedClassId === id) {
      setSelectedClassId(null);
    }
  };

  return (
    <div>
      <h3>Classes</h3>
      <div className="class-selector">
        <Input
          className="input"
          type="text"
          placeholder="Class Name"
          value={newClassName}
          onChange={(e) => setNewClassName(e.target.value)}
        />
        <Input
          className="input"
          type="color"
          value={newClassColor}
          onChange={(e) => setNewClassColor(e.target.value)}
        />
        <Button className="button" onClick={addClass}>Add Class</Button>
      </div>
      {classes?.map((cls, index) => (
        <div
        className="selector"
          onClick={() => handleSelectClass(cls.id)}
          key={cls.id}
          style={{
            backgroundColor: selectedClassId === cls.id ? "#ddd" : "transparent"
          }}
        >

          <span>{cls.name}</span>

          <Input
            className="input"
            type="color"
            value={cls.color}
            onClick={(e) => e.stopPropagation()}
            onChange={(e) => handleColorChange(index, e.target.value)}
          />

          <Button className="button" onClick={(e) => {
            e.stopPropagation();
            removeClass(cls.id);
          }}>
            Remover
          </Button>
        </div>
      ))}


    </div>
  );
};

export default ClassSelector;
