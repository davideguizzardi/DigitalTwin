import { useState, useEffect } from "react"
import { TouchKeyboard2 } from "../Commons/TouchKeyboard2"
import { getIcon } from "../Commons/Constants"
import { motion } from "framer-motion"
import { apiFetch } from "../Commons/Constants"
import { useLaravelReactI18n } from "laravel-react-i18n"

import { StyledButton } from "../Commons/StyledBasedComponents"
export default function ConfigurationHomeAssistant({ endSection }) {

    const [serverUrl, setServerUrl] = useState("http://homeassistant.local:8123/api")
    const [token, setToken] = useState("")
    const [testResult, setTestResult] = useState("")
    const { t } = useLaravelReactI18n()

    const renderTestStep = () => {
        switch (testResult) {
            case "":
                return <>
                </>
            case "DOING":
                return <div className="w-44 overflow-hidden flex flex-col text-center">
                    <motion.div
                        className="size-6 bg-sky-500 rounded-full"
                        animate={{ x: [0, "150px", 0] }}
                        initial={{ x: 0 }}
                        transition={{
                            repeat: Infinity,
                            repeatType: "loop",
                            duration: 2,
                            ease: "linear",
                        }}
                    />


                    {t("Test in progress...")}

                </div>
            case "SUCCESS":
                return <div className="w-44 overflow-hidden items-center flex flex-col justify-center text-lime-600">
                    {getIcon("check", "size-8")}
                    {t("Test successful!")}
                </div>
            case "FAIL":
                return <div className="w-44 overflow-hidden items-center flex flex-col justify-center text-red-600">
                    {getIcon("error", "size-10")}
                    {t("Test failed...")}
                </div>
        }
    }

    const fetchHAConfiguration = async () => {
        const data = await apiFetch("/homeassistant")
        if (data) {
            setServerUrl(data.server_url)
            setToken(data.token)
        }
    }

    const testConnection = async () => {
        setTestResult("DOING")
        const data = await apiFetch("/homeassistant")
        const update = await apiFetch("/homeassistant", "PUT", { token: token, server_url: serverUrl })
        let result = "FAIL"
        if (update) {
            const dev = await apiFetch("/device?get_only_names=false")
            if (dev) {
                result = "SUCCESS"
            }
            else {
                await apiFetch("/homeassistant", "PUT", { token: data.token, server_url: data.server_url })
            }
        }
        setTimeout(function () {
            setTestResult(result)
        }, 2000);

    }


    useEffect(() => {
        fetchHAConfiguration()
    }, [])

    return (
        <div className="flex flex-col w-full gap-5 items-center justify-center">
            <div className="flex flex-row gap-2 items-center mt-5">

                {getIcon("homeassistant", "size-10 text-sky-500")}
                <h1 className="text-xl font-semibold">{t("Configure Home Assistant")}</h1>
            </div>
            <div className="flex flex-row gap-5 items-center">
                <div className="text-lg">

                    {t("Server Url")}
                </div>
                <TouchKeyboard2
                    inputValue={serverUrl}
                    className="w-[500px]"
                    id="serverurl"
                    value={serverUrl}
                    onChange={(e) => setServerUrl(e.target.value)} />
                <div className="size-8" />
            </div>

            <div className="flex flex-row gap-5 items-center">
                <div className="text-lg">

                    {t("Api Token")}
                </div>
                <TouchKeyboard2
                    inputValue={token}
                    className="w-[500px]"
                    id="token"
                    value={token}
                    onChange={(e) => setToken(e.target.value)} />

                {token.length < 183 ?
                    getIcon("error", "size-8 text-red-600") : getIcon("check", "size-8 text-lime-400")

                }
            </div>


            <StyledButton onClick={() => testConnection()}>
                {t("Try connection")}
            </StyledButton>

            {testResult != "" &&
                <>
                    <div className="flex flex-row gap-2 mt-10">
                        <div className="size-20 bg-lime-300" />
                        <div className="flex items-center">

                            {
                                renderTestStep()
                            }

                        </div>
                        {getIcon("homeassistant", "size-20 text-sky-500")}
                    </div>
                    <div className="flex flex-row gap-2">
                        <div className="w-20 text-center">
                            Digital Twin
                        </div>
                        <div className="w-44" />
                        <div className="w-20 text-center">
                            Home Assistant Server
                        </div>
                    </div>
                </>
            }

            {testResult == "SUCCESS" &&
                <div className='absolute bottom-0 right-0 w-fit flex py-5 justify-end px-2'>
                    <StyledButton className="size-min" onClick={()=>endSection()} >{t("Next")}{getIcon("arrow_right")}</StyledButton>
                </div>

            }
        </div>
    )
}