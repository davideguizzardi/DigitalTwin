import { useState, useEffect } from "react";
import { Modal, Button } from "flowbite-react";
import Slider from '@mui/material/Slider';
import { PowerIcon, BackwardIcon, ForwardIcon, PauseCircleIcon, SpeakerWaveIcon, SpeakerXMarkIcon, PlayCircleIcon } from "@heroicons/react/24/outline";


export function MediaPlayerPopup({ selectedEntity, open, closeFun }) {
    const [volume, setVolume] = useState(0)
    const [friendlyName, setFriendlyName] = useState("")
    const [entity, setEntity] = useState(null)
    const [services, setServices] = useState([])
    const handleVolumeChange = (event, newValue) => {
        setVolume(newValue)
    };

    const callService = async (service, data) => {
        let body = {}
        body["entity_id"] = selectedEntity
        body["service"] = service
        body["user"] = "Davide" //todo: METTERE IL NOME GIUSTO
        body["data"] = data;
        /*
        const response = await fetch(`http://127.0.0.1:8000${"/service"}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(body)
        });
        if (response.ok) {
            const updated_entity = await response.json();
            setEntity(updated_entity[0])
        }
        else {
            alert("Error")
        }
        */
    }


    const initializeEntity = async () => {
        const response = await fetch(`http://127.0.0.1:8000${"/entity/" + selectedEntity}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
            body: null
        });
        if (response.ok) {
            const entity_in = await response.json();
            setEntityValues(entity_in)
        }
        else {
            alert("Error")
        }
    }

    function setEntityValues(entity) {
        setVolume(Math.round(entity.attributes.volume_level * 100))
        setEntity(entity)
        setFriendlyName(entity.friendly_name)
        setServices(entity.services)
    }

    useEffect(() => {
        if (selectedEntity != "")
            initializeEntity()
    }, [selectedEntity])

    function resetPopup() {

        closeFun()
    }
    return (
        <>
            {entity != null &&
                <Modal show={open} popup onClose={() => resetPopup()}>
                    <Modal.Header className="bg-gray-100 dark:bg-neutral-800 pl-3 font-['Inter']">
                        {friendlyName}
                    </Modal.Header>
                    <Modal.Body className="bg-gray-100 dark:bg-neutral-800 text-gray-800 dark:text-gray-300 font-[Inter]">

                        <div className="mt-2">
                            <div>
                                <p className="font-normal">{`${entity.attributes.media_title} - ${entity.attributes.media_artist}`}</p>
                            </div>
                            <div className="flex flex-row gap-4 items-center mt-2">
                                <div className="flex flex-row gap-0">
                                    {"media_previous_track" in services &&
                                        <BackwardIcon className="size-9" onClick={() => callService("media_previous_track", {})}
                                            style={{ cursor: "pointer" }} />
                                    }
                                    {entity.state == "playing" ?
                                        <PauseCircleIcon className="size-10 hover:cursor-pointer" onClick={() => callService("media_pause", {})}
                                            style={{ cursor: "pointer" }} />
                                        :
                                        <PlayCircleIcon className="size-10 hover:cursor-pointer" onClick={() => callService("media_pause", {})}
                                            style={{ cursor: "pointer" }} />
                                    }
                                    {"media_next_track" in services &&
                                        <ForwardIcon className="size-9" onClick={() => callService("media_next_track", {})}
                                            style={{ cursor: "pointer" }} />
                                    }
                                </div>
                                <div className="flex flex-row  gap-4 items-center justify-center gray">

                                    <SpeakerXMarkIcon className="size-9"
                                        onClick={()=>{callService("volume_set", {"volume_level": 1})}}
                                        style={{ cursor: "pointer" }} />
                                    <div className="mt-1">
                                        <Slider
                                            value={volume}
                                            min={1}
                                            max={100}
                                            onChange={handleVolumeChange}
                                            onChangeCommitted={() => callService("volume_set", { "volume_level": volume / 100 })}
                                            valueLabelDisplay="auto"
                                            sx={{
                                                color: "#a3e635",
                                                width: "270px",
                                                height: "6px",
                                                '& .MuiSlider-rail': {
                                                    color: "#1F2937",
                                                    opacity: "100"
                                                },
                                            }}
                                        />
                                    </div>
                                    <SpeakerWaveIcon className="size-9"
                                        onClick={()=>{callService("volume_set", {"volume_level": 100})}}
                                        style={{ cursor: "pointer" }} />
                                </div>
                                <div className="ml-11 bg-lime-400 rounded-[15px] dark:text-black">
                                    <PowerIcon className="size-10" onClick={() => callService("toggle", {})}
                                        style={{ cursor: "pointer" }} />
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>}
        </>)
}

