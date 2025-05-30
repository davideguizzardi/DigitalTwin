import React, { useEffect, useState } from "react";
import { Stage, Layer, Line, Text, Image as KonvaImage, Label, Tag } from "react-konva";
import useImage from "use-image";
import { apiFetch } from "./Constants";
import { restrictToWindowEdges } from "@dnd-kit/modifiers";

export default function RoomMap({ image_url, floor, height_percent = 80 }) {
    const [image] = useImage(image_url);
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

    useEffect(() => {
        if (!image || !image.width || !image.height) return;
        
        const aspectRatio = image.width / image.height;
        let targetHeight = window.innerHeight * (height_percent/100);
        let targetWidth = targetHeight * aspectRatio;

        if(targetWidth>window.innerWidth*0.5){
            targetWidth=window.innerWidth*0.5
            targetHeight=targetWidth / aspectRatio
        }

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
    }, [rooms, image]);

    return (
        <div className="w-full relative flex items-center justify-center" style={{ height: `${height_percent}vh` }}>
            <Stage className="" width={stageSize.width} height={stageSize.height}>
                <Layer>
                    {image && (
                        <KonvaImage
                            image={image}
                            width={stageSize.width}
                            height={stageSize.height}
                        />
                    )}

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
        </div>
    );
}
