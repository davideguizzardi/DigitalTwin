import { LightPopup } from "./LightPopup"
import { MediaPlayerControl } from "./MediaPlayerPopup"
import { Modal } from "flowbite-react"
import { useState, useEffect, useContext } from "react"
import { getIcon } from "../Commons/Constants"
import { callService } from "../Commons/Constants"
import { UserContext } from "@/Layouts/UserLayout"
import ToastNotification from "../Commons/ToastNotification"
import { SwitchToggle } from "./SwitchToggle"

function ControlSelector({ device, user, errorFun }) {
  switch (device.device_class) {
    case "switch":
      return <SwitchToggle
        state={device.state == "on"}
        stateId={device.state_entity_id}
        user={user.username}
        setErrorFun={errorFun}
      />

    case "media_player":
      return <MediaPlayerControl selectedEntity={device.state_entity_id} />

    default: <>
    </>
      break
  }
}





export default function ControlPopup({ openDevice }) {
  const [device, setDevice] = useState({})
  const [open, setOpen] = useState(false)
  const [isError, setIsError] = useState(false)
  const user = useContext(UserContext)

  useEffect(() => {
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
      <Modal show={open} onClose={() => setOpen(false)} popup dismissible>
        <Modal.Header>
          <div className="flex flex-col ml-2">
            <div className="text-2xl font-semibold">{device.name}</div>
            <div className="font-thin text-base">{device.manufacturer}-{device.model}</div>
          </div>
        </Modal.Header>
        <Modal.Body>
          {device.list_of_entities &&

            <div className={"flex flex-row gap-4 items-center justify-end " + (device.state != "" ? "" : "col-span-2")}>
              {device.list_of_entities
                .filter(e => e.entity_id.startsWith('sensor') && e.entity_class != "energy")
                .sort((a, b) => a.entity_class > b.entity_class ? -1 : 1)
                .map((sensor, index) => (
                  <div className="flex flex-row gap-1 items-center" key={index}>
                    {getIcon(sensor.entity_class, "size-8")}
                    <span className="text-lg">

                      {sensor.state} {sensor.unit_of_measurement != undefined && sensor.unit_of_measurement}
                    </span>
                  </div>
                ))
              }
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