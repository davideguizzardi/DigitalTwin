import { useEffect, useState } from "react"
import ListButtons from "../Commons/ListButtons"
import { Button } from "flowbite-react"
import { FaCalendarPlus } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { ThemeButton } from "../Commons/ThemeButton";
import WhiteCard from "../Commons/WhiteCard";

export default function ConfigurationEnergyPlan({ endSection }) {
    const [powerCapacity, setPowerCapacity] = useState(1)
    const [powerPrice, setPowerPrice] = useState([parseFloat(0).toFixed(4)])
    const [timeSlots, setTimeSlots] = useState(1)
    const [slotWeekHour, setSlotWeekHour] = useState(Array.from(Array(7).keys()).map(() => Array(24).fill(0)))
    const [currentSlot, setCurrentSlot] = useState(-1)
    const [selecting, setSelecting] = useState(false)

    const colors = [
        " bg-emerald-400 ",
        " bg-amber-400 ",
        " bg-red-400 "
    ]
    const colorsRGB = [
        "#34d399",
        "#fbbf24",
        "#f87171"
    ]
    let dataBtn = []

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

    const insertSlotHour = (i,j) =>{
        let tempSlotWeekHour = [...slotWeekHour]
        tempSlotWeekHour[i][j] = currentSlot
        setSlotWeekHour([...tempSlotWeekHour])
    }

    const startSelecting = (e,i,j)=>{
        e.preventDefault()
        setSelecting(true)
        console.log("start selecting")
        if (currentSlot >= 0) {
            insertSlotHour(i,j)
        }
    }

    const moveSelecting = (e,i,j) =>{
        e.preventDefault()
        if (currentSlot >= 0 && selecting) {
            console.log("Move selecting")
            insertSlotHour(i,j)
        }
    }


    let table = (
        <div
            className="grid grid-cols-8 gap-0 h-full justify-center"
            onMouseLeave={() => setSelecting(false)}
        >
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "default" }}>Hour</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white  text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(0) }}
            >Monday</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(1) }}
            >Tuesday</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(2) }}
            >Wednesday</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(3) }}
            >Thursday</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(4) }}
            >Friday</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(5) }}
            >Saturday</h1>
            <h1 className="dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                onClick={() => { setDay(6) }}
            >Sunday</h1>
            {
                Array.from(Array(24).keys()).map((element, j) => {
                    return (
                        <>
                            <div className="py-0 dark:bg-neutral-700 dark:text-white text-center" style={{ cursor: "pointer" }}
                                onClick={() => { setHour(j) }} >
                                {j + ":00-" + (j + 1) + ":00"}
                            </div>
                            {
                                Array.from(Array(7).keys()).map((el, i) => {
                                    const swh = slotWeekHour[i][j]
                                    const colorCell = swh >= 0 ? colors[swh] : ""
                                    return (
                                        <div className={"border w-full dark:border-neutral-700" + colorCell} key={"cell_" + i + "_" + j}
                                            style={{ cursor: selecting ? "grabbing" : "pointer" }}
                                            onClick={()=>{insertSlotHour(i,j)}}
                                            onPointerDown={(e) => startSelecting(e,i,j)}
                                            onPointerOver={(e) => moveSelecting(e,i,j)}
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

    Array.from(Array(3).keys()).map((elem) => {
        dataBtn = [...dataBtn, {
            callback: () => {
                const numberSlot = elem + 1
                setTimeSlots(numberSlot)
                const diff = numberSlot - powerPrice.length
                if (diff < 0) {
                    setPowerPrice([...powerPrice.slice(0, numberSlot)])
                } else if (diff > 0) {
                    const updateState = [...powerPrice, ...Array(diff).fill(parseFloat(0).toFixed(4))]
                    setPowerPrice(updateState)
                }
                const tempSlotWeekHour = [...slotWeekHour].map((element) => {
                    return element.map((e) => e + 1 > numberSlot ? 0 : e)
                })
                setSlotWeekHour([...tempSlotWeekHour])
                setCurrentSlot(-1)
            },
            text: elem + 1,
            icon: (<></>)
        }]
    })

    const setInputValue = (e, index) => {
        const tempPower = [...powerPrice.map((el, i) => {
            if (index == i)
                return e.target.value
            else
                return el
        })]
        setPowerPrice(tempPower)
    }

    const saveConfiguration = async () => {
        let dataConf = [
            {
                key: "energy_slots_number",
                value: timeSlots.toString(),
                unit: ""
            },
            {
                key: "maximum_capacity",
                value: powerCapacity.toString(),
                unit: "kW"
            }
        ]
        powerPrice.forEach((el, i) => {
            const index = i + 1
            if (i < timeSlots) {
                dataConf = [...dataConf, {
                    key: "cost_slot_" + index,
                    value: el.toString(),
                    unit: "€/kWh"
                }]
            }
        })
        fetch("http://localhost:8000/configuration/", {
            method: "PUT",
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ data: dataConf })
        })
        if (timeSlots < 3) {
            const response = await fetch("http://localhost:8000/configuration/cost_slot_3", {
                method: "DELETE",
                headers: { 'Content-Type': 'application/json' }
            })
            const result = await response.json()
            console.log(result)
            if (timeSlots < 2) {
                console.log(timeSlots)
                const response = await fetch("http://localhost:8000/configuration/cost_slot_2", {
                    method: "DELETE",
                    headers: { "Content-Type": 'application/json' }
                })
                const result2 = await response.json()
                console.log(result2)
            }
        }
        const dataCalendar = JSON.stringify({ data: slotWeekHour.map((day) => day.map((hour) => hour)) })
        //before save delete old calendar
        fetch("http://localhost:8000/calendar", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })

        const responseCalendar = await fetch("http://localhost:8000/calendar", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: dataCalendar
        })
        const result = await responseCalendar.json()
        endSection()
    }

    useEffect(() => {
        const getConfiguration = async () => {
            const response = await fetch("http://localhost:8000/configuration/")
            const result = await response.json()
            let updatePrice = [0.0000]
            result.forEach((conf) => {
                if (conf.key == "energy_slots_number")
                    setTimeSlots(conf.value)
                else if (conf.key == "cost_slot_1")
                    updatePrice[0] = conf.value
                else if (conf.key == "cost_slot_2" && conf.value > 0)
                    updatePrice[1] = conf.value
                else if (conf.key == "cost_slot_3" && conf.value > 0)
                    updatePrice[2] = conf.value
                else if (conf.key == "maximum_capacity")
                    setPowerCapacity(conf.value)
            })
            setPowerPrice([...updatePrice])
        }
        const getCalendar = async () => {
            const response = await fetch("http://localhost:8000/calendar")
            const result = await response.json()
            setSlotWeekHour([...result.data])
        }
        getCalendar()
        getConfiguration()
    }, [])

    return (
        <div className="size-full flex-col min-w-fit p-2">
            <div className="flex size-full min-w-fit ">
                <div className="flex flex-col h-full min-w-fit w-1/2">
                    {table}
                </div>
                <div className="flex flex-col p-1 h-full w-1/2">
                    <div className="flex flex-col size-full justify-start gap-3 2xl:gap-10 2xl:pt-10 ">

                        <div className="flex py-1 items-center">
                            <p className="text-xl px-1 dark:text-white">Maximum capacity</p>
                            <input className="px-1 dark:text-white dark:bg-neutral-700" style={{ width: "64px" }} type="number" value={powerCapacity} min="0" max="15" step="0.5" onChange={e => setPowerCapacity(e.target.value)} />
                            <p className="text-xl px-1">kW</p>
                        </div>
                        <div className="flex py-1 items-center">
                            <p className="text-xl px-2 dark:text-white">Number of slots</p>
                            <ListButtons dataButtons={dataBtn}
                                index={timeSlots - 1} vertical={false} />
                        </div>
                        <div className="flex flex-col 2xl:gap-10">
                            {
                                powerPrice.map((element, index) => {
                                    return (
                                        <div className="flex py-3 items-center" key={index}>
                                            <p className="text-xl px-2 dark:text-white">Slot {index + 1}</p>
                                            <input className="px-1" style={{ width: "128px" }} type="number" value={element} min="0" max="15" step="0.0001"
                                                onChange={(e) => setInputValue(e, index)}
                                            />
                                            <p className="text-xl px-2 dark:text-white">€/kWh</p>
                                            <Button className="bg-gray-100 dark:bg-neutral-700 enabled:hover:bg-gray-100 dark:enabled:hover:bg-neutral-700 focus:ring-0"
                                                onClick={() => { setCurrentSlot(index); console.log(index) }}>
                                                <IconContext.Provider value={{ size: "24", color: colorsRGB[index] }}>
                                                    <FaCalendarPlus />
                                                </IconContext.Provider>
                                            </Button>
                                        </div>
                                    )
                                })
                            }
                        </div>
                        <div className={"flex w-full h-full pb-3 items-end 2xl:pb-16 px-1" + (currentSlot >= 0 ? " justify-center " : " justify-start ")}>
                            {
                                currentSlot >= 0 ?
                                    <p className={"text-lg rounded shadow text-center" + colors[currentSlot]}>Insert {currentSlot + 1} slot in calendar</p>
                                    :
                                    <p className="dark:text-white text-xl ">Specify the number of available slots. Then, drag and drop the slots into the weekly agenda,
                                        or simply click on the desired day or hour to assign them. Adjust and organize your schedule as needed.</p>
                            }
                        </div>
                        <div className="flex w-full h-min py-3 items-end justify-center">
                            <ThemeButton onClick={() => { saveConfiguration() }}>Save</ThemeButton>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}