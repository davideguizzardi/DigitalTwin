import { useEffect, useState } from "react"
import ListButtons from "../Commons/ListButtons"
import { Button } from "flowbite-react"
import { FaCalendarPlus } from "react-icons/fa6";
import { IconContext } from "react-icons";
import { ThemeButton } from "../Commons/ThemeButton";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { getIcon } from "../Commons/Constants";
import WhiteCard from "../Commons/WhiteCard";
import { backend } from "../Commons/Constants";
import { useLaravelReactI18n } from "laravel-react-i18n";

export default function ConfigurationEnergyPlan({backSection, endSection }) {
    const [powerCapacity, setPowerCapacity] = useState(1)
    const [powerPrice, setPowerPrice] = useState([parseFloat(0).toFixed(4)])
    const [timeSlots, setTimeSlots] = useState(1)
    const [slotWeekHour, setSlotWeekHour] = useState(Array.from(Array(7).keys()).map(() => Array(24).fill(0)))
    const [currentSlot, setCurrentSlot] = useState(-1)
    const [selecting, setSelecting] = useState(false)
    const { t } = useLaravelReactI18n();

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
                                    const colorCell = swh >= 0 ? colors[swh] : ""
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
        //before save delete old calendar
        fetch(backend + "/calendar", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" }
        })

        const responseCalendar = await fetch(backend + "/calendar", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: dataCalendar
        })
        const result = await responseCalendar.json()
        console.log(result)
        endSection()
    }

    useEffect(() => {
        const getConfiguration = async () => {
            const response = await fetch(backend + "/configuration/")
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
        <div className="size-full gap-2 flex-col flex min-w-fit px-2">
            <div className="flex size-full min-w-fit">
                <div className="flex flex-col p-1 w-1/2">
                    <div className="flex flex-col size-full justify-start gap-3 2xl:gap-10 2xl:pt-10 ">
                        <div className="flex py-1 items-center">
                            <p className="text-xl px-1 dark:text-white">Maximum capacity</p>
                            <input className="px-1 dark:text-white dark:bg-neutral-700" style={{ width: "64px" }} type="number" value={powerCapacity} min="0" max="100000" step="100" onChange={e => setPowerCapacity(e.target.value)} />
                            <p className="text-xl px-1 dark:text-white">W</p>
                        </div>
                        <div className="flex py-1 items-center">
                            <p className="text-xl px-2 dark:text-white">Number of slots</p>
                            <ListButtons dataButtons={dataBtn}
                                index={timeSlots - 1} vertical={false} />
                        </div>
                        <div className="flex h-full flex-col 2xl:gap-10">
                            {
                                powerPrice.map((element, index) => {
                                    return (
                                        <div className="flex py-3 items-center gap-2" key={index}>
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
                                            {currentSlot == index &&
                                                <p className={"text-lg rounded shadow text-center ml-2 px-2" + colors[currentSlot]}>Insert slot {currentSlot + 1} in calendar</p>
                                            }
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                </div>
                <div className="flex flex-col min-w-fit w-1/2">
                    {table}
                </div>
            </div>
            <div className="grid grid-cols-2">
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
        </div>
    )
}