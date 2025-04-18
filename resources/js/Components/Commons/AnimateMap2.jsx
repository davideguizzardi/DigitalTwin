import { animate, AnimatePresence, motion, useAnimate } from "framer-motion"
import { useState } from "react"
import ListButtons from "./ListButtons"
import CardAppliance from "./CardAppliance"
import { useSwipeable } from "react-swipeable"
import { useLaravelReactI18n } from 'laravel-react-i18n';
import { domain } from "./Constants"
import ControlPopup from "../ControlAppliance/ControlPopup"
import RoomMap from "./RoomMap"

export default function AnimateMap2({ maps, appliances ,rooms=[]}) {
    const [openDevice,setOpenDevice]=useState({})
    const [indexImg, setIndexImg] = useState(0)
    const [previousIndex, setPreviousIndex] = useState(0)
    const offset = 100
    const {t} = useLaravelReactI18n()
    const floorAbove = () =>{
        if(indexImg <= maps.length - 1 && indexImg > 0 ){
            animate("div.floor",
                { y: offset },
                { duration: 0.25 }
            )
            setPreviousIndex(indexImg)
            setIndexImg(indexImg - 1)
        }else if(indexImg==0){
            animate("div.floor", 
                { y: [0, offset, 0]},
                { duration: 0.50}
            )
        }

    }

    const floorBelow = () =>{
        if (indexImg < maps.length - 1 && indexImg >= 0) {
            animate("div.floor",
                { y: -offset },
                { duration: 0.25 }
            )
            setPreviousIndex(indexImg)
            setIndexImg(indexImg + 1)
        }else if(indexImg == maps.length-1){
            animate("div.floor", 
                { y: [0, -offset, 0]},
                { duration: 0.50}
            )
        }
    }

    const handlerSwipe = useSwipeable({
        onSwipedDown: () => floorAbove(),
        onSwipedUp: () => floorBelow()
    })

    const floorBtn = maps.map((element, index) => {
        return {
            callback: () => {
                if (indexImg != index) {
                    animate("div.floor",
                        { y: (indexImg < index ? -offset : offset) },
                        { duration: 0.25 }
                    )
                    setPreviousIndex(indexImg)
                    setIndexImg(index)
                }
            },
            text: element.floor,
            icon: (<></>)
        }
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

    return (
        <div className="flex size-full items-center justify-center">
            <ControlPopup openDevice={openDevice}/>
            <div {...handlerSwipe}>

                <AnimatePresence>

                    <motion.div className="floor flex w-full h-min relative"
                        id={"floor" + maps[indexImg].url} key={maps[indexImg].url}
                        variants={variants} initial="initial" animate="animate" exit="exit"
                    >
                        <RoomMap image_url={domain + "/" + maps[indexImg].url} floor={maps[indexImg].floor}/>
                        {appliances.filter((e) => e.floor == maps[indexImg].floor).map((e) => (<CardAppliance key={e.id} appliancePos={e} setClickedDevice={setOpenDevice} />))}
                    </motion.div>
                </AnimatePresence>
            </div>
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-lg dark:text-white ">{t("Floors")}</h1>
                <ListButtons dataButtons={floorBtn} index={indexImg} />
            </div>
        </div >
    )
}