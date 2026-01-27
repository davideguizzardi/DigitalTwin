import { TimePicker } from "@mui/x-date-pickers";
import { useContext, useState, useEffect, useMemo } from "react"
import { apiFetch, getIcon } from "@/Components/Commons/Constants"
import { Checkbox, Modal, Spinner, TextInput } from "flowbite-react"
import {
    ResponsiveChartContainer,
    LinePlot,
    ChartsXAxis,
    ChartsYAxis,
    ChartsTooltip,
    ChartsAxisHighlight,
    ChartsReferenceLine,
    ScatterPlot,
    useDrawingArea
} from '@mui/x-charts';
import dayjs from "dayjs";


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
                            {/* Bubble */}
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

                            {/* Icon */}
                            <g transform="translate(-8, -8)">
                                {getIcon('device')}
                            </g>

                            {/* Text */}
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
        <div className="w-full h-full">
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
                        showMark: false,
                    },
                    /* {
                        type: 'scatter',
                        data: starting_list,
                        markerSize: 6,
                        color: '#2563eb',
                        valueFormatter:v=>v.label
                    } */

                ]}
            >
                <LinePlot />
                {/*<ScatterPlot/>*/}
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





export default function DeviceSimulation({ }) {
    const [simulations, setSimulations] = useState([])
    const [openModal, setOpenModal] = useState(false)
    const [deviceSimulation, setDeviceSimulation] = useState({ clusters: [] })

    const [totalSimulation, setTotalSimulation] = useState({ starting_time: null, values: [] })

    const [maxThreshold, setMaxThreshold] = useState(3000)
    const [useBestSimulation, setUseBestSimulation] = useState(false)

    const [houseDevices, setHouseDevices] = useState([])

    const [loading, setLoading] = useState(false)

    useEffect(() => {
        if (simulations.length === 0) {
            setTotalSimulation({ starting_time: null, values: [] })
            return;
        }

        // 1. Find earliest start time
        const earliestSim = simulations.reduce((earliest, sim) =>
            dayjs(sim.time).isBefore(dayjs(earliest.time)) ? sim : earliest
        );

        const baseTime = dayjs(earliestSim.time);

        // 2. Find how long the total timeline must be
        const totalLength = Math.max(
            ...simulations.map(sim => {
                const offsetMinutes = dayjs(sim.time).diff(baseTime, 'minute');
                return offsetMinutes + sim.medoid.length;
            })
        );

        // 3. Initialize total array
        const new_total = Array(totalLength).fill(0);

        // 4. Sum by time instant
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





    useEffect(() => {
        async function getHouse() {
            const data = await apiFetch(`/Simulation/house/casa_menicanin`);
            if (data) {
                setHouseDevices(data)
            }
        }
        getHouse()
    }, [])

    function setSelectedSimulation(cluster, device_name, device_id, time = dayjs()) {

        cluster["device_name"] = device_name
        cluster["device_id"] = device_id
        cluster["time"] = time

        const index = simulations.findIndex(a => a.device_name == device_name)
        if (index == -1) {
            setSimulations([...simulations, cluster]);
        }
        else {
            const updated = [...simulations];
            updated[index] = cluster;
            setSimulations(updated);
        }
        setDeviceSimulation({ clusters: [] })

        const medoid = cluster.medoid
        setOpenModal(false)
    }


    function removeSimulation(device_id) {
        const index = simulations.findIndex(s => s.device_id == device_id);
        if (index > -1) {
            let new_sim = [...simulations]
            new_sim.splice(index, 1)
            setSimulations(new_sim);
        }
    }




    function SimulationPickModal({ }) {

        function FrequencyLabel({ percent }) {
            if (percent == null) return null;

            let label = "";
            let className = "";

            if (percent >= 50) {
                label = "Molto frequente";
                className = "bg-lime-200 ";
            } else if (percent < 50 && percent >= 30) {
                label = "Frequente";
                className = "bg-lime-200 ";
            } else if (percent > 5 && percent <= 15) {
                label = "Rara";
                className = "bg-red-200 ";
            } else if (percent <= 5) {
                label = "Molto rara";
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
            <Modal show={openModal} size="7xl" popup onClose={() => setOpenModal(false)}>
                <Modal.Header>Seleziona la modalità da simulare</Modal.Header>

                <Modal.Body className="p-0">
                    <div className="h-[60vh] flex flex-col m-4">
                        <div className={`grid ${deviceSimulation.clusters.length > 3 ? "grid-cols-3" : "grid-cols-2"} auto-rows-fr gap-4 flex-1 min-h-0 `}>
                            {deviceSimulation.clusters
                                .sort((a, b) => b.count - a.count)
                                .map(clu => (
                                    <div
                                        key={clu.id}
                                        className="relative shadow-md bg-zinc-50 rounded-md p-2
                                            hover:cursor-pointer hover:bg-zinc-100
                                            flex flex-col items-center h-full min-h-0"
                                        onClick={() => setSelectedSimulation(clu, deviceSimulation.device_name, deviceSimulation.device_id)}
                                    >
                                        <div className="relative w-full font-[Inter] p-2 border border-gray-300 rounded-md 
                                        flex flex-row items-center justify-between gap-2 mt-1">

                                            <div className="pl-2">
                                                {clu.id}
                                            </div>
                                            <div className="rounded-lg flex flex-row items-center p-2">
                                                {getIcon("time")} {Math.floor(clu.medoid.length / 60)}h {clu.medoid.length % 60}min
                                            </div>
                                            <div className="absolute bg-zinc-50 left-2 -top-3 p-1 text-xs">
                                                Modalità
                                            </div>
                                        </div>
                                        <div className="flex-1 min-h-0 w-full -m-6">
                                            <PowerGraph data={clu.medoid} indexes_on_x />
                                        </div>
                                        <FrequencyLabel percent={clu.percent} />
                                    </div>
                                ))}
                        </div>
                    </div>
                </Modal.Body>

                <Modal.Footer />
            </Modal>


        )
    }

    async function pullSimulation(device_id, device_name) {
        const data = await apiFetch(`/Simulation/device/${device_id}`);
        if (data) {
            data["device_name"] = device_name
            data["device_id"] = device_id
            setDeviceSimulation(data)
            setOpenModal(!useBestSimulation)
            if (useBestSimulation) {
                setSelectedSimulation(data.clusters.sort((a, b) => b.count - a.count)[0], device_name)
            }
        }
    }

    const devices = [
        {
            name: "Lavatrice Daniela",
            id: "4e036baa49c0754ad048c48666163c83"
        },
        {
            name: "Pc Daniela(?)",
            id: "83d55ab7b315ea1387442b5b4a48bbd9"
        }
    ]



    return (
        <div className="grid grid-cols-3 gap-2 pt-3 size-full overflow-hidden ">
            <SimulationPickModal />

            <div className="flex flex-col gap-2">
                <div
                    className="mx-3 px-1 py-2 bg-zinc-100 rounded-md hover:cursor-pointer mb-5 flex flex-col gap-4"
                >
                    <div className="font-semibold text-lg ml-1 font-[Inter]">
                        Parametri della simulazione
                    </div>
                    <div className="flex flex-row items-center gap-10 ml-3">
                        Massimo <TextInput value={maxThreshold} onChange={(value) => setMaxThreshold(value.target.value)} min={0} max={20000} step={100} type="number" />
                    </div>
                    <div className="flex flex-row items-center gap-10 ml-3">
                        Usa sempre la simulazione più probabilie <Checkbox checked={useBestSimulation} onChange={(e) => setUseBestSimulation(e.target.checked)} />
                    </div>
                </div>

                <div
                    className="flex flex-col mx-3 bg-zinc-100 rounded-md"
                >
                    <div className="font-semibold text-lg ml-1 font-[Inter]">
                        Dispositivi simulabili
                    </div>

                    {
                        houseDevices.map(dev => (
                            <div
                                className="ml-3 px-1 py-2 rounded-md hover:cursor-pointer hover:translate-x-2"
                                onClick={() => { setDeviceSimulation(dev); setOpenModal(true) }}
                            //onClick={() => pullSimulation(dev.id, dev.name)}
                            >
                                {dev.device_name}
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
                                {getIcon("device")} {sim.device_name}
                            </div>
                            <div className="w-[83%] relative flex flex-row items-center justify-between gap-2 
                            font-[Inter] p-1 border border-gray-300 rounded-sm hover:border-black">
                                <div className="pl-2">
                                    {sim.id}
                                </div>
                                <div
                                    className="hover:bg-zinc-200 rounded-full p-2 hover:cursor-pointer"
                                    onClick={() => { setDeviceSimulation(houseDevices.find((d) => d.device_name == sim.device_name)); setOpenModal(true) }}
                                //onClick={() => pullSimulation(sim.device_id, sim.device_name)}
                                >
                                    {getIcon("change")}
                                </div>
                                <div className="absolute bg-zinc-100 left-2 -top-3 p-1 text-xs">
                                    Modalità
                                </div>
                            </div>
                            <div className="flex flex-row items-center gap-2 font-[Inter]">
                                <TimePicker ampm={false} size="small" label='Orario' value={sim.time} onChange={(value) => setSelectedSimulation(sim, sim.device_name, sim.device_id, value)} />
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
                        <div className=" flex flex-row items-center gap-2 mx-2 mt-2 text-lg font-[Inter]">
                            {getIcon("power")}
                            Potenza utilizzata dall'intera abitazione
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
        </div>)
}