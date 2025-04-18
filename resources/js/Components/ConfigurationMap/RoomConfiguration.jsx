import React, { useState, useEffect, useContext } from "react";
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

// Utility
const isPointInPolygon = (point, polygon) => {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    const intersect = ((yi > point.y) !== (yj > point.y)) &&
      (point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
};

const token = Cookies.get("auth-token");

const RoomConfiguration = ({ backSection, endSection, isInitialConfiguration = true }) => {
  const [maps, setMaps] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentFloor = maps[currentIndex]?.floor;
  const [image] = useImage(`${domain}/${maps[currentIndex]?.url}`);
  const [frameWidth, setFrameWidth] = useState(0);
  const [frameHeight, setFrameHeight] = useState(0);

  const [rooms, setRooms] = useState([]);
  const [currentRoom, setCurrentRoom] = useState([]);
  const [isRoomClosed, setIsRoomClosed] = useState(false);
  const [currentRoomName, setCurrentRoomName] = useState(null);
  const [addingRoom, setAddingRoom] = useState(false);
  const { t } = useLaravelReactI18n();


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

  const getRoomOfDevice = (dev) => {
    const room = getRoomOfPoint(getFrameX(dev.map_data.x), getFrameY(dev.map_data.y), dev.map_data.floor);
    return room ? room.name : "";
  };

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
      const response = await fetch(`${backend}/room`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (response.ok) {
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
      const newPoint = e.target.getStage().getPointerPosition();
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
  };

  const getRoomOfPoint = (x, y, floor = currentFloor) => {
    const clickedPoint = { x, y };
    const floorRooms = rooms.filter(room => room.floor === floor);
    for (let i = 0; i < floorRooms.length; i++) {
      const room = floorRooms[i];
      const polygon = [];
      for (let j = 0; j < room.points.length; j += 2) {
        polygon.push({ x: room.points[j], y: room.points[j + 1] });
      }
      if (isPointInPolygon(clickedPoint, polygon)) {
        return { id: i, name: room.name };
      }
    }
    return null;
  };

  const handleStageClick = (e) => {
    const pos = e.target.getStage().getPointerPosition();
    const clickedRoom = getRoomOfPoint(pos.x, pos.y);
    if (clickedRoom) {
      alert(`You clicked on room: ${clickedRoom.name}`);
    } else {
      console.log("No room clicked.");
    }
  };

  const getFrameX = x => (x * frameWidth) / 100;
  const getFrameY = y => (y * frameHeight) / 100;

  return (
    <div className="relative flex flex-col gap-5 w-full">
      <div className="grid grid-cols-5 md:h-[67vh] 2xl:h-[70vh]">
        <div className="col-span-3 relative flex flex-row items-center justify-center ">
          <div className="">

            <Stage
              width={frameWidth}
              height={frameHeight}
              onMouseDown={handleMouseDown}
              onClick={handleStageClick}
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
