import { useState, useEffect, useContext } from "react";
import { callService, getIcon, apiFetch, backend } from "../Commons/Constants";
import { ConsumptionPredictionGraph } from "../Consumption/ConsumptionPredictionGraph";
import { ConsumptionPredictionGraphPower } from "../Consumption/ConsumptionPredictionGraphPower";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { DeviceContextRefresh } from "../ContextProviders/DeviceProviderRefresh";


function ActiveDevicesDropdown({ }) {
  const { t } = useLaravelReactI18n()
  const [open, setOpen] = useState(false)
  const { deviceList = [] } = useContext(DeviceContextRefresh);
  const [activeDevices, setActiveDevices] = useState([])


  useEffect(() => {
    const devs = deviceList
      .map(dev => {
        if (!dev.power_entity_id) return null;

        const power_entity = dev.list_of_entities?.find(e => e.entity_id === dev.power_entity_id);
        const current_power_state = power_entity?.state || "0";
        const current_power = parseFloat(current_power_state) || 0;

        if (current_power > 5) {
          return { ...dev, current_power };
        }
        return null;
      })
      .filter(Boolean);
    setActiveDevices(devs)
  }, [])

  return (
    <div className="flex flex-col w-full shadow-md">

      <div className="flex flex-row w-full py-4 px-2 items-center gap-2 rounded-md bg-zinc-100">
        <div className="w-4/5 flex flex-row gap-2 items-center">
          {getIcon("info")}

          {t("stop_devices")}
        </div>
        <div className="underline text-blue-700 hover:cursor-pointer w-1/5 items-end flex justify-end pr-2" onClick={() => setOpen(!open)}>{t("help")}</div>
      </div>
      {open &&

        <div className="flex flex-col bg-zinc-100 rounded-b-md">

          {activeDevices.map(dev => (
            <div className="flex flex-row gap-6 items-center p-2 bg-gray-200 rounded-md m-2">
              <div className="flex flex-row gap-2 items-center">
                {getIcon(dev.category, "size-8")}{dev.name}
              </div>
              <span className="capitalize">
                {t("power")}: {dev.current_power} W
              </span>
            </div>
          ))

          }
        </div>
      }
    </div>
  )
}



function ActiveAutomationsDropdown({ }) {
  const { t } = useLaravelReactI18n()
  const [open, setOpen] = useState(false)
  const { deviceList = [] } = useContext(DeviceContextRefresh);
  const [activeAutomations, setActiveAutomations] = useState([
    {
      "name": "Turn-on AC",
      "time": "16:00"
    },
    {
      "name": "Turn-on desktop when at Home",
      "time": "19:00"
    }
  ])

  return (
    <div className="flex flex-col w-full shadow-md">

      <div className="flex flex-row w-full py-4 px-2 items-center gap-2 rounded-md bg-zinc-100">
        <div className="w-4/5 flex flex-row gap-2 items-center">
          {getIcon("info")}

          {t("stop_automations")}
        </div>
        <div className="underline text-blue-700 hover:cursor-pointer w-1/5 items-end flex justify-end pr-2" onClick={() => setOpen(!open)}>{t("help")}</div>
      </div>
      {open &&

        <div className="flex flex-col bg-zinc-100 rounded-b-md">

          {activeAutomations.map(dev => (
            <div className="flex flex-row gap-6 items-center p-2 bg-gray-200 rounded-md my-1 mx-2">
              <div className="w-2/3">
                {dev.name}
              </div>

              <div className="flex flex-row gap-2 items-center w-1/3 justify-end">
                {getIcon("time", "size-7")}{dev.time}
              </div>

            </div>
          ))

          }
        </div>
      }
    </div>
  )
}

export function SwitchToggle({ state, stateId, devId, user, setErrorFun = {} }) {
  const [isOn, setIsOn] = useState(null);
  const [error, setError] = useState(false)
  const [actionOk, setActionOk] = useState(false)
  const [openGraph, setOpenGraph] = useState(true)
  const [service, setService] = useState(null)
  const { t } = useLaravelReactI18n()
  useEffect(() => { setIsOn(state) }, [state])

  useEffect(() => {
    if (error) {
      setOpenGraph(false)
      setIsOn(!isOn)
    }
    if (actionOk){
      setOpenGraph(false)
    }
  }, [error,actionOk])

  const handleClick = async () => {
    const service = isOn ? "turn_off" : "turn_on"
    const ret = await callService(stateId, service, {}, user)
    setIsOn(!isOn)
  }

  const handleClick2 = async () => {
    setService(isOn ? "turn_off" : "turn_on")
    setIsOn(!isOn)
  }

  return (
    <>
      {isOn != null &&
        <div className="flex flex-col w-full items-center gap-6">

          <div
            className={`relative flex items-center w-[60%] h-28 p-1 bg-gray-400 rounded-2xl cursor-pointer transition-colors ${isOn ? "bg-lime-500" : "bg-gray-400"
              }`}
            onClick={() => handleClick2()}
          >
            <div
              className={`size-24 bg-zinc-50 rounded-2xl shadow-xl flex items-center justify-center transition-transform duration-300 ${isOn ? "translate-x-[15.7rem]" : "translate-x-0"
                }`}
            >
              {getIcon(isOn ? "power_off" : "power_on", `size-12 text-sm ${isOn ? "text-lime-600" : "text-gray-600"}`)}
            </div>
          </div>
          <div className="w-full flex flex-col gap-0">

            {error &&
              <div className="bg-red-400 flex flex-row gap-2 items-center rounded-md p-2 w-full">
                {getIcon("warning", "size-8")}
                <div>
                  {t("possible_interruptions")}
                  <span className="underline text-blue-700 hover:cursor-pointer" onClick={() => setOpenGraph(!openGraph)}> {t("Why?")}</span>
                </div>

              </div>
            }
            {actionOk &&
              <div className="bg-lime-400 flex flex-row gap-2 items-center rounded-md p-2 w-full">
                {getIcon("info", "size-8")}
                <div>
                  {t("action_okay")}
                  <span className="underline text-blue-700 hover:cursor-pointer" onClick={() => setOpenGraph(!openGraph)}> {t("Why?")}</span>
                </div>

              </div>
            }
            {service &&
              <div className="w-full shadow-md rounded-b-md" hidden={!openGraph}>
                <ConsumptionPredictionGraphPower setOkFun={setActionOk} setErrorFun={setError} graphHeight={300} future_steps={60} url_in={`/prediction/power/${devId}/${service}`} />
                {error &&

                  <div className="flex flex-row items-center justify-center p-4 text-center">
                    {t("predicted_excessive")}
                  </div>
                }
                {actionOk &&

                  <div className="flex flex-row items-center justify-center p-4 text-center">
                    {t("action_okay_desc")}
                  </div>
                }
              </div>
            }
          </div>

          {error && !openGraph &&
            <div className="w-full flex flex-col items-start gap-2">
              <h1>{t("Suggestions")}</h1>
              <ActiveDevicesDropdown />
              <ActiveAutomationsDropdown />
            </div>

          }
        </div >
      }
    </>
  );

}