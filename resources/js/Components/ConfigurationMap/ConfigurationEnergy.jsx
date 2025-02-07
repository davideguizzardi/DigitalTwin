import { useEffect } from "react";
import { useState } from "react";
import { backend } from "../Commons/Constants";
import { FaPencil } from "react-icons/fa6"
import { ThemeButton } from "../Commons/ThemeButton";
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { StyledButton } from "../Commons/StyledBasedComponents";
import { getIcon } from "../Commons/Constants";
import { TextInput, Label, Button } from "flowbite-react";

export default function ConfigurationEnergy({ endSection, backSection, isInitialConfiguration = true }) {
    const templateSWH1 = Array.from(Array(7).keys()).map(() => Array(24).fill(0))
    const templateSWH2 = Array.from(Array(7).keys()).map(() => Array(24).fill(1))
    const templateSWH3 = Array.from(Array(7).keys()).map(() => Array(24).fill(2))
    for (let i = 0; i < 6; i++) {
        for (let j = 0; j < 24; j++) {
            if (j > 6 && j < 22) {
                templateSWH2[i][j] = 0
                if (i < 5 && j > 7 && j < 19) {
                    templateSWH3[i][j] = 0
                } else {
                    templateSWH3[i][j] = 1
                }
            }
        }
    }
    const { t } = useLaravelReactI18n()

    const [timeSlots, setTimeSlots] = useState(0)
    const [powerCapacity, setPowerCapacity] = useState(3.5)
    const [powerPrice, setPowerPrice] = useState([])
    const [currentSlot, setCurrentSlot] = useState(-1)
    const [selecting, setSelecting] = useState(false)
    const [slotWeekHour, setSlotWeekHour] = useState([...templateSWH1])


    const backgroundColors = [
        " bg-red-400 ",
        " bg-amber-400 ",
        " bg-emerald-400 "
    ]

    const borderColors = [
        " border-red-400 ",
        " border-amber-400 ",
        " border-emerald-400 "
    ]

    const updateTimeSlots = (value) => {
        const len = powerPrice.length
        if (value < len) {
            setPowerPrice([...powerPrice.slice(0, value)])
        } else if (value > timeSlots) {
            const updateState = [...powerPrice, ...Array(value - len).fill(0.001)]
            setPowerPrice([...updateState])
        }
        setTimeSlots(value)
        setCurrentSlot(-1)
        if (value == 1) setSlotWeekHour([...templateSWH1])
        else if (value == 2) setSlotWeekHour([...templateSWH2])
        else if (value == 3) setSlotWeekHour([...templateSWH3])
    }

    const setInputValue = (e, index) => {
        const tempPower = [...powerPrice.map((el, i) => {
            if (index == i)
                return e.target.value
            else
                return el
        })]
        setPowerPrice(tempPower)
    }

    const setDay = (index) => {
        if (currentSlot >= 0) {
            const tempSlotWeekHour = slotWeekHour.map((day, i) => {
                if (index == i) {
                    return Array(24).fill(currentSlot)
                } else {
                    return day
                }
            })
            setSlotWeekHour([...tempSlotWeekHour])
        }
    }

    const setHour = (index) => {
        if (currentSlot >= 0) {
            const tempSlotWeekHour = slotWeekHour.map((day, i) => {
                return day.map((slot, j) => {
                    return index == j ? currentSlot : slot
                })
            })
            setSlotWeekHour([...tempSlotWeekHour])
        }
    }

    const insertSlotHour = (i, j) => {
        if (currentSlot >= 0) {
            let tempSlotWeekHour = [...slotWeekHour]
            tempSlotWeekHour[i][j] = currentSlot
            setSlotWeekHour([...tempSlotWeekHour])
        }
    }

    const startSelecting = (e, i, j) => {
        e.preventDefault()
        setSelecting(true)
        console.log("start selecting")
        if (currentSlot >= 0) {
            insertSlotHour(i, j)
        }
    }

    const moveSelecting = (e, i, j) => {
        e.preventDefault()
        if (currentSlot >= 0 && selecting) {
            console.log("Move selecting")
            insertSlotHour(i, j)
        }
    }

    let table = (
        <div
            className="grid grid-cols-8 gap-0 h-full justify-center"
            onMouseLeave={() => setSelecting(false)}
        >
            <h1 className="dark:bg-neutral-700 dark:text-white text-center capitalize" style={{ cursor: "default" }}>{t("hour")}</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white  text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(0) }}
            >{t("Monday")}</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(1) }}
            >{t("Tuesday")}</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(2) }}
            >{t("Wednesday")}</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(3) }}
            >{t("Thursday")}</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(4) }}
            >{t("Friday")}</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(5) }}
            >{t("Saturday")}</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(6) }}
            >{t("Sunday")}</h1>
            {
                Array.from(Array(24).keys()).map((element, j) => {
                    return (
                        <>
                            <div className="py-0 dark:bg-neutral-700 dark:text-white text-center justify-center text-sm 2xl:text-lg" style={{ cursor: "pointer" }}
                                onClick={() => { setHour(j) }} >
                                {j + ":00-" + (j + 1) + ":00"}
                            </div>
                            {
                                Array.from(Array(7).keys()).map((el, i) => {
                                    const swh = slotWeekHour[i][j]
                                    const colorCell = swh >= 0 ? backgroundColors[3 - timeSlots + swh] : ""
                                    return (
                                        <div className={"border w-full dark:border-neutral-700" + colorCell} key={"cell_" + i + "_" + j}
                                            style={{ cursor: selecting ? "grabbing" : "pointer" }}
                                            onClick={() => { insertSlotHour(i, j) }}
                                            onTouchStart={() => { console.log("startTouch") }}
                                            onTouchMove={() => { console.log("touchMove") }}
                                            onTouchEnd={() => { console.log("touchEnd") }}
                                            onPointerDown={(e) => startSelecting(e, i, j)}
                                            onPointerOver={(e) => moveSelecting(e, i, j)}
                                            onPointerUp={(e) => {
                                                e.preventDefault()
                                                setSelecting(false)
                                            }}
                                        >
                                        </div>
                                    )
                                })
                            }
                        </>
                    )
                })
            }
        </div>
    )
    const saveConfiguration = async () => {
        console.log(timeSlots)
        console.log(powerPrice)
        let dataConf = [
            {
                key: "energy_slots_number",
                value: timeSlots.toString(),
                unit: ""
            },
            {
                key: "power_threshold",
                value: powerCapacity.toString(),
                unit: "kW"
            }
        ]
        powerPrice.forEach((el, i) => {
            const index = i
            if (i < timeSlots) {
                dataConf = [...dataConf, {
                    key: "cost_slot_" + index,
                    value: el.toString(),
                    unit: "€/kWh"
                }]
            }
        })
        fetch(backend + "/configuration/", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: dataConf })
        })
        if (timeSlots < 3) {
            const response = await fetch(backend + "/configuration/cost_slot_3", {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' }
            })
            const result = await response.json()
            console.log(result)
            if (timeSlots < 2) {
                console.log(timeSlots)
                const response = await fetch(backend + "/configuration/cost_slot_2", {
                    method: "DELETE",
                    headers: { "Content-Type": 'application/json' }
                })
                const result2 = await response.json()
                console.log(result2)
            }
        }
        const dataCalendar = JSON.stringify({ data: slotWeekHour.map((day) => day.map((hour) => hour)) })
        //before to save delete old calendar
        const deleteCalendar = await fetch(backend + "/calendar", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })
        if (deleteCalendar.ok) {
            const responseCalendar = await fetch(backend + "/calendar", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: dataCalendar
            })
            const result = await responseCalendar.json()
            console.log(result)
        }
        endSection()
    }

    useEffect(() => {
        const getConfiguration = async () => {
            const response = await fetch(backend + "/configuration/")
            const result = await response.json()
            let updatePrice = []
            result.forEach((conf) => {
                if (conf.key == "energy_slots_number") {
                    setTimeSlots(conf.value)
                    console.log(conf.value)
                }
                else if (conf.key == "cost_slot_0")
                    updatePrice[0] = conf.value
                else if (conf.key == "cost_slot_1" && conf.value > 0)
                    updatePrice[1] = conf.value
                else if (conf.key == "cost_slot_2" && conf.value > 0)
                    updatePrice[2] = conf.value
                else if (conf.key == "power_threshold")
                    setPowerCapacity(conf.value)

            })
            setPowerPrice([...updatePrice])
        }
        const getCalendar = async () => {
            const response = await fetch(backend + "/calendar")
            const result = await response.json()
            if (result.data.length > 0) {
                setSlotWeekHour([...result.data])
            }

        }
        getCalendar()
        getConfiguration()
    }, [])


    return (
        <div className="size-full flex flex-col gap-2 min-w-fit 2xl:p-2 px-2">
            <div className="size-full flex gap-3">
                <div className="flex flex-col p-1 h-full w-1/2 ">
                    <div className="flex py-3 items-center gap-6" onClick={() => setCurrentSlot(-1)}>
                        <Label htmlFor="maximum_capacity" className=" dark:text-white text-lg">{t("Maximum capacity")}</Label>
                        <div className="flex flex-row gap-2 items-center">
                            <TextInput id="maximum_capacity" className=" dark:text-white dark:bg-neutral-700" type="number"
                                value={powerCapacity} min="0" max="100000" step="100" onChange={e => setPowerCapacity(e.target.value)} required />
                            <p className="text-xl dark:text-white">W</p>
                        </div>
                    </div>
                    <div className="flex py-3 items-center gap-6" onClick={() => setCurrentSlot(-1)}>
                        <Label htmlFor="slots_number" className="text-lg dark:text-white">{t("Number of slot")}</Label>
                        <TextInput id="slots_number" className=" dark:text-white dark:bg-neutral-700" type="number"
                            value={timeSlots > 0 ? timeSlots : ''}
                            min="1" max="3" onChange={e => updateTimeSlots(e.target.value)} required />
                    </div>
                    <div className="flex flex-col gap-2">
                        {timeSlots > 0 &&
                            powerPrice.filter((e, i) => { return i < timeSlots }).map((element, index) => {
                                return (
                                    <div
                                        key={index}
                                        className={`flex flex-row w-fit py-3 px-2 gap-2 -mx-1 rounded-lg transition-transform duration-200 ${currentSlot == index && `translate-x-3 border-[2px] ${borderColors[3 - timeSlots + index]}`}`}
                                    >
                                        <div className="flex flex-row gap-6 items-center">
                                            <Label className="text-xl dark:text-white">
                                                {t("Slot")} {index + 1}
                                            </Label>
                                            <div className="flex flex-row gap-2 items-center">
                                                <TextInput className=" dark:text-white dark:bg-neutral-700" type="number" value={element} min="0.001" max="15" step="0.001"
                                                    onChange={(e) => setInputValue(e, index)}
                                                />
                                                <p className="text-xl dark:text-white">€/kWh</p>
                                            </div>
                                            <div
                                                onClick={() => setCurrentSlot(index)}
                                                className={`flex items-center rounded-lg p-2 hover:cursor-pointer ${backgroundColors[3 - timeSlots + index]}`}
                                            >
                                                <p className="text-lg px-2 dark:text-white">
                                                    {t("Insert in calendar")}
                                                </p>
                                                <FaPencil size={20} />
                                            </div>

                                        </div>
                                    </div>)
                            })
                        }
                    </div>
                    <div className="size-full" onClick={() => setCurrentSlot(-1)}>
                        {currentSlot !== -1 &&
                            <div className="p-4 mt-10 mr-5 bg-zinc-100 rounded-lg shadow-md">
                                <div className="flex flex-row items-center gap-2 mb-2">
                                {getIcon("info")}
                                <h3 className="text-lg font-semibold">{t("How to Use")}</h3>
                                </div>
                                <ul className="list-disc pl-5 text-sm space-y-1">
                                    <li><strong>{t("Press")}</strong> {t("single_press_description")}</li>
                                    <li><strong>{t("Drag")}</strong> {t("drag_description")}</li>
                                    <li><strong>{t("Press")}</strong> {t("day_press_description")}</li>
                                    <li><strong>{t("Press")}</strong> {t("hour_press_description")}</li>
                                </ul>
                            </div>

                        }
                    </div>
                </div>
                <div className="flex flex-col h-full min-w-fit w-1/2">
                    {timeSlots > 0 ?
                        table
                        :
                        <div className="flex size-full justify-center items-center dark:text-white text-2xl">
                            {t("Before to start insert")}
                            <br />
                            {t("Number of slot")}
                        </div>
                    }
                </div>
            </div>
            {
                isInitialConfiguration ?
                    <div className="grid grid-cols-2" onClick={() => setCurrentSlot(-1)}>
                        <div className="flex justify-start">
                            <StyledButton onClick={() => { backSection() }}>
                                {getIcon("arrow_left")}{t("Back")}
                            </StyledButton>
                        </div>

                        <div className="flex justify-end">

                            <StyledButton onClick={() => { saveConfiguration() }}>
                                {t("Next")}{getIcon("arrow_right")}
                            </StyledButton>

                        </div>
                    </div>
                    :
                    <div className="flex w-full h-min py-3 items-end justify-center">
                        <ThemeButton onClick={() => { saveConfiguration() }}>{t("Save")}</ThemeButton>
                    </div>
            }
        </div >
    )
}