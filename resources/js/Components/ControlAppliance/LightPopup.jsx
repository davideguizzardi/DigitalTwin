import { useState, useEffect } from "react";
import { Button} from "flowbite-react";
import Slider from '@mui/material/Slider';
import { SliderPicker } from "react-color";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { apiFetch, getIcon } from "../Commons/Constants";

import { backend,callService } from "../Commons/Constants";


export function LightPopup({ selectedEntity,user,setErrorFun,refreshDevice}) {
    const [entityId, setEntityId] = useState(null)
    const [lightOn, setLightOn] = useState(false)
    const [brightness, setBrightness] = useState(0)
    const [red, setRed] = useState(255)
    const [green, setGreen] = useState(193)
    const [blue, setBlue] = useState(7)
    const [temperature, setTemperature] = useState(3500)

    const [brightnessSupported, setBrightnessSupported] = useState(false)
    const [colorSupported, setColorSupported] = useState(false)
    const [temperatureSupported, setTemperatureSupported] = useState(false)

    const [brightnessTab, setBrightnessTab] = useState(true)
    const [colorTab, setColorTab] = useState(false)
    const [temperatureTab, setTemperatureTab] = useState(false)


    const innerCallService = async (service, data) => {
        const response=await callService(entityId,service,data,user)
        if (response) {
            const updated_entity = response[0];
            setEntityValues(updated_entity)
            refreshDevice()
        }
        else {
            setErrorFun()
        }
    }

    function setEntityValues(entity_in){
        if (entity_in && entity_in.attributes ) {
            setEntityId(entity_in.entity_id)
            setLightOn(entity_in.state == "on")
            setBrightnessSupported("brightness" in entity_in.attributes)
            if (entity_in.attributes.brightness)
                setBrightness(Math.round(entity_in.attributes.brightness / 255 * 100))
            setColorSupported("rgb_color" in entity_in.attributes)
            if (entity_in.attributes.rgb_color) {
                setRed(entity_in.attributes.rgb_color[0])
                setGreen(entity_in.attributes.rgb_color[1])
                setBlue(entity_in.attributes.rgb_color[2])
            }
            setTemperatureSupported("color_temp_kelvin" in entity_in.attributes)
            if (entity_in.attributes.color_temp_kelvin) {
                setTemperature(entity_in.attributes.color_temp_kelvin)
            }
        }
    }

    const initializeEntity = async () =>{
        const response = await apiFetch(`/entity/${selectedEntity}`)
        if (response) {
            setEntityValues(response)
        }
        else {
            alert("Error")
        }       
    }

    function resetPopup() {
        setBrightness(0)
        setRed(255)
        setGreen(193)
        setBlue(7)
        closeFun()
    }

    function tabClicked(tab) {
        switch (tab) {
            case "brightness":
                setBrightnessTab(true);
                setColorTab(false);
                setTemperatureTab(false);
                break;
            case "color":
                setBrightnessTab(false);
                setColorTab(true);
                setTemperatureTab(false);
                break;
            case "temperature":
                setBrightnessTab(false);
                setColorTab(false);
                setTemperatureTab(true);
                break;
        }
    }


    const handleBrightnessChange = (event, newValue) => {
        setBrightness(newValue)
    };

    const handleTemperatureChange = (event, newValue) => {
        setTemperature(newValue)
    };

    const handleChangeComplete = (color, event) => {
        setRed(color.rgb.r)
        setGreen(color.rgb.g)
        setBlue(color.rgb.b)
    };

    useEffect(() => {
        if(selectedEntity!="")
            initializeEntity(selectedEntity)
    }, [selectedEntity, open])

    return (
                <div className="flex flex-col w-full px-5">
                    <div className="p-1">
                        <div className="flex flex-col justify-center items-center">
                            <div className="flex flex-row bg-white shadow-md items-center justify-start rounded-full border">

                                <div className="flex gap-1 dark:bg-neutral-700 rounded p-1">
                                    <StyledButton variant="secondary" className="rounded-full bg-inherit shadow-none text-black dark:text-white
                                        ring-0 focus:ring-0 dark:bg-neutral-700"
                                        onClick={() => innerCallService("toggle", {})}>
                                        {getIcon(lightOn?"power_off":"power_on","size-8")}
                                    </StyledButton>
                                    {lightOn &&
                                        <div className="flex gap-1">
                                            {brightnessSupported &&
                                                <Button
                                                    className={`rounded-full ring-0 focus:ring-0 text-black 
                                                        ${brightnessTab ? "" : "dark:text-white"}`}
                                                    style={{ background: brightnessTab ? "rgb(" + red + "," + green + "," + blue + ")" : "inherit" }}
                                                    onClick={() => tabClicked("brightness")}>
                                                    {getIcon("brightness","size-8")}
                                                </Button>
                                            }
                                            {colorSupported &&
                                                <Button
                                                    className={`rounded-full text-black ring-0 focus:ring-0 
                                                        ${colorTab ? "" : "dark:text-white"}`}
                                                    style={{ background: colorTab ? "rgb(" + red + "," + green + "," + blue + ")" : "inherit" }}
                                                    onClick={() => tabClicked("color")}>
                                                    {getIcon("color","size-8")}
                                                </Button>}
                                            {temperatureSupported &&
                                                <Button
                                                    className={`rounded-full bg-inherit text-black ring-0 focus:ring-0 
                                                        ${temperatureTab ? "" : "dark:text-white"}`}
                                                    style={{ background: temperatureTab ? "rgb(" + red + "," + green + "," + blue + ")" : "inherit" }}
                                                    onClick={() => tabClicked("temperature")}>
                                                    <p className="flex items-center size-8 align-middle text-4xl">K</p>
                                                </Button>
                                            }
                                        </div>

                                    }{
                                        lightOn=="unavailable" &&
                                        <h1>Device is unavailable</h1>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    {brightnessTab && lightOn && brightnessSupported &&
                        <div className="flex flex-row mt-10 items-center">
                            <Slider
                                value={brightness}
                                min={0}
                                max={100}
                                sx={{
                                    color: "rgb(" + red + "," + green + "," + blue + ")",
                                    height: 40,
                                    '& .MuiSlider-rail': {
                                        boxShadow: 10
                                    },
                                    '& .MuiSlider-thumb': {
                                        height: 40,
                                        borderRadius: 0.3
                                    }
                                }
                                }
                                onChangeCommitted={() => innerCallService("turn_on", { "brightness_pct": brightness })}
                                onChange={handleBrightnessChange}
                                valueLabelDisplay="auto"
                            />

                            <div>
                                <span className="text-2xl ml-3 dark:text-white">{brightness}%</span>
                            </div>
                        </div>
                    }
                    {colorTab && lightOn && colorSupported &&
                        <div className="mt-10">
                            <SliderPicker
                                onChangeComplete={() => innerCallService("turn_on", { "rgb_color": [red, green, blue] })}
                                onChange={handleChangeComplete}
                                color={"rgb(" + red + "," + green + "," + blue + ")"}
                            />
                        </div>
                    }
                    {temperatureTab && lightOn && temperatureSupported &&
                        <div className="flex flex-row mt-10 items-center">
                            <Slider
                                value={temperature}
                                min={2000}
                                max={6500}
                                track={false}
                                sx={{
                                    '& .MuiSlider-rail': {
                                        backgroundImage: "linear-gradient(to right, #FF8A12,#FFF9FD)",
                                        opacity: 2,
                                        boxShadow: 10
                                    },
                                    '& .MuiSlider-thumb': {
                                        color: "white",
                                        height: 40,
                                        borderRadius: 0.3
                                    },
                                    height: 40,
                                }
                                }
                                onChangeCommitted={() => innerCallService("turn_on", { "kelvin": temperature })}
                                onChange={handleTemperatureChange}
                                valueLabelDisplay="auto"
                            />
                            <div>
                                <span className="text-2xl ml-3 dark:text-white">{temperature}K</span>
                            </div>
                        </div>
                    }
                </div>
    )
}