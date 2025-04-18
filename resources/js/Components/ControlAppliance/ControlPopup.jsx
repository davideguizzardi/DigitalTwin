import { LightPopup } from "./LightPopup"
import { MediaPlayerControl } from "./MediaPlayerPopup"
import { Modal } from "flowbite-react"
import { useState, useEffect, useContext } from "react"
import { getIcon, backend } from "../Commons/Constants"
import { callService } from "../Commons/Constants"
import { UserContext } from "@/Layouts/UserLayout"
import ToastNotification from "../Commons/ToastNotification"
import { SwitchToggle } from "./SwitchToggle"
import { useLaravelReactI18n } from "laravel-react-i18n"
import { ConsumptionPredictionGraph } from "../Consumption/ConsumptionPredictionGraph"

function ControlSelector({ device, user, errorFun }) {
  switch (device.device_class) {
    case "switch":
      return <SwitchToggle
        state={device.state == "on"}
        stateId={device.state_entity_id}
        devId={device.device_id}
        user={user.username}
        setErrorFun={errorFun}
      />

    case "media_player":
      return <MediaPlayerControl
        selectedEntity={device.state_entity_id}
        user={user.username}
        setErrorFun={errorFun}

      />

    case "light":
      return <LightPopup
        selectedEntity={device.state_entity_id}
        user={user.username}
        setErrorFun={errorFun}
      />

    default: <>

    </>
      break
  }
}





export default function ControlPopup({ openDevice }) {
  const [device, setDevice] = useState({})
  const [open, setOpen] = useState(false)
  const [isError, setIsError] = useState(false)
  const [deviceAutomations, setDeviceAutomations] = useState([])
  const user = useContext(UserContext)
  const { t } = useLaravelReactI18n()


  useEffect(() => {
    const fetchAutomationContext = async () => {
      const response = await fetch(`${backend}/automation?get_suggestions=false`)
      if (response.ok) {
        const result = await response.json()
        const devAutomations = result.filter(a => a.action.some(action => action.device_id == openDevice.device_id))
        setDeviceAutomations(devAutomations)
      }
    }
    if (Object.keys(openDevice).length > 0) {
      fetchAutomationContext()
    }
  }, [openDevice])

  useEffect(() => {//TODO:remove this
    if (openDevice.device_id == "73f90a95e5dba7d52e5ad10517b1dec6" || openDevice.device_id == "60eb315bfa05ddf285ce4bf519497d3e") {
      openDevice.state = "off"
    }
    setDevice(openDevice)
    setOpen(Object.keys(openDevice).length > 0)
  }, [openDevice]);


  const errorFun = () => {
    setOpen(false)
    setIsError(true)
  }
  return (
    <>
      <ToastNotification message={"Some error occurred while trying to change device state..."} isVisible={isError} onClose={() => setIsError(false)} type="error" />
      <Modal show={open} onClose={() => { setOpen(false); setDevice({}) }} popup dismissible>
        <Modal.Header>
          <div className="flex flex-col ml-2">
            <div className="text-2xl font-semibold">{device.name}</div>
            <div className="font-thin text-base">{device.manufacturer}-{device.model}</div>
          </div>
        </Modal.Header>
        <Modal.Body>
          <div className="-ml-2 font-light font-[Inter]">
            {t("Room")}: <span className="font-semibold">{t(device.map_data ? device.map_data.room? device.map_data.room:t("No room") : t("No room"))}</span>
          </div>
          <div className="-ml-2 flex flex-row gap-4 items-center mb-2">
            <div className="font-light font-[Inter]">

              {t("State")}: <span className="font-semibold">{t(device.state)}</span>
            </div>

            {device.list_of_entities &&

              <div className="flex flex-row gap-4 items-center justify-end ">
                {device.list_of_entities
                  .filter(e => e.entity_id.startsWith('sensor') && e.entity_class != "energy")
                  .sort((a, b) => a.entity_class > b.entity_class ? -1 : 1)
                  .map((sensor, index) => (
                    <div className="flex flex-row gap-1 items-center" key={index}>
                      {getIcon(sensor.entity_class, "size-7")}
                      <span className="text-lg">

                        {sensor.state} {sensor.unit_of_measurement != undefined && sensor.unit_of_measurement}
                      </span>
                    </div>
                  ))
                }
              </div>
            }
          </div>
          {deviceAutomations.length > 0 &&

            <div className="flex flex-col w-full -ml-2">
              <span className="font-light font-[Inter]">{t("Automations")}:{" "}
                {deviceAutomations.map((automation, index) => (
                  <span key={automation.id}>
                    <a className="underline text-blue-500" href={route("automation", { id: automation.id })}>
                      {automation.name}
                    </a>
                    {index < deviceAutomations.length - 1 ? ", " : "."}
                  </span>
                ))}
              </span>
            </div>
          }

        </Modal.Body>
        <Modal.Footer>

          <div className="flex flex-row items-center w-full justify-center">
            <ControlSelector device={device} user={user} errorFun={errorFun} />
          </div>

        </Modal.Footer>
      </Modal>
    </>
  )
}