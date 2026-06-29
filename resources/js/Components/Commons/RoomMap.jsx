import React, { useEffect, useRef, useState } from "react";
import { Stage, Layer, Line, Text, Label, Tag } from "react-konva";
import { apiFetch } from "./Constants";

export default function RoomMap({ image_url, floor, height_percent = 80 }) {
    const imageRef = useRef(null);
    const [rooms,setRooms]=useState([])
    const [innerRooms, setInnerRooms] = useState([]);
    const [stageSize, setStageSize] = useState({ width: 0, height: 0 });

    useEffect(() => {
        const fetchData = async () => {
            const data = await apiFetch(`/room/${floor}`);

            if (data && data.length > 0) {
                setRooms(data);
            }
        };

        fetchData();
    }, []);

    const updateStage = () => {
        const rect = imageRef.current?.getBoundingClientRect();
        if (!rect?.width || !rect?.height) return;

        const targetWidth = rect.width;
        const targetHeight = rect.height;

        setStageSize({ width: targetWidth, height: targetHeight });

        const data = rooms.map(room => {
            const rawPoints = JSON.parse(room.points); // flat array of percentages

            const pixelPoints = rawPoints.map((value, index) =>
                index % 2 === 0
                    ? (value / 100) * targetWidth // x
                    : (value / 100) * targetHeight // y
            );

            return {
                ...room,
                points: pixelPoints
            };
        });

        setInnerRooms(data);
    }

    useEffect(() => {
        updateStage();
        window.addEventListener("resize", updateStage);
        return () => window.removeEventListener("resize", updateStage);
    }, [rooms, image_url, height_percent]);

    return (
        <div className="relative flex items-center justify-center" style={{ minHeight: `${height_percent}vh` }}>
            <div className="relative inline-block max-w-full">
                <img
                    ref={imageRef}
                    src={image_url}
                    alt={`Floor ${floor}`}
                    className="block h-auto max-w-full object-contain"
                    style={{ maxHeight: `${height_percent}vh` }}
                    onLoad={updateStage}
                />
                {stageSize.width > 0 && stageSize.height > 0 && (
                    <Stage className="absolute inset-0" width={stageSize.width} height={stageSize.height}>
                        <Layer>
                            {innerRooms.map((room, idx) => (
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
                )}
            </div>
        </div>
    );
}
