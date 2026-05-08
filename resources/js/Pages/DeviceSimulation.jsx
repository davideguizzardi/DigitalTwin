import { TimePicker } from "@mui/x-date-pickers";
import { useContext, useState, useEffect } from "react"
import { getIcon } from "@/Components/Commons/Constants"
import { Button, Modal, Spinner, TextInput } from "flowbite-react"
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
import { DeviceContextRefresh } from "@/Components/ContextProviders/DeviceProviderRefresh";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";

import { Slider } from "@mui/material";

import { simulationService, virtualService } from "@/Api";

const COST_FACTOR = 0.4


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
}) {
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
        <div className={`size-full ${className}`}>
            <ResponsiveChartContainer
                xAxis={[indexes_on_x ? index_axis : time_axis]}
                yAxis={[
                    {
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
        </div>
    );
}

function SimulationPickModal({ device_id, device_name, addSimulationFun, t }) {
    const [selectedCluster, setSelectedCluster] = useState(null)
    const [step, setStep] = useState(0)
    const [editMode, setEditMode] = useState(false)
    const [newDuration, setNewDuration] = useState(1)
    const [clusterTime, setClusterTime] = useState(dayjs())
    const [openModal, setOpenModal] = useState(false)
    const [deviceSimulation, setDeviceSimulation] = useState(null)

    function resetModal() {
        setOpenModal(false)
        setSelectedCluster(null)
        setStep(0)
        setEditMode(null)
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


    async function resampleMedoidDuration() {
        const new_medoid = await simulationService.resampleDeviceMode(selectedCluster.device_id, selectedCluster.id, newDuration)
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
        <Modal show={openModal} size="7xl" popup onClose={() => resetModal()}>
            <Modal.Header>{t("simulation_mode_selection", { name: `${deviceSimulation && deviceSimulation.device_name}` })}</Modal.Header>

            <Modal.Body className="p-0 flex flex-col">
                {deviceSimulation &&
                    <div className="h-[60vh] flex flex-col m-4">
                        {step == 0 &&
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
                                            <div className="flex-1 min-h-0 w-full -m-6">
                                                <PowerGraph data={clu.medoid} indexes_on_x />
                                            </div>
                                            <FrequencyLabel percent={clu.percent} t={t} />
                                        </div>
                                    ))}
                            </div>

                        }

                        {step == 1 &&
                            <>
                                <div className={`grid grid-cols-2 auto-rows-fr gap-4 flex-1 min-h-0 rounded-md`}>
                                    <div className="flex flex-col gap-4 rounded-md">
                                        <div className="flex flex-row gap-5 text-xl font-semibold border-b-2 border-gray-400">
                                            <label>{t("Mode")}</label>
                                            {selectedCluster.id}
                                        </div>

                                        <div className="flex flex-row gap-5 items-center">
                                            <label>{t("Time")}</label>
                                            {editMode ?

                                                <TimePicker
                                                    ampm={false}
                                                    size="small"
                                                    value={selectedCluster.time}
                                                    onChange={(value) => updateClusterTime(value)

                                                    } />
                                                :
                                                <>
                                                    {clusterTime.format("HH:mm")}
                                                </>
                                            }
                                        </div>

                                        <div className="flex flex-row gap-5 items-center">
                                            <label>{t("Duration")}</label>
                                            {editMode ?
                                                <>
                                                    <TextInput
                                                        value={newDuration}
                                                        onChange={(value) => setNewDuration(value.target.value)}
                                                        type="number"
                                                        min={1}
                                                        max={600}
                                                    /> min

                                                </>

                                                :
                                                <>
                                                    {selectedCluster.medoid.length} min

                                                </>
                                            }
                                        </div>

                                        <div className="w-full items-end flex justify-end border-b-2 border-gray-400 pb-2">

                                            {editMode ?
                                                <StyledButton variant="secondary" onClick={() => { resampleMedoidDuration(); setEditMode(false) }}>
                                                    {getIcon("save")}
                                                    {t("Save")}
                                                </StyledButton>
                                                :
                                                <StyledButton variant="secondary" onClick={() => setEditMode(true)}>
                                                    {getIcon("edit")}
                                                    {t("Change")}
                                                </StyledButton>
                                            }


                                        </div>

                                        <div className="grid grid-cols-2 gap-10 text-lg">
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
                                                {(selectedCluster.medoid.map(v => v / (60 * 1000)).reduce((sum, v) => sum + v, 0) * COST_FACTOR).toFixed(2)} €

                                            </div>
                                        </div>



                                    </div>
                                    <PowerGraph className=" shadown-m  rounded-md" data={selectedCluster.medoid} indexes_on_x />
                                </div>

                                <div className="flex flex-row justify-between">
                                    <StyledButton variant="secondary" onClick={() => setStep(0)}>
                                        {t("Back")}
                                    </StyledButton>
                                    <StyledButton variant="primary"
                                        onClick={() => { addSimulationFun(selectedCluster); resetModal() }}>
                                        Simulate
                                    </StyledButton>
                                </div>



                            </>
                        }
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

    const [maxThreshold, setMaxThreshold] = useState(3000)

    const [deviceList, setDeviceList] = useState([] = [])

    const [loading, setLoading] = useState(false)

    const [openedDeviceId, setOpenedDeviceId] = useState(null)
    const [openedDeviceName, setOpenedDeviceName] = useState(null)



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

        setTimeout(function () {
            setTotalSimulation({ starting_time: baseTime, values: new_total });
            setLoading(false)
        }, 1000);
    }, [simulations]);







    function simulateSelectedSimulation(selectedCluster) {

        const index = simulations.findIndex(a => a.device_name == selectedCluster["device_name"])
        if (index == -1) {
            setSimulations([...simulations, selectedCluster]);
        }
        else {
            const updated = [...simulations];
            updated[index] = selectedCluster;
            setSimulations(updated);
        }
        setOpenedDeviceId(null)
        setOpenedDeviceName(null)
    }

    function simulateUpdatedCluster(cluster, device_name, device_id, device_category, time = dayjs()) {
        cluster["device_name"] = device_name
        cluster["device_id"] = device_id
        cluster["device_category"] = device_category
        cluster["time"] = time
        const index = simulations.findIndex(a => a.device_name == cluster["device_name"])
        if (index == -1) {
            setSimulations([...simulations, cluster]);
        }
        else {
            const updated = [...simulations];
            updated[index] = cluster;
            setSimulations(updated);
        }

    }

    function removeSimulation(device_id) {
        const index = simulations.findIndex(s => s.device_id == device_id);
        if (index > -1) {
            let new_sim = [...simulations]
            new_sim.splice(index, 1)
            setSimulations(new_sim);
        }
    }










    return (

        <div className="grid grid-cols-3 gap-2 pt-3 size-full overflow-hidden ">
            <SimulationPickModal t={t} device_id={openedDeviceId} device_name={openedDeviceName} addSimulationFun={simulateSelectedSimulation} />

            <div className="flex flex-col gap-2">
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

                <div
                    className="flex flex-col mx-3 bg-zinc-100 rounded-md p-1"
                >
                    <div className="font-semibold text-lg ml-1 font-[Inter]">
                        {t("Devices")}
                    </div>

                    {deviceList
                        .filter(dev => !["sensor", "backup", "weather", "device_tracker"].includes(dev.device_class))
                        .map((dev, i) => (
                            <div
                                className={`flex flex-row items-center gap-3 p-2 hover:translate-x-2 hover:cursor-pointer`}
                                onClick={() => { setOpenedDeviceId(dev.device_id); setOpenedDeviceName(dev.name) }}
                            >
                                {getIcon(dev.category, "size-8")}
                                {dev.name}
                                {/*<DeviceRecord device={dev} onClickFun={() => pullSimulation(dev.device_id, dev.name, dev.category)} />*/}
                            </div>
                        ))
                    }

                </div>
            </div>

            <div className="flex flex-col col-span-2">
                <div
                    className="flex flex-row gap-2 items-start overflow-x-auto overflow-y-hidden"
                >
                    {simulations.map((sim, idx) => (
                        <div key={idx} className="h-[34vh] aspect-square bg-zinc-100 rounded-md flex flex-col relative gap-3 items-center">
                            <div className="flex flex-row items-center gap-2 font-[Inter] px-2">
                                {getIcon(sim.device_category)} {sim.device_name}
                            </div>
                            <div className="w-[83%] relative flex flex-row items-center justify-between gap-2 
                            font-[Inter] p-1 border border-gray-300 rounded-sm hover:border-black">
                                <div className="pl-2">
                                    {sim.id}
                                </div>
                                <div
                                    className="hover:bg-zinc-200 rounded-full p-2 hover:cursor-pointer"
                                    onClick={() => pullSimulation(sim.device_id, sim.device_name, sim.device_category)}
                                >
                                    {getIcon("change")}
                                </div>
                                <div className="absolute bg-zinc-100 left-2 -top-3 p-1 text-xs">
                                    {t("Mode")}
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2 font-[Inter]">
                                <TimePicker
                                    ampm={false}
                                    size="small"
                                    label={t("Time")}
                                    value={sim.time}
                                    onChange={(value) =>
                                        simulateUpdatedCluster(sim, sim.device_name, sim.device_id, sim.device_category, value)

                                    } />
                            </div>
                            <div className="absolute top-1 right-1 rounded-full p-1 hover:cursor-pointer hover:bg-red-400"
                                onClick={() => removeSimulation(sim.device_id)}
                            >
                                {getIcon("close")}
                            </div>
                            <div className="size-full -m-5 -mt-10">
                                <PowerGraph data={sim.medoid} starting_time={sim.time} />
                            </div>


                        </div>
                    ))}
                </div>


                {totalSimulation.values.length > 0 &&

                    <div className="h-[55vh] bg-zinc-100 rounded-md my-2 flex flex-col mr-2 relative">
                        <div className="bg-red-100 rounded-md absolute top-0 right-0 flex flex-row items-center p-2 gap-4">
                            <div className="flex flex-row items-center gap-1">
                                {getIcon("energy")}
                                {totalSimulation.values.map(v => v / 60).reduce((sum, v) => sum + v, 0).toFixed(2)} Wh
                            </div>
                            <div className="flex flex-row items-center gap-1">
                                {(totalSimulation.values.map(v => v / (60 * 1000)).reduce((sum, v) => sum + v, 0) * COST_FACTOR).toFixed(2)} €
                            </div>
                        </div>
                        <div className=" flex flex-row items-center gap-2 mx-2 mt-2 text-lg font-[Inter]">
                            {getIcon("power")}
                            {t("House power usage")}
                        </div>
                        <PowerGraph data={totalSimulation.values} simulations={simulations} starting_time={totalSimulation.starting_time} interactive={true} maxThreshold={maxThreshold} />

                        {loading &&

                            <div className="size-full absolute bg-gray-400/50 items-center justify-center flex">
                                <Spinner color="success" />
                            </div>
                        }

                    </div>
                }

            </div>
        </div>
    )
}