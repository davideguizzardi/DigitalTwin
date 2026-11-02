import { TimePicker } from "@mui/x-date-pickers";
import { useState, useEffect, useMemo } from "react"
import { getIcon } from "@/Components/Commons/Constants"
import { Modal, Spinner, TextInput, Tooltip } from "flowbite-react"
import {
    ResponsiveChartContainer,
    LinePlot,
    ChartsXAxis,
    ChartsYAxis,
    ChartsTooltip,
    ChartsAxisHighlight,
    useDrawingArea
} from '@mui/x-charts';
import dayjs from "dayjs";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";

import { Slider } from "@mui/material";

import { simulationService, virtualService, configurationService, calendarService } from "@/Api";
import { MdOutlineTimer } from "react-icons/md";
import ToastNotification from "@/Components/Commons/ToastNotification";

const COST_FACTOR = 0.4
const LOADING_TIME = 500


function computeCost(values, baseTime, priceCalendar) {
    if (!values || !baseTime || !priceCalendar || priceCalendar.length === 0) return 0;

    return values.reduce((cost, power, minuteOffset) => {
        const timestamp = baseTime.add(minuteOffset, "minute");

        const dayIndex = (timestamp.day() + 6) % 7;
        const minuteOfDay =
            timestamp.hour() * 60 +
            timestamp.minute();

        const price = priceCalendar[dayIndex]?.[minuteOfDay] ?? 0;

        return cost + (power / (60 * 1000)) * price;
    }, 0);
}


function OverlayMarkers({
    simulations,
    starting_time,
    xAxisData,
    paddedMaxY,
}) {
    const { left, top, width, height } = useDrawingArea();
    const [openIndex, setOpenIndex] = useState(null);

    if (!starting_time || !xAxisData.length) return null;

    const xScale = (index) =>
        left + (index / (xAxisData.length - 1)) * width;

    const yScale = (value) =>
        top + height - (value / paddedMaxY) * height;

    const grouped = Object.groupBy(
        simulations,
        ({ time }) => dayjs(time).startOf('minute').valueOf()
    );

    const sortedGroups = Object.entries(grouped)
        .sort(([a], [b]) => Number(b) - Number(a));

    return (
        <g>
            {sortedGroups.map(([timeKey, sims]) => {
                const index = dayjs(Number(timeKey)).diff(starting_time, 'minute');
                if (index < 0 || index >= xAxisData.length) return null;

                const x = xScale(index);
                const baseY = yScale(paddedMaxY);
                const isOpen = openIndex === x;

                return sims.map((sim, i) => {
                    const liftY = isOpen ? i * 32 : 0;

                    return (
                        <g
                            key={sim.id}
                            transform={`translate(${x}, ${baseY + liftY})`}
                            style={{ cursor: 'pointer' }}
                            onClick={() => setOpenIndex(isOpen ? null : x)}
                        >
                            <rect
                                x={-16}
                                y={-16}
                                width={isOpen ? 200 : 32}
                                height={32}
                                rx={16}
                                fill="white"
                                stroke="#A3E635"
                                strokeWidth={1.5}
                            />

                            <g transform="translate(-8, -8)">
                                {getIcon(sim.device_category)}
                            </g>

                            {isOpen && (
                                <text
                                    transform="translate(-8,-2)"
                                    x={20}
                                    y={6}
                                    fontSize={13}
                                    fill="black"
                                    textAnchor="start"
                                >
                                    {sim.device_name} · {sim.id}
                                </text>
                            )}
                        </g>
                    );
                });
            })}
        </g>
    );
}

