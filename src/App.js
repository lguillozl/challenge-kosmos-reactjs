import React, { useRef, useState, useEffect } from "react";
import Moveable from "react-moveable";

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([]);
  const [selected, setSelected] = useState(null);

  const addMoveable = async() => {
    
    // Fetch the photos and get a random photo URL
    const response = await fetch("https://jsonplaceholder.typicode.com/photos");
    const photos = await response.json();
    const randomIndex = Math.floor(Math.random() * photos.length);
    const randomPhoto = photos[randomIndex].url;

    // Create a new moveable component and add it to the array
    const COLORS = ["red", "blue", "yellow", "green", "purple"];

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        imageUrl: randomPhoto,
        updateEnd: true
      },
    ]);
  };

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        return { id, ...newComponent, updateEnd };
      }
      return moveable;
    });
    setMoveableComponents(updatedMoveables);
  };


  const handleResizeStart = (index, e) => {
    console.log("e", e.direction);
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction;
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log("width", moveableComponents, e);
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left;
      const initialWidth = e.width;

      // Set up the onResize event handler to update the left value based on the change in width
    }
  };

  const handleDelete = () => {
    const updatedMoveables = moveableComponents.filter(
      (moveable) => moveable.id !== selected
    );
    setMoveableComponents(updatedMoveables);
    setSelected(null);
  };

  return (
    <main style={{ height : "100vh", width: "100vw" }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button onClick={handleDelete}>Delete</button>
      <div
        id="parent"
        style={{
          position: "relative",
          background: "black",
          height: "80vh",
          width: "80vw",
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  );
};

export default App;

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd,
  imageUrl
}) => {
  const ref = useRef();

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    imageUrl,
    id,
  });

  let parent = document.getElementById("parent");
  let parentBounds = parent?.getBoundingClientRect();

  const handleClick = () => {
    setSelected(id);
  };
  
  const onResize = async (e) => {
    // Update top, left, width, and height values
    let newWidth = e.width;
    let newHeight = e.height;

    let newTop = top + e.drag.beforeTranslate[1];
    let newLeft = left + e.drag.beforeTranslate[0];

    const positionMaxTop = newTop + newHeight;
    const positionMaxLeft = newLeft + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - newTop;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - newLeft;

    updateMoveable(id, {
      top: newTop,
      left: newLeft,
      width: newWidth,
      height: newHeight,
      color,
      imageUrl
    });

    // Update nodoReferencia values
    const { beforeTranslate } = e.drag;

    ref.current.style.width = `${e.width}px`;
    ref.current.style.height = `${e.height}px`;

    let translateX = beforeTranslate[0];
    let translateY = beforeTranslate[1];

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`;

    setNodoReferencia({
      ...nodoReferencia,
      translateX: beforeTranslate[0],
      translateY: beforeTranslate[1],
      width: newWidth,
      height: newHeight,
      top: newTop < 0 ? 0 : newTop,
      left: newLeft < 0 ? 0 : newLeft,
    });
  };

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width;
    let newHeight = e.lastEvent?.height;
    let newTop = top + e.drag.beforeTranslate[1];
    let newLeft = left + e.drag.beforeTranslate[0];

    const positionMaxTop = newTop + newHeight;
    const positionMaxLeft = newLeft + newWidth;

    if (positionMaxTop > parentBounds?.height)
      newHeight = parentBounds?.height - newTop;
    if (positionMaxLeft > parentBounds?.width)
      newWidth = parentBounds?.width - newLeft;

    const { lastEvent } = e;
    const { drag } = lastEvent;
    const { beforeTranslate } = drag;

    const absoluteTop = newTop < 0 ? 0 : newTop;
    const absoluteLeft = newLeft < beforeTranslate[0];

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        imageUrl
      },
      true
    );
  };

  return (
    <>
      <img
        src={imageUrl}
        ref={ref}
        className="draggable"
        id={"component-" + id}
        style={{
          position: "absolute",
          top: top,
          left: left,
          width: width,
          height: height,
          background: color,
        }}
        onClick={handleClick}
      />

      <Moveable
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            imageUrl
          });
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={["nw", "n", "ne", "w", "e", "sw", "s", "se"]}
        edge={false}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  );
};
