import { useCallback, useEffect, useRef, useState, useContext } from "react";
import { ThemeButton } from "@/Components/Commons/ThemeButton"
import { animate, AnimatePresence, motion } from "framer-motion";
import ListButtons from "@/Components/Commons/ListButtons"
import ListAppliancesRef from "@/Components/ConfigurationMap/ListAppliancesRef"
import DroppableLayerRef from "@/Components/ConfigurationMap/DroppableLayerRef";
import { Modal } from "flowbite-react";
import Cookies from 'js-cookie';
import AnimateMap from "../Commons/AnimateMap";
import AnimateMap2 from "../Commons/AnimateMap2";
import WhiteCard from "../Commons/WhiteCard";
import { useSwipeable } from "react-swipeable";
import { backend } from "../Commons/Constants";
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { DeviceContext } from "../ContextProviders/DeviceProvider";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { getIcon } from "../Commons/Constants";

const token = Cookies.get("auth-token")

export default function ConfigurationApplianceRef({ editMode, endSection, backSection,isInitialConfiguration }) {
    const { deviceList, setDeviceList } = useContext(DeviceContext);
    const configRef = useRef()
    const refApplOnfFloor = useRef()
    const refUnconfAppl = useRef()
    const [applOnFloor, setApplOnFloor] = useState([])
    const [maps, setMaps] = useState([])
    refApplOnfFloor.current = applOnFloor
    const [unconfAppl, setUnconfAppl] = useState([])
    const [floor, setFloor] = useState()
    const [indexImg, setIndexImg] = useState(0);
    const [previousIndex, setPreviousIndex] = useState(0)
    const [first, setFirst] = useState(true)
    const [openModal, setOpenModal] = useState(false)
    const { t } = useLaravelReactI18n()
    let dataBtn = []

    const offset = 100

    const floorAbove = () => {
        if (indexImg <= maps.length - 1 && indexImg > 0) {
            animate("div.floor",
                { y: offset },
                { duration: 0.25 }
            )
            setFloor(maps[indexImg - 1].floor)
            setPreviousIndex(indexImg)
            setIndexImg(indexImg - 1)
        } else if (indexImg == 0) {
            animate("div.floor",
                { y: [0, offset, 0] },
                { duration: 0.50 }
            )
        }

    }

    const floorBelow = () => {
        if (indexImg < maps.length - 1 && indexImg >= 0) {
            animate("div.floor",
                { y: -offset },
                { duration: 0.25 }
            )
            setFloor(maps[indexImg + 1].floor)
            setPreviousIndex(indexImg)
            setIndexImg(indexImg + 1)
        } else if (indexImg == maps.length - 1) {
            animate("div.floor",
                { y: [0, -offset, 0] },
                { duration: 0.50 }
            )
        }
    }

    const handlerSwipe = useSwipeable({
        onSwipedDown: () => floorAbove(),
        onSwipedUp: () => floorBelow()
    })


    maps.map((element, index) => {
        dataBtn = [...dataBtn, {
            callback: () => {
                if (indexImg != index) {
                    animate("div.floor",
                        { y: (indexImg < index ? -offset : offset) },
                        { duration: 0.25 }
                    )
                    setFloor(element.floor)
                    setPreviousIndex(indexImg)
                    setIndexImg(index)
                }
            },
            text: element.floor,
            icon: (<></>)
        }]
    })

    const variants = {
        initial: {
            display: "none",
            y: (previousIndex < indexImg ? offset : -offset)
        },
        animate: {
            display: "block",
            y: 0,
            transition: {
                delay: 0.25,
                duration: 0.25
            }
        },
        exit: {
            display: "none",
            opacity: 0,
            transition: {
                duration: 0.25
            }
        }
    }

    const addApplOnFloor = (posAppl) => {
        setDeviceList((prevDeviceList) =>
            prevDeviceList.map((device) =>
                device.device_id === posAppl.id
                    ? { ...device, top: posAppl.top, left: posAppl.left, floor: posAppl.floor }
                    : device
            )
        );
        if (!refApplOnfFloor.current.includes(posAppl)) {
            //const updateState = [...refApplOnfFloor.current.filter(el => el.id !== posAppl.id),
            //    posAppl]

            const updateState = [...refApplOnfFloor.current.filter(el => el.device_id !== posAppl.id),
            { ...deviceList.find(e => e.device_id == posAppl.id), top: posAppl.top, left: posAppl.left, floor: posAppl.floor }]
            setApplOnFloor([...updateState])

            const updateUnconf = [...refUnconfAppl.current.filter(el => el.device_id !== posAppl.id)]
            refUnconfAppl.current = [...updateUnconf]
            setUnconfAppl([...updateUnconf])
        }
    }

    const removeApplOnFloor = (posApplId) => {
        const updateState = refApplOnfFloor.current.filter(el => el.device_id !== posApplId)
        setApplOnFloor([...updateState])
    }

    const addUnconfAppl = (appl) => {
        if (!refUnconfAppl.current.includes(appl)) {
            const updateApplOnFloor = [...refUnconfAppl.current.filter(el => el.device_id !== appl)]
            refUnconfAppl.current = [...updateApplOnFloor]
            setApplOnFloor([...refApplOnfFloor.current.filter(el => el.device_id !== appl)])
            const updateState = [...refUnconfAppl.current, deviceList.find(dev => dev.device_id == appl)].sort()
            setUnconfAppl([...updateState])
        } else {
            setUnconfAppl([...refUnconfAppl.current])
        }

    }

    const removeUnconAppl = (appl) => {
        const updateState = refUnconfAppl.current.filter(el => appl !== el.device_id)
        setUnconfAppl([...updateState])
    }

    const deleteAppl = async (appl) => {
        const response = await fetch("http://localhost:8000/map/entity/" + appl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
        })
        console.log(response)
    }

    const deleteUnconfAppl = async () => {
        unconfAppl.forEach((appl) => {
            console.log(appl)
            deleteAppl(appl)
        })
    }

    const putApplOnFloor = async () => {
        const data = applOnFloor.map((e) => {
            return {
                entity_id: e.device_id,
                y: e.top,
                x: e.left,
                floor: e.floor
            }
        })
        const response = await fetch(backend + "/map", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify({ data: data })
        })
    }

    const saveCallback = () => {
        if (unconfAppl.length > 0) {
            setOpenModal(true)

        } else {
            putApplOnFloor()
            endSection()
        }
    }

    const fetchMap = async () => {
        const apiRoute = route('map.index')
        const response = await fetch(apiRoute, {
            headers: {
                'Authorization': 'Bearer ' + token
            },
        })
        response.json().then((result) => {
            setMaps([...result.maps])
            setFloor(result.maps[0].floor)
        })

    }

    const fetchApplOnFloor = async () => {
        const response = await fetch(backend + "/map", {
            headers: { 'Authorization': 'Bearer ' + token }
        });

        const result = await response.json();
        const onFloor = result.map((e) => {
            const device = deviceList.find((dev) => e.entity_id === dev.device_id);
            return device
                ? { ...device, top: e.y, left: e.x, floor: e.floor }
                : {};
        })
        await setApplOnFloor(onFloor);
        setFirst(false);
    };

    const fetchUnconfAppl = async () => {
        const updateState = deviceList.filter((dev) => {
            return dev.show && !applOnFloor.some(e => dev.device_id == e.device_id)
        }).sort()
        await setUnconfAppl([...updateState])
        refUnconfAppl.current = [...updateState]
    }

    useEffect(() => {
        fetchMap()
        fetchApplOnFloor();
        refApplOnfFloor.current = applOnFloor
    }, []);

    useEffect(() => {
        fetchUnconfAppl()
    }, [applOnFloor])



    return (
        <div className="relative flex size-full" ref={configRef} >
            <div className="flex flex-col size-full px-2 justify-around">
                <Modal size="3xl" show={openModal} onClose={() => setOpenModal(false)}>
                    <Modal.Header>{t("Unconfigured Appliances")}</Modal.Header>
                    <Modal.Body>
                        <div className="flex flex-col h-3/6">
                            <div className="flex w-full h-fit pb-4 gap-2 items-center">
                                <p>{t("Those appliances are not configured")}</p>
                            </div>
                            <div className="w-full h-full">
                                <ListAppliancesRef appliances={unconfAppl} dragConstraints={configRef}
                                    addAppl={addUnconfAppl} removeAppl={removeUnconAppl}
                                />
                            </div>
                            <div className="flex items-center justify-around p-2 mt-2">
                                <ThemeButton className="text-lg" onClick={() => { setOpenModal(false) }}>{t("Cancel")}</ThemeButton>
                                <ThemeButton className="text-lg" onClick={() => {
                                    deleteUnconfAppl()
                                    putApplOnFloor()
                                    setOpenModal(false)
                                    endSection()
                                }}>{t("Save")}</ThemeButton>
                            </div>
                        </div>
                    </Modal.Body>
                </Modal>
                <div className="flex w-full">
                    <div className="w-3/5 h-full flex justify-center items-center">
                        <div className="relative flex justify-center items-center shadow">
                            <div {...handlerSwipe}>
                                <AnimatePresence>
                                    {maps[indexImg] &&
                                        <motion.div className="floor flex w-full h-min" variants={variants}
                                            initial="initial" animate="animate" exit="exit"
                                            key={maps[indexImg].url}
                                        >
                                            <img src={maps[indexImg].url}
                                                style={{
                                                    objectFit: "contain",
                                                    width: "100%",
                                                    height: "70vh"
                                                }}
                                            />
                                            <DroppableLayerRef isEditMode={editMode} dragConstraints={configRef}
                                                listAppliancesPos={refApplOnfFloor.current} index={floor}
                                                addAppl={addApplOnFloor} removeAppl={removeApplOnFloor}
                                            />
                                        </motion.div>
                                    }
                                </AnimatePresence>
                            </div>
                        </div>

                        <motion.div className="flex flex-col justify-center items-center w-min m-2 p-1 rounded-full"
                        >
                            <p className="dark:text-white">{t("Floors")}</p>
                            <ListButtons dataButtons={dataBtn} index={indexImg} />
                        </motion.div>
                    </div>
                    <div className="w-2/5" style={{ height: "68vh" }}>
                        <p className="text-center text-2xl dark:text-white">{t("Appliances")}</p>
                        <ListAppliancesRef appliances={unconfAppl} dragConstraints={configRef} isEditMode={true}
                            addAppl={addUnconfAppl} removeAppl={removeUnconAppl}
                        />
                    </div>
                </div>

                {
                    isInitialConfiguration ?
                        <div className="grid grid-cols-2 ">
                            <div className="flex justify-start">
                                <StyledButton onClick={() => backSection()}>
                                    {getIcon("arrow_left")}{t("Back")}
                                </StyledButton>
                            </div>

                            <div className="flex justify-end">
                                {deviceList.filter(d => d.show).length > 0 &&

                                    <StyledButton onClick={() => { saveCallback() }}>
                                        {t("Next")}{getIcon("arrow_right")}
                                    </StyledButton>
                                }
                            </div>
                        </div>
                        :
                        <div className="flex w-full h-min py-3 items-end justify-center">
                            <StyledButton onClick={() => { saveCallback() }}>{t("Save")}</StyledButton>
                        </div>
                }


            </div>

        </div>
    )
}