function PowerGraph({
    data = [],
    starting_time = dayjs(),
    simulations = [],
    indexes_on_x = false,
    interactive = false,
    maxThreshold = 30000,
    className = "",
    t
}) {
    const [zoomLevel, setZoomLeveL] = useState(1)

    const sizingProps = zoomLevel == 1 ? {} : { width: 800 * zoomLevel };
    const isSinglePoint = data.length === 1;

    // Normalize data
    const normalizedData = isSinglePoint
        ? Array(60).fill(data[0])
        : data;

    // Convert starting_time (dayjs) to Date
    const start = starting_time?.toDate?.();

    // Time step
    const stepMs = isSinglePoint ? 1_000 : 60_000;

    // X axis values
    const xAxisData = normalizedData.map(
        (_, i) => new Date(start.getTime() + i * stepMs)
    );

    // Index-based axis
    const index_axis = {
        data: normalizedData.map((_, i) => i),
        tickInterval: 5,
        label: t("minute")
    };

    // Time-based axis
    const time_axis = {
        scaleType: 'time',
        data: xAxisData,
        valueFormatter: (d) =>
            d.toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
                ...(isSinglePoint && { second: '2-digit' }),
            }),
        tickInterval: isSinglePoint ? 10 : 5,
    };

    // Y axis
    const maxY = Math.max(...normalizedData);
    const paddedMaxY = maxY * 1.1;
    let starting_list = []

    if (simulations.length > 0) {
        simulations
            .map(sim => {
                const index = dayjs(sim.time)
                    .diff(starting_time, 'minute');

                starting_list.push({
                    x: indexes_on_x ? index : xAxisData[index],
                    y: maxY,
                    label: `${sim.device_name}-${sim.id}`
                });
            })
    }

    return (
        <div className={`size-full relative overflow-y-hidden  ${className}`}>

            <ResponsiveChartContainer
                {...(interactive && { margin: { bottom: 80 } })}
                {...sizingProps}


                xAxis={[indexes_on_x ? index_axis : time_axis]}
                yAxis={[
                    {
                        width: "auto",
                        min: 0,
                        max: paddedMaxY,
                        colorMap: {
                            type: 'piecewise',
                            thresholds: [maxThreshold],
                            colors: ['#a3e635', 'red'],
                        },
                    },
                ]}
                series={[
                    {
                        type: 'line',
                        data: normalizedData,
                        valueFormatter: (value) => `${value.toFixed(2)} W`,
                        showMark: false,
                    },

                ]}
            >
                <LinePlot />
                <ChartsXAxis />
                <ChartsYAxis />


                {interactive && (
                    <>
                        <ChartsTooltip trigger="axis" />
                        <ChartsAxisHighlight x="line" y="none" />
                    </>
                )}
                {simulations.length > 0 &&

                    <OverlayMarkers
                        simulations={simulations}
                        starting_time={starting_time}
                        xAxisData={xAxisData}
                        paddedMaxY={paddedMaxY}
                        indexes_on_x={indexes_on_x}
                    />
                }
            </ResponsiveChartContainer>
            {interactive &&
                <div className="flex gap-2 items-center  z-100 sticky bottom-1 left-0">

                    <StyledButton className="rounded-full" variant="secondary" onClick={() => setZoomLeveL(zoomLevel + 1)}>
                        {getIcon("zoomin", "size-7")}
                    </StyledButton>
                    <StyledButton className="rounded-full" variant="secondary" onClick={() => setZoomLeveL(Math.max(1, zoomLevel - 1))}>
                        {getIcon("zoomout", "size-7")}
                    </StyledButton>
                </div>
            }
        </div >
    );
}

function SimulationPickModal({ device_id, device_name, addSimulationFun, onCloseFun, overlappingsFun, t,priceCalendar }) {
    const [selectedCluster, setSelectedCluster] = useState(null)
    const [step, setStep] = useState(0)
    const [newDuration, setNewDuration] = useState(1)
    const [clusterTime, setClusterTime] = useState(dayjs())
    const [openModal, setOpenModal] = useState(false)
    const [deviceSimulation, setDeviceSimulation] = useState(null)


    const [loading, setLoading] = useState(false)

    function resetModal() {
        setOpenModal(false)
        setSelectedCluster(null)
        setStep(0)
        setDeviceSimulation(null)
    }

    async function setSelectedSimulation(cluster, device_name, device_id, device_category, time = dayjs()) {
        cluster["device_name"] = device_name
        cluster["device_id"] = device_id
        cluster["device_category"] = device_category
        cluster["time"] = time
        await setSelectedCluster(cluster)
    }

    function updateClusterTime(new_time) {
        setSelectedCluster(old => ({ ...old, time: new_time }))
    }


    useEffect(() => {
        const pullSimulation = async (device_id, device_name) => {
            const data = await simulationService.getByDevice(device_id)
            if (data) {
                data["device_name"] = device_name
                data["device_id"] = device_id

                setDeviceSimulation(data)
                setOpenModal(true)
            }
        }

        if (device_id && device_name) {
            pullSimulation(device_id, device_name)
        }
    }, [device_name])

    const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    async function resampleMedoidDuration(duration) {
        setNewDuration(duration)
        setLoading(true)
        await wait(LOADING_TIME);
        setLoading(false)
        const new_medoid = await simulationService.resampleDeviceMode(selectedCluster.device_id, selectedCluster.id, duration)
        if (new_medoid) {
            setSelectedCluster(old => ({ ...old, medoid: new_medoid }))
        }
    }

    function FrequencyLabel({ percent, t }) {
        if (percent == null) return null;

        let label = "";
        let className = "";

        if (percent >= 50) {
            label = t("Highly Frequently used");
            className = "bg-lime-200 ";
        } else if (percent < 50 && percent >= 30) {
            label = t("Frequently used");
            className = "bg-lime-200 ";
        } else if (percent > 5 && percent <= 15) {
            label = t("Rarely used");
            className = "bg-red-200 ";
        } else if (percent <= 5) {
            label = t("Highly rarely used");
            className = "bg-red-200";
        } else {
            return null;
        }

        return (
            <div className={`absolute rounded-md p-1 -top-2 right-1 ${className}`}>
                {label}
            </div>
        );
    }



    return (
        <Modal show={openModal} size="7xl" popup onClose={() => { resetModal(); onCloseFun() }}>
            <Modal.Header>{`${t("Simulation")} "${deviceSimulation && deviceSimulation.device_name}"`}</Modal.Header>

            <Modal.Body className="p-0 flex flex-col relative">

                {deviceSimulation &&
                    <div className="h-[60vh] flex flex-col m-4">
                        {step == 0 &&
                            <>

                                <h1>{t("simulation_mode_selection", { name: `${deviceSimulation && deviceSimulation.device_name}` })}</h1>
                                <div className={`grid ${deviceSimulation.clusters.length > 3 ? "grid-cols-3" : "grid-cols-2"} auto-rows-fr gap-4 flex-1 min-h-0 `}>
                                    {deviceSimulation.clusters
                                        .sort((a, b) => b.count - a.count)
                                        .map(clu => (
                                            <div
                                                key={clu.id}
                                                className={`relative shadow-md bg-zinc-50 rounded-md p-2
                                            hover:cursor-pointer hover:ring-2 hover:ring-lime-200 
                                            flex flex-col items-center h-full min-h-0
                                            ${selectedCluster && clu.id == selectedCluster.id && "border-4 border-lime-300"}
                                            `}
                                                onClick={() => {
                                                    setStep(1);
                                                    setNewDuration(clu.medoid.length);
                                                    setSelectedSimulation(clu, deviceSimulation.device_name, deviceSimulation.device_id, deviceSimulation.device_category, clusterTime);
                                                }}
                                            >
                                                <div className="relative w-full font-[Inter] p-2 border border-gray-300 rounded-md 
                                        flex flex-row items-center justify-between gap-2 mt-1">

                                                    <div className="pl-2">
                                                        {clu.id}
                                                    </div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="rounded-lg flex flex-row items-center p-2">
                                                            {getIcon("time")} {Math.floor(clu.medoid.length / 60)}h {clu.medoid.length % 60}min
                                                        </div>
                                                        <div className="rounded-lg flex flex-row items-center p-2">
                                                            {getIcon("energy")}
                                                            {clu.medoid.map(v => v / 60).reduce((sum, v) => sum + v, 0).toFixed(2)} Wh
                                                        </div>
                                                    </div>
                                                    <div className="absolute bg-zinc-50 left-2 -top-3 p-1 text-xs">
                                                        {t("Mode")}
                                                    </div>
                                                </div>
                                                <div className="flex-1 min-h-0 w-full">
                                                    <PowerGraph data={clu.medoid} indexes_on_x t={t} />
                                                </div>
                                                <FrequencyLabel percent={clu.percent} t={t} />
                                            </div>
                                        ))}
                                </div>
                            </>
                        }

                        {step == 1 &&
                            <>
                                <div className={`grid grid-cols-2 auto-rows-fr gap-4 flex-1 min-h-0 rounded-md`}>
                                    <div className="flex flex-col gap-4 rounded-md">
                                        <div className="flex flex-row gap-5 text-xl font-semibold border-b-2 border-gray-700 justify-between">
                                            <label>{t("Mode")}</label>
                                            {selectedCluster.id}
                                        </div>


                                        <div className="grid grid-cols-2 grid-flow-row items-center gap-2">



                                            <label>{t("Starting time")}</label>
                                            <TimePicker
                                                ampm={false}
                                                size="small"
                                                value={selectedCluster.time}
                                                onChange={(value) => updateClusterTime(value)

                                                } />



                                            <label>{t("Duration")}</label>
                                            <TextInput
                                                className="w-full"
                                                style={{ "background": "white", "borderWidth": "1px" }}
                                                sizing="lg"
                                                value={newDuration}
                                                onChange={(value) => { resampleMedoidDuration(value.target.value); }}
                                                type="number"
                                                rightIcon={MdOutlineTimer}
                                                min={1}
                                                max={600}
                                            />



                                            <label>{t("Ending time")}</label>
                                            <>
                                                <TimePicker
                                                    ampm={false}
                                                    size="small"
                                                    value={(selectedCluster.time.add(newDuration, "m"))}
                                                    onChange={(value) => updateClusterTime(value)

                                                    } readOnly />

                                            </>

                                        </div>


                                        <div className="grid grid-cols-2 gap-10 text-lg mt-10">
                                            <div className="flex flex-col rounded-lg bg-gray-50 p-3 shadow-md text-end">
                                                <div className="flex flex-row gap-2 items-center w-full">
                                                    {getIcon("energy")}
                                                    <label>{t("Consumption")}</label>
                                                </div>
                                                {selectedCluster.medoid.map(v => v / 60).reduce((sum, v) => sum + v, 0).toFixed(2)} Wh
                                            </div>

                                            <div className="flex flex-col rounded-lg bg-gray-50 p-3 shadow-md text-end">
                                                <div className="flex flex-row gap-2 items-center w-full">
                                                    {getIcon("money")}
                                                    <label>{t("Cost")}</label>
                                                </div>
                                                {computeCost(selectedCluster.medoid, selectedCluster.time, priceCalendar).toFixed(2)} €

                                            </div>
                                        </div>



                                    </div>
                                    <PowerGraph className=" shadown-m  rounded-md" data={selectedCluster.medoid} indexes_on_x t={t} />
                                </div>

                                <div className="flex flex-row justify-between">
                                    <StyledButton variant="secondary" onClick={() => setStep(0)}>
                                        {t("Back")}
                                    </StyledButton>
                                    <StyledButton variant="primary"
                                        onClick={() => {
                                            if (!overlappingsFun(selectedCluster)) {
                                                addSimulationFun(selectedCluster);
                                                resetModal()
                                            }
                                            else {
                                                setOverlappingsWarning(true)
                                            }
                                        }}>
                                        {t("Simulate")}
                                    </StyledButton>
                                </div>



                            </>
                        }
                    </div>
                }

                {loading &&
                    <div className="absolute size-full bg-slate-900/40 top-0 items-center flex justify-center z-100" >
                        <Spinner size={"xl"} color="success" />
                    </div>
                }

            </Modal.Body>

            <Modal.Footer />
        </Modal>


    )
}




export default function DeviceSimulation({ }) {
    const [simulations, setSimulations] = useState([])

    const [totalSimulation, setTotalSimulation] = useState({ starting_time: null, values: [] })

    const { t } = useLaravelReactI18n()

    const [priceCalendar, setPriceCalendar] = useState([]) //matrix 7*1440 that express the cost of energy per each minute of the week
    const [maxThreshold, setMaxThreshold] = useState(2900)

    const [deviceList, setDeviceList] = useState([] = [])

    const [loading, setLoading] = useState(false)

    const [openedDeviceId, setOpenedDeviceId] = useState(null)
    const [openedDeviceName, setOpenedDeviceName] = useState(null)

    const [warningList, setWarningList] = useState([])

    const [collapseDevices, setCollapseDevices] = useState(false)

    const [overlappingsWarning, setOverlappingsWarning] = useState(false)


    const overallConsumption = useMemo(() => totalSimulation.values.map(v => v / 60).reduce((sum, v) => sum + v, 0).toFixed(2))



    useEffect(() => {
        const fetchData = async () => {
            const data = await virtualService.getDevicesByHome("casa_menicanin")

            if (data) {
                setDeviceList(data);
            }
        };

        fetchData();
    }, []);


    useEffect(() => {
        const getConfiguration = async () => {
            const configurations = await configurationService.getAll()
            let prices = []
            configurations.forEach((conf) => {
                if (conf.key == "cost_slot_0")
                    prices[0] = conf.value
                else if (conf.key == "cost_slot_1" && conf.value > 0)
                    prices[1] = conf.value
                else if (conf.key == "cost_slot_2" && conf.value > 0)
                    prices[2] = conf.value
                else if (conf.key == "power_threshold")
                    setMaxThreshold(conf.value)

            })

            const calendar = await calendarService.getAll()
            const minutePrices = calendar.data.map(day =>
                day.flatMap(slot =>
                    Array(60).fill(prices[slot])
                )
            );

            setPriceCalendar(minutePrices)

        }
        getConfiguration()
    }, [])


    useEffect(() => {
        if (simulations.length === 0) {
            setTotalSimulation({ starting_time: null, values: [] })
            return;
        }

        const earliestSim = simulations.reduce((earliest, sim) =>
            dayjs(sim.time).isBefore(dayjs(earliest.time)) ? sim : earliest
        );

        const baseTime = dayjs(earliestSim.time);

        const totalLength = Math.max(
            ...simulations.map(sim => {
                const offsetMinutes = dayjs(sim.time).diff(baseTime, 'minute');
                return offsetMinutes + sim.medoid.length;
            })
        );
        const new_total = Array(totalLength).fill(0);
        simulations.forEach(sim => {
            const offsetMinutes = dayjs(sim.time).diff(baseTime, 'minute');

            sim.medoid.forEach((val, idx) => {
                new_total[offsetMinutes + idx] += val;
            });
        });
        setLoading(true)

        let warnings = []
        let current_warning_start = null

        for (let i = 0; i < new_total.length; i++) {
            if (new_total[i] > maxThreshold) {
                if (!current_warning_start) {
                    current_warning_start = i
                }
            }
            else {
                if (current_warning_start) {
                    warnings.push(`${baseTime.add(current_warning_start, "m").format("HH:mm")}-${baseTime.add(i, "m").format("HH:mm")}`)
                    current_warning_start = null
                }
            }
        }
        setWarningList(warnings)


        const totalCost = computeCost(new_total, baseTime, priceCalendar);


        /*         const totalCost = new_total.reduce((cost, power, minuteOffset) => {
                    const timestamp = baseTime.add(minuteOffset, "minute");
        
                    const dayIndex = (timestamp.day() + 6) % 7;
                    console.log(dayIndex)
                    const minuteOfDay =
                        timestamp.hour() * 60 +
                        timestamp.minute();
        
                    const price = priceCalendar[dayIndex][minuteOfDay];
        
                    return cost + (power / (60 * 1000)) * price;
                }, 0); */

        setTimeout(function () {
            setTotalSimulation({ starting_time: baseTime, values: new_total, cost: totalCost.toFixed(2) });
            setLoading(false)
        }, LOADING_TIME);
    }, [simulations]);




    function checkSchedulingOverlappings(simulation) {
        const res = simulations
            .filter(s => s.device_id === simulation.device_id && s != simulation)
            .some(s => {
                const sEnd = s.time.add(s.medoid.length, "minute");
                const clusterEnd = simulation.time.add(
                    simulation.medoid.length,
                    "minute"
                );

                return (
                    s.time.isBefore(clusterEnd) &&
                    simulation.time.isBefore(sEnd)
                );
            })

        setOverlappingsWarning(res)
        return res
    }


    function simulateSelectedSimulation(selectedCluster) {


        const dev = deviceList.filter(a => a.device_id == selectedCluster["device_id"])
        let new_simulation = selectedCluster
        if (dev.length == 1) {
            new_simulation.device_category = dev[0].category
        }

        /*         const index = simulations.findIndex(a => a.device_name == selectedCluster["device_name"])
        if (index == -1) {
            setSimulations([...simulations, selectedCluster]);
            }
            else {
                const updated = [...simulations];
            updated[index] = selectedCluster;
            setSimulations(updated);
            } */
        setSimulations([...simulations, new_simulation]);
        setOpenedDeviceId(null)
        setOpenedDeviceName(null)

    }

    function simulateUpdatedCluster(cluster, time = dayjs()) {
        if (time.isValid()) {

            const index = simulations.findIndex(a => a == cluster)
            cluster["time"] = time
            if (!checkSchedulingOverlappings(cluster)) {

                if (index == -1) {
                    setSimulations([...simulations, cluster]);
                }
                else {
                    const updated = [...simulations];
                    updated[index] = cluster;
                    setSimulations(updated);
                }

            }
        }
    }

    function removeSimulation(sim) {
        const index = simulations.findIndex(s => s == sim);
        if (index > -1) {
            let new_sim = [...simulations]
            new_sim.splice(index, 1)
            setSimulations(new_sim);
        }
    }



    function resetOpenedDevice() {
        setOpenedDeviceId(null)
        setOpenedDeviceName(null)
    }






    return (

        <div className="flex pt-3 size-full overflow-hidden">
            <SimulationPickModal
                t={t}
                device_id={openedDeviceId}
                device_name={openedDeviceName}
                addSimulationFun={simulateSelectedSimulation}
                onCloseFun={resetOpenedDevice}
                overlappingsFun={checkSchedulingOverlappings} 
                priceCalendar={priceCalendar}
                />


            <div className="h-[95%] w-full flex flex-row rounded-md mx-3 bg-zinc-100">



                <div className={`flex flex-col h-full gap-0 overflow-x-hidden overflow-y-auto rounded-b-md shadow-md ${collapseDevices ? "w-fit" : "w-[40%]"}`}>
                    {false &&
                        <div
                            className="mx-3 px-1 py-1 bg-zinc-100 rounded-md mb-5 flex flex-col gap-4"
                        >
                            <div className="font-semibold text-lg ml-1 font-[Inter]">
                                {t("simulation_threshold")}
                            </div>
                            <div className="flex flex-row items-center gap-10 ml-3">
                                <Slider
                                    value={maxThreshold}
                                    min={0}
                                    max={10000}
                                    step={100}
                                    onChange={(e, newValue) => setMaxThreshold(newValue)}
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
                                <div className="flex flex-row items-center gap-2">
                                    <TextInput value={maxThreshold} onChange={(value) => setMaxThreshold(value.target.value)} min={0} max={10000} step={100} type="number" />
                                    Watts
                                </div>

                            </div>
                            <div className="flex flex-row items-center gap-10 ml-3">

                            </div>
                        </div>
                    }

                    <div
                        className="flex flex-col h-full  p-1 gap-4 divide-gray-300 pb-5 relative"
                    >
                        <div className="font-semibold text-lg ml-1 font-[Inter] flex justify-between">
                            {!collapseDevices &&

                                t("Devices")
                            }
                            <StyledButton variant="secondary" onClick={() => setCollapseDevices(!collapseDevices)}>
                                {collapseDevices ? ">" : "<"}
                            </StyledButton>
                        </div>

                        {!collapseDevices &&
                            <>



                                {deviceList
                                    .filter(dev => !["sensor", "backup", "weather", "device_tracker"].includes(dev.device_class))
                                    .map((dev, i) => (
                                        <div className="flex flex-col items-center gap-2 px-2">
                                            <div
                                                className={`flex flex-row w-full items-center gap-3 py-2 justify-between`}

                                            >
                                                <div className="flex flex-row gap-2 items-center">
                                                    {getIcon(dev.category, "size-8")}
                                                    {dev.name_en}
                                                </div>
                                                <StyledButton onClick={() => { setOpenedDeviceId(dev.device_id); setOpenedDeviceName(dev.name_en) }}>
                                                    {getIcon("plus")}
                                                </StyledButton>

                                            </div>
                                            {simulations
                                                .filter(sim => sim.device_id == dev.device_id)
                                                .map((sim, idx) => (
                                                    <div className="grid grid-cols-5 items-center gap-2 ml-4">

                                                        <div className="relative col-span-2 flex flex-row items-center h-full justify-between gap-2 font-[Inter] p-1 border border-gray-300 rounded-sm hover:border-black">
                                                            <div className="pl-2">
                                                                {sim.id}
                                                            </div>
                                                            {/*<div
                                                                className="hover:bg-zinc-200 rounded-full p-2 hover:cursor-pointer"
                                                                onClick={() => { setOpenedDeviceId(sim.device_id); setOpenedDeviceName(sim.device_name) }}
                                                            >
                                                                {getIcon("change")}
                                                            </div>*/}
                                                            <div className="absolute bg-zinc-100 left-2 -top-3 p-1 text-xs">
                                                                {t("Mode")}
                                                            </div>
                                                        </div>
                                                        <div className="flex flex-row items-center gap-2 font-[Inter] col-span-2">
                                                            <TimePicker
                                                                ampm={false}
                                                                size="small"
                                                                label={t("Time")}
                                                                value={sim.time}
                                                                onChange={(value) =>
                                                                    simulateUpdatedCluster(sim, value)

                                                                } />
                                                        </div>
                                                        <div className="rounded-md h-full items-center justify-center flex p-1 hover:cursor-pointer hover:bg-red-400 border border-red-400"
                                                            onClick={() => removeSimulation(sim)}
                                                        >
                                                            {getIcon("close")}
                                                        </div>
                                                    </div>

                                                ))

                                            }
                                        </div>
                                    ))
                                }


                            </>
                        }
                    </div>
                </div>

                <div className="flex flex-col w-full overflow-x-auto">
                    {totalSimulation.values.length > 0 &&

                        <div className={`h-full flex flex-col relative p-2 pb-5`}>
                            <div className="rounded-md  flex flex-row items-center p-2 gap-4 text-lg">
                                <div className=" flex flex-row items-center gap-1 font-[Inter]">
                                    {getIcon("power")}
                                    {t("House power usage")}
                                </div>
                                <div className="flex flex-row items-center gap-1 ml-10">
                                    {getIcon("energy")}
                                    <Tooltip content={t("Overall consumption")} placement="bottom">
                                        {overallConsumption > 1000 ? `${(overallConsumption / 1000).toFixed(2)} kWh` : `${overallConsumption} Wh`}                                </Tooltip>
                                </div>
                                <div className="flex flex-row items-center gap-1 ml-5">
                                    {getIcon("money")}
                                    <Tooltip content={t("Overall cost")} placement="bottom">
                                        {totalSimulation.cost} €
                                    </Tooltip>
                                </div>
                            </div>
                            <PowerGraph data={totalSimulation.values} simulations={simulations} starting_time={totalSimulation.starting_time} interactive={true} maxThreshold={maxThreshold} t={t} />

                            {warningList.length > 0 &&
                                <div className="absolute top-3 right-3 p-2 bg-red-200 rounded-md flex flex-col items-start w-[30%]">
                                    <div className="flex gap-2 items-center">
                                        {getIcon("warning", "size-7")}
                                        <span className="font-semibold">

                                            {t("Excessive_consumption_warning")}
                                        </span>
                                    </div>
                                    {t("Excessive_consumption_description")} {warningList.join(",")}
                                </div>
                            }

                            {loading &&

                                <div className="size-full absolute bg-gray-400/50 items-center justify-center flex">
                                    <Spinner color="success" />
                                </div>
                            }

                        </div>
                    }

                </div>

            </div>
            <ToastNotification
                duration={6000}
                type="error"
                isVisible={overlappingsWarning}
                onClose={() => setOverlappingsWarning(false)}
                message={"Nell'orario selezionato il dispositivo è già impostato con una configurazione diversa.Per piacere modifica l'orario di inizio e/o la durata per evitare sovrapposizioni."}
            />
        </div>
    )
}