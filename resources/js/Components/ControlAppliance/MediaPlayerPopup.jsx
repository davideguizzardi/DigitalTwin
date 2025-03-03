import { useState, useEffect } from "react";
import { Slider } from "@mui/material";
import { backend, getIcon } from "../Commons/Constants";
import {
    PowerIcon,
    BackwardIcon,
    ForwardIcon,
    PauseCircleIcon,
    SpeakerWaveIcon,
    SpeakerXMarkIcon,
    PlayCircleIcon,
} from "@heroicons/react/24/outline";
import { StyledButton } from "../Commons/StyledBasedComponents";

export function MediaPlayerControl({ selectedEntity, user, setErrorFun }) {
    const [volume, setVolume] = useState(0);
    const [entity, setEntity] = useState(null);
    const [services, setServices] = useState([]);

    useEffect(() => {
        if (selectedEntity) {
            initializeEntity();
        }
    }, [selectedEntity]);

    const callService = async (service, data = {}) => {
        const response = await fetch(`${backend}/service`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ entity_id: selectedEntity, service, data, user }),
        });

        if (response.ok) {
            const updatedEntity = await response.json();
            setEntityValues(updatedEntity[0]);
        } else {
            setErrorFun();
        }
    };

    const initializeEntity = async () => {
        const response = await fetch(`${backend}/entity/${selectedEntity}`);
        if (response.ok) {
            const entityData = await response.json();
            setEntityValues(entityData);
        } else {
            alert("Error fetching entity");
        }
    };

    const setEntityValues = (entityData) => {
        setVolume(Math.round(entityData.attributes.volume_level * 100));
        if (entityData) {
            setEntity(entityData);
            if (entityData.services) {
                setServices(entityData.services);
            }
        }
    };

    const isActive=(entity)=>{
        return entity?.state === "on" || entity?.state === "playing" || entity?.state === "paused"
    }


    return (
        entity && (
            <div className="px-4 flex flex-col items-center">
                {isActive(entity) && (
                    <p className="font-normal">{`${entity.attributes.media_title ||entity.attributes.source|| ""} ${entity.attributes.media_artist || ""}`}</p>
                )}

                <div className="flex flex-row gap-5 items-center">
                    {isActive(entity) && (
                        <>
                            <div className="flex flex-row gap-0 items-center">
                                {"media_previous_track" in services && (
                                    <div onClick={() => callService("media_previous_track")}>
                                        {getIcon("backward", "size-9 cursor-pointer")}
                                    </div>
                                )}
                                {entity.state === "playing" ? (
                                    <div onClick={() => callService("media_pause")}>
                                        {getIcon("pause", "size-12 cursor-pointer")}
                                    </div>
                                ) : (
                                    <div onClick={() => callService("media_play")}>
                                        {getIcon("play_media", "size-12 cursor-pointer")}
                                    </div>
                                )}
                                {"media_next_track" in services && (
                                    <div onClick={() => callService("media_next_track")}>
                                        {getIcon("forward", "size-9 cursor-pointer")}
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-row gap-2 items-center justify-center">
                                <div onClick={() => callService("volume_set", { volume_level: 0 })}>
                                    {getIcon("volume_min", "size-9 cursor-pointer")}
                                </div>

                                <div className="mt-1">
                                    <Slider
                                        value={volume}
                                        min={1}
                                        max={100}
                                        onChange={(e, newValue) => setVolume(newValue)}
                                        onChangeCommitted={() => callService("volume_set", { volume_level: volume / 100 })}
                                        valueLabelDisplay="auto"
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
                                </div>
                                <div onClick={() => callService("volume_set", { volume_level: 1 })}>
                                    {getIcon("volume_max", "size-9 cursor-pointer")}
                                </div>
                            </div>
                            {"turn_off" in services && (
                                <StyledButton className="rounded-full dark:text-black" onClick={() => callService("turn_off")}>
                                    {getIcon("power_off", "size-10 cursor-pointer")}
                                </StyledButton>
                            )}
                        </>
                    )}

                    {"turn_on" in services && !(entity?.state === "on" || entity?.state === "playing") && (
                        <StyledButton className="ml-11 bg-lime-400 rounded-full dark:text-black" onClick={() => callService("turn_on")}>
                            {getIcon("power_on", "size-10 cursor-pointer")}
                        </StyledButton>
                    )}
                </div>
            </div>
        )
    );
}