import { animate, AnimatePresence, motion, useAnimate } from "framer-motion"
import { useState } from "react"
import ListButtons from "./ListButtons"
import CardAppliance from "./CardAppliance"

export default function AnimateMap2({ maps, appliances }) {
    const [indexImg, setIndexImg] = useState(0)
    const [previousIndex, setPreviousIndex] = useState(0)
    const offset = 100

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
            <AnimatePresence>

                    <motion.div className="floor flex w-full h-min relative"
                        id={"floor" + maps[indexImg].url} key={maps[indexImg].url}
                        variants={variants} initial="initial" animate="animate" exit="exit"
                    >
                        <img src={maps[indexImg].url} alt=""
                            className="border-solid border-2 dark:border-slate-600"
                            style={{
                                objectFit: "contain",
                                width: "100%",
                                height: "70vh"
                            }}

                        />
                        {appliances.filter((e) => e.floor == maps[indexImg].floor).map((e) => (<CardAppliance key={e.id} appliance={e} />))}
                    </motion.div>
            </AnimatePresence>
            <div className="flex flex-col justify-center items-center">
                <h1 className="text-lg dark:text-white ">Floors</h1>
                <ListButtons dataButtons={floorBtn} index={indexImg} />
            </div>
        </div >
    )
}