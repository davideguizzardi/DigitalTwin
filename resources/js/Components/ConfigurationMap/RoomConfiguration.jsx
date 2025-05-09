import React, { useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Text, Image, Circle, Label, Tag } from "react-konva";
import { Table } from "flowbite-react";
import useImage from "use-image";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { getIcon } from "../Commons/Constants";
import { TouchKeyboard2 } from "../Commons/TouchKeyboard2";
import { apiFetch } from "../Commons/Constants";
import { backend } from "../Commons/Constants";
import Cookies from 'js-cookie';
import ListButtons from "../Commons/ListButtons";
import { domain } from "../Commons/Constants";

window.Konva.hitOnDragEnabled = true;
const token = Cookies.get("auth-token");
const zoomScale=3

const RoomConfiguration = ({ backSection, endSection, isInitialConfiguration = true }) => {
  const [maps, setMaps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFloor = maps[currentIndex]?.floor;


  const [image] = useImage(`${domain}/${maps[currentIndex]?.url}`);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const [scale,setScale]=useState(1)

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState([]);
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState(null);
  const [addingRoom, setAddingRoom] = useState(false);
  const { t } = useLaravelReactI18n();

  const [lastCenter, setLastCenter] = useState(null);
  const [dragStopped, setDragStopped] = useState(false);

  const getCenter = (p1, p2) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handleTouchMove = useCallback((e) => {
    if(scale!=1){

      e.evt.preventDefault();
      const touch1 = e.evt.touches[0];
      const touch2 = e.evt.touches[1];
      const stage = e.target.getStage();
      
      // we need to restore dragging, if it was cancelled by multi-touch
      if (touch1 && !touch2 && !stage.isDragging() && dragStopped) {
        stage.startDrag();
        setDragStopped(false);
      }
      
      if (touch1 && touch2) {
        // if the stage was under Konva's drag&drop
        // we need to stop it and implement our own pan logic with two pointers
        if (stage.isDragging()) {
          stage.stopDrag();
          setDragStopped(true);
      }
      
      const p1 = {
        x: touch1.clientX,
        y: touch1.clientY,
      };
      const p2 = {
        x: touch2.clientX,
        y: touch2.clientY,
      };
      
      if (!lastCenter) {
        setLastCenter(getCenter(p1, p2));
        return;
      }
      
      const newCenter = getCenter(p1, p2);
      
      // calculate new position of the stage
      const dx = newCenter.x - lastCenter.x;
      const dy = newCenter.y - lastCenter.y;
      
      setPosition({
        x: position.x + dx,
        y: position.y + dy,
      });
      
      setLastCenter(newCenter);
    }
  }
  }, [dragStopped, lastCenter, position]);
  
  const handleTouchEnd = () => {
    setLastCenter(null);
  };
  
  
  const fetchMap = async () => {
    const apiRoute = route('map.index');
    const response = await fetch(apiRoute, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const result = await response.json();
    setMaps(result.maps);
    setCurrentIndex(0);
  };
  
  useEffect(() => {
    fetchMap();
  }, []);

  useEffect(() => {
    if (!image) return;
    
    const aspectRatio = image.width / image.height;
    const targetHeight = window.innerHeight * 0.7;
    const targetWidth = targetHeight * aspectRatio;
    
    setFrameWidth(targetWidth);
    setFrameHeight(targetHeight);

    const fetchData = async () => {
      const data = await apiFetch("/room");
      if (data && data.length > 0) {
        data.forEach(room => {
          const rawPoints = JSON.parse(room.points);
          const pixelPoints = rawPoints.map((value, index) =>
            index % 2 === 0
              ? (value / 100) * targetWidth
              : (value / 100) * targetHeight
          );
          room.points = pixelPoints;
        });
        setRooms(data);
      }
    };

    fetchData();
  }, [image]);


  const floorBtn = maps.map((element, index) => ({
    callback: () => setCurrentIndex(index),
    text: element.floor,
    icon: <></>,
  }));

  const handleConfigurationSubmit = async () => {
    const body = {
      data: rooms.map(({ name, floor, points }) => {
        const percentPoints = points.map((value, index) =>
          index % 2 === 0
            ? (value / frameWidth) * 100
            : (value / frameHeight) * 100
        );
        return {
          name,
          floor,
          points: JSON.stringify(percentPoints),
        };
      }),
    };

    try {
      const response = await apiFetch("/room","PUT",body)

      if (response) {
        endSection()
      } else {
        alert(t("Some error occurred"));
      }
    } catch (err) {
      console.error("Submit error:", err);
      alert(t("Network error"));
    }
  };

  const removeRoom = (deleted_room) => {
    apiFetch(`/room/${deleted_room.name}`, "DELETE").then(() => {
      setRooms(prevRooms => prevRooms.filter(room => room !== deleted_room));
    });
  };

  const handleMouseDown = (e) => {
    if (addingRoom) {
      const stage = e.target.getStage();
      const pointerPos = stage.getPointerPosition();
      const imageNode = stage.findOne('Image'); 
  
      if (imageNode) {
        const imagePos = imageNode.getClientRect(); 
        const imageX = (pointerPos.x - imagePos.x) / scale; 
        const imageY = (pointerPos.y - imagePos.y) / scale; 
  
        const newPoint = { x: imageX, y: imageY };
  
        if (isRoomClosed) {
          setCurrentRoom([]);
          setIsRoomClosed(false);
        }
  
        if (currentRoom.length > 2 &&
          Math.abs(newPoint.x - currentRoom[0].x) < 10 &&
          Math.abs(newPoint.y - currentRoom[0].y) < 10) {
          const roomName = currentRoomName;
          if (roomName) {
            setRooms([...rooms, {
              points: currentRoom.flatMap(point => [point.x, point.y]),
              name: roomName,
              floor: currentFloor
            }]);
          }
          setIsRoomClosed(true);
          setAddingRoom(false);
          setCurrentRoomName("");
          setCurrentRoom([]);
        } else {
          setCurrentRoom(prevPoints => [...prevPoints, newPoint]);
        }
      }
    }
  };
  



  const handleDoubleClick = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    if(scale!=1){
      setScale(1)
      setPosition({
        x: 0,
        y: 0,
      });
    }
    else
    {
      setScale(zoomScale)
      setPosition({
        x: -pos.x,
        y: -pos.y,
      });
    }

  };

  return (
    <div className="relative flex flex-col gap-5 w-full">
      <div className="grid grid-cols-5 md:h-[67vh] 2xl:h-[70vh]">
        <div className="col-span-3 relative flex flex-row items-center justify-center ">
          <div className="">

            <Stage
              scaleX={scale}
              scaleY={scale}
              x={position.x}
              y={position.y}
              draggable = {scale!=1}
              width={scale>1?window.innerWidth * 0.5 :frameWidth}
              height={frameHeight}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              onClick={handleMouseDown}
              onDblClick={handleDoubleClick}
            >
              <Layer>
                {image && (
                  <Image image={image} width={frameWidth} height={frameHeight} />
                )}

                {currentRoom.length > 1 && (
                  <Line
                    points={currentRoom.flatMap(p => [p.x, p.y])}
                    stroke="blue"
                    strokeWidth={2}
                    closed={false}
                  />
                )}

                {currentRoom.map((point, idx) => (
                  <Circle
                    key={idx}
                    x={point.x}
                    y={point.y}
                    radius={5}
                    fill="blue"
                    stroke="black"
                    strokeWidth={2}
                  />
                ))}

                {rooms.filter(room => room.floor === currentFloor).map((room, idx) => (
                  <React.Fragment key={idx}>
                    <Line points={room.points} stroke="red" strokeWidth={3} closed />
                    <Label x={room.points[0]} y={room.points[1]}>
                      <Tag fill="red" cornerRadius={4} />
                      <Text text={room.name} fontSize={16} fill="white" padding={5} />
                    </Label>
                  </React.Fragment>
                ))}
              </Layer>
            </Stage>
          </div>

          <div className="flex flex-col justify-center items-center">
            <h1 className="text-lg dark:text-white">{t("Floors")}</h1>
            <ListButtons dataButtons={floorBtn} index={currentIndex} />
          </div>
        </div>

        <div className="col-span-2 flex flex-col gap-5 mr-5 mt-14 overflow-auto">



          {addingRoom && currentRoomName &&

            <div className="p-4 my-2 bg-zinc-100 rounded-lg shadow-md w-full">
              <div className="flex flex-row items-center gap-2 mb-2">
                {getIcon("info")}
                <h3 className="text-lg font-semibold">{t("How to Use")}</h3>
              </div>
              <div>
                Draw the perimeter of <b>{currentRoomName}</b> by clicking on the edges of the room.
                The room will be added when you close the shape.
              </div>

            </div>

          }
          <div className="overflow-auto">
            <Table className="text-gray-800">
              <Table.Body className="divide-y">
                {rooms
                  .filter(room => room.floor === currentFloor)
                  .map((room, idx) => (
                    <Table.Row key={idx}>
                      <Table.Cell>{room.name}</Table.Cell>
                      <Table.Cell className="justify-end flex">
                        <StyledButton variant="delete" onClick={() => removeRoom(room)}>
                          {getIcon("delete")} {t("Delete")}
                        </StyledButton>
                      </Table.Cell>
                    </Table.Row>
                  ))}

              </Table.Body>
            </Table>
          </div>
        </div>
      </div>

      {
        isInitialConfiguration ?
          <div className="grid grid-cols-2  w-full">
            <div className="flex justify-start">
              <StyledButton onClick={() => backSection()}>
                {getIcon("arrow_left")}{t("Back")}
              </StyledButton>
            </div>

            <div className="flex justify-end">

              <StyledButton onClick={() => handleConfigurationSubmit()}>
                {t("Next")}{getIcon("arrow_right")}
              </StyledButton>

            </div>
          </div>
          :
          <div className="flex w-full h-min py-3 items-end justify-center">
            <StyledButton onClick={() => { handleConfigurationSubmit() }}>{t("Save")}</StyledButton>
          </div>
      }
      <div className="absolute top-3 right-10 flex flex-row gap-2 w-2/5 pl-12">

        <div className="w-8/12">

          <TouchKeyboard2
            inputValue={currentRoomName}
            value={currentRoomName}
            onChange={(e) => setCurrentRoomName(e.target.value)}
          />
        </div>

        <StyledButton variant="primary" onClick={() => setAddingRoom(true)}>
          {getIcon("plus")} {t("Add room")}
        </StyledButton>

      </div>
    </div >

  );
};

export default RoomConfiguration;
