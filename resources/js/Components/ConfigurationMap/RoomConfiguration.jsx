import React, { useState, useEffect, useCallback } from "react";
import { Stage, Layer, Line, Text, Image, Circle, Label, Tag } from "react-konva";
import { Table, Modal } from "flowbite-react";
import useImage from "use-image";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { apiLog, getIcon, logsEvents } from "../Commons/Constants";
import { TouchKeyboard2 } from "../Commons/TouchKeyboard2";
import { apiFetch,domain } from "../Commons/Constants";
import ListButtons from "../Commons/ListButtons";
import { useContext } from "react";
import { UserContext } from "@/Layouts/UserLayout";
import { Slider } from "@mui/material";

window.Konva.hitOnDragEnabled = true;


const RoomConfiguration = ({ backSection, endSection, isInitialConfiguration = true }) => {
  const [maps, setMaps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFloor = maps[currentIndex]?.floor;


  const [image] = useImage(`${domain}/${maps[currentIndex]?.url}`);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);
  const [scale, setScale] = useState(1)

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState([]);
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState(null);
  const [openNewRoomModal, setOpenNewRoomModal] = useState(null)
  const [addingRoom, setAddingRoom] = useState(false);
  const { t } = useLaravelReactI18n();

  const [lastCenter, setLastCenter] = useState(null);
  const [dragStopped, setDragStopped] = useState(false);

  const [selectedRoom, setSelectedRoom] = useState(null)
  const [newRoomName, setNewRoomName] = useState(null)

  const user = useContext(UserContext)

  const getCenter = (p1, p2) => {
    return {
      x: (p1.x + p2.x) / 2,
      y: (p1.y + p2.y) / 2,
    };
  };

  const handleTouchMove = useCallback((e) => {
    if (scale != 1) {

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
    await fetch(domain + "/sanctum/csrf-cookie", {
      method: "GET",
      credentials: "include"
    });
    const apiRoute = route('map.index')
    const response = await fetch(apiRoute, {
      method: "GET",
      credentials: "include",
      headers: {
        "X-Requested-With": "XMLHttpRequest"
      }
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
    let targetHeight, targetWidth

    targetHeight = window.innerHeight * 0.7;
    targetWidth = targetHeight * aspectRatio;

    if (targetWidth > window.innerWidth * 0.5) {
      targetWidth = window.innerWidth * 0.5;
      targetHeight = targetWidth / aspectRatio;
    }


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


  const floorBtn = maps.sort((a, b) => a.floor - b.floor).map((element, index) => ({
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
      const response = await apiFetch("/room", "PUT", body)

      if (response) {
        if (user)
          apiLog(user.username, logsEvents.CONFIGURATION_ROOM_ADD, "", JSON.stringify(body))
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
      setRooms(prevRooms => prevRooms.filter(room => room.name !== deleted_room.name));
      if (user)
        apiLog(user.username, logsEvents.CONFIGURATION_ROOM_DELETE, deleted_room.name, "{}")
    });
    resetEditRoom()
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



  const handleZoomChange = (newScale) => {
    setScale(newScale);

    if (newScale === 1) {
      setPosition({ x: 0, y: 0 });
    } else {

      //arbitrty value to update the image when going back to scale 1 
      setPosition({
        x: 10,
        y: 10,
      });
    }
  };


  const resetEditRoom = () => {
    setSelectedRoom(null)
    setNewRoomName(null)
  }

  const handleRoomDoubleClick = (room) => {
    if (!addingRoom) {
      setSelectedRoom(room);
      setNewRoomName(room.name)
    }
  }

  const handleNameChange = async () => {
    const response = await apiFetch(`/room/${selectedRoom.name}`, "PATCH", { new_name: newRoomName })
    if (response) {
      if (user)
        apiLog(user.username, logsEvents.CONFIGURATION_ROOM_RENAME, selectedRoom.name, JSON.stringify({ new_name: newRoomName }))

      setRooms(prevRooms =>
        prevRooms.map(room =>
          room.name === selectedRoom.name
            ? { ...room, name: newRoomName }
            : room
        )
      );
      resetEditRoom()
    }
  }


  return (<>

    <Modal show={openNewRoomModal} size="xl" onClose={() => { setOpenNewRoomModal(false) }} popup dismissible>
      <Modal.Header>
        {t("Add room")}
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col">
          {t("add_room_name_description")}
          <TouchKeyboard2
            inputValue={currentRoomName}
            forceOpen={true}
            value={currentRoomName}
            onChange={(e) => setCurrentRoomName(e.target.value)}
          />
          <div className={"h-48 w-full"}>

          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex flex-col items-center w-full">

          <StyledButton
            variant="primary"
            onClick={() => {
              setAddingRoom(true);
              setOpenNewRoomModal(false)
            }}
          >
            {t("Draw room")}
          </StyledButton>
        </div>
      </Modal.Footer>
    </Modal>


    <Modal show={selectedRoom} size="xl" onClose={() => resetEditRoom()} popup dismissible>
      <Modal.Header>
        {t("Modify room")}
      </Modal.Header>
      <Modal.Body>
        <div className="flex flex-col">
          {t("edit_room_name_description")}
          <TouchKeyboard2
            inputValue={newRoomName}
            forceOpen={true}
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
          />
          <div className={"h-48 w-full"}>

          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <StyledButton
          variant="primary"
          onClick={() => {
            handleNameChange()
          }}
        >
          <div className="flex flex-row gap-2 items-center">
            {getIcon("save")} {t("Save")}
          </div>
        </StyledButton>
        <StyledButton variant="delete" onClick={() => removeRoom(selectedRoom)}>
          <div className="flex flex-row gap-2 items-center">
            {getIcon("delete")} {t("Delete Room")}
          </div>
        </StyledButton>
      </Modal.Footer>
    </Modal>

    <div className="relative flex flex-col gap-5 w-full">
      <div className="grid grid-cols-3 md:h-[67vh] 2xl:h-[70vh]">
        <div className="col-span-2 relative flex flex-col pl-4 gap-2">
          <div className="flex flex-row gap-2 items-center">
            {getIcon("zoomout", "size-8")}
            <Slider
              value={scale}
              min={1}
              max={4}
              onChange={(e, newValue) => handleZoomChange(newValue)}
              sx={{
                color: "#a3e635",
                width: "270px",
                height: "6px",
                "& .MuiSlider-rail": {
                  color: "#1F2937",
                  opacity: 1,
                },
              }}
            />
            {getIcon("zoomin", "size-8")}

            {addingRoom ?
              <StyledButton
                variant="delete"
                onClick={() => {
                  setAddingRoom(false);
                  setCurrentRoomName(null);
                  setCurrentRoom([])
                }}>
                {getIcon("close")} {t("Cancel")}
              </StyledButton>
              :

              <StyledButton variant="secondary" onClick={() => setOpenNewRoomModal(true)}>
                <div className="flex flex-row gap-2 items-center">
                  {getIcon("plus")} {t("Add room")}
                </div>
              </StyledButton>
            }

            <div className="">
              <StyledButton onClick={() => { handleConfigurationSubmit() }}>
                <div className="flex flex-row gap-2 items-center">
                  {getIcon("save")} {t("Save")}
                </div>
              </StyledButton>
            </div>
          </div>
          <div className="flex flex-row gap-2">
            <div className="h-[70vh] w-[50vw] flex items-center justify-center">

              <Stage
                scaleX={scale}
                scaleY={scale}
                x={position.x}
                y={position.y}
                draggable={scale != 1}
                width={scale > 1 ? window.innerWidth * 0.5 : frameWidth}
                height={frameHeight}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
                onClick={handleMouseDown}
                onTap={handleMouseDown}

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
                      <Label x={room.points[0]} y={room.points[1]} onDblClick={() => handleRoomDoubleClick(room)} onDblTap={() => handleRoomDoubleClick(room)}>
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
        </div>

        <div className="col-span-1 flex flex-col gap-5 mr-5  overflow-auto">
          {(true || (addingRoom && currentRoomName)) &&

            <div className="p-4 my-2 bg-zinc-100 rounded-lg shadow-md w-full">
              <div className="flex flex-row items-center gap-2 mb-2">
                {getIcon("info")}
                <h3 className="text-lg font-semibold">{t("How to Use")}</h3>
              </div>
              <div>
                {addingRoom ?
                  <>
                    {t("add_room_description")}
                  </>
                  :
                  <>
                    <strong>{t("Double Press")}</strong> {t("double_press_room_description")}
                  </>

                }
              </div>

            </div>

          }
        </div>
      </div>

      {
        isInitialConfiguration &&
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
      }
    </div >

  </>
  );
};

export default RoomConfiguration;
