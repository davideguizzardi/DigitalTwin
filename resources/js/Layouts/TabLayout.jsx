import WhiteCard from "@/Components/Commons/WhiteCard"
import { animate, AnimatePresence, motion, useAnimate } from "framer-motion"
import { useRef } from "react"
import { useState } from "react"

export default function TabLayout({sections}){
    const titles = Object.keys(sections)
    const [tab, setTab] = useState(0)
    const [previousTab, setPreviousTab] = useState(0)
    
    const offset = 1900
    
    const variants = {
        initial: {
            x: (tab < previousTab ? -offset : offset),
            display: "none",
            opacity: 0.8,
        },
        animate: {
            display: "block",
            x: 0,
            opacity: 1,
            transition: {
                ease: "linear",
                duration: 0.25,
                delay: 0.25
            }
        },
        exit: {
            display: "none",
            opacity: 0.8,
            transition: {
                ease: "linear",
                duration: 0.25,
            }
        }
    }

    const handleClickTab = (ntab) => {
        if (ntab != tab) {
            animate(".custom-tab",
                { x: (tab < ntab ? -offset : offset) },
                { duration: 0.25 }
            )
            setPreviousTab(tab)
            setTab(ntab)
        }
    }

    return (
        <WhiteCard className="flex-col size-full gap-1 ">
            <div className="flex w-full h-min border-b-2 border-slate-200 dark:border-neutral-800">
                {
                    titles.map((title, index) => (
                        <div className="flex flex-col items-center w-full"
                            style={{cursor: "pointer"}}
                            onClick={()=> handleClickTab(index)}
                            key={index}
                        >
                            <h1 className="text-2xl py-2 dark:text-white text-center h-full">
                                {title}
                            </h1>
                            <motion.div className="flex bg-lime-400 rounded"
                                animate={{
                                    width: (tab == index ? "50%" : "0px"),
                                    height: (tab == index ? "2px" : "0px")
                                }}
                                transition={{ duration: 0.3 }}
                            />
                        </div>
                    ))
                }
            </div>
            <div className="flex w-full h-full">
                <AnimatePresence>
                    {
                        sections[titles[tab]] &&
                        <motion.div className="flex size-full custom-tab"
                            key={tab}
                            variants={variants}
                            initial="initial"
                            animate="animate"
                            exit="exit"
                            >
                                {sections[titles[tab]]}
                        </motion.div>
                    }
                </AnimatePresence>
            </div>

        </WhiteCard>
    )
}