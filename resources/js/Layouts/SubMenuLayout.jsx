import WhiteCard from "@/Components/Commons/WhiteCard"
import { useState } from "react"

export default function SubMenuLayout({sections}){
    const titles = Object.keys(sections)
    const [tab, setTab] = useState(titles[0])

    return (
        <div className="flex gap-2 size-full">
            <WhiteCard className="h-full flex-col gap-2 p-2 w-1/6">
            {
                titles.map((title)=>(
                    <div className={"w-full text-xl p-3 rounded dark:text-white" +
                        (tab==title ? " bg-slate-200 dark:bg-neutral-800 " : " dark:bg-neutral-900")}
                        style={{cursor: "pointer"}}
                        onClick={()=>{tab!=title && setTab(title)}}
                        >
                            {title}
                    </div>
                ))
            }
            </WhiteCard>
            <div className="flex size-full">
                {sections[tab]}
            </div>
        </div>
    )
}