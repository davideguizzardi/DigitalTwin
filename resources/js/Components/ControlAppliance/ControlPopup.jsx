import { LightPopup } from "./LightPopup"
import { MediaPlayerControl } from "./MediaPlayerPopup"
import { DropdownDivider, DropdownItem, Modal, ModalFooter } from "flowbite-react"
import { useState, useEffect, useContext } from "react"
import { getIcon, backend, apiFetch, DevicesTypes, getDeviceIcon } from "../Commons/Constants"
import { callService } from "../Commons/Constants"
import { UserContext } from "@/Layouts/UserLayout"
import ToastNotification from "../Commons/ToastNotification"
import { SwitchToggle } from "./SwitchToggle"
import { useLaravelReactI18n } from "laravel-react-i18n"
import { StyledButton } from "../Commons/StyledBasedComponents"
import { TouchKeyboard2 } from "../Commons/TouchKeyboard2"
import { Dropdown } from "flowbite-react"
import { CreateGroupModal } from "../Commons/CreateGroupModal"



function ControlSelector({ device, user, errorFun, refreshDevice }) {
  switch (device.device_class) {
    case "switch":
      return <SwitchToggle
        state={device.state == "on"}
        stateId={device.state_entity_id}
        devId={device.device_id}
        user={user.username}
        setErrorFun={errorFun}
        refreshDevice={refreshDevice}
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
        refreshDevice={refreshDevice}
      />

    case "siren":
      return <SwitchToggle
        state={device.state == "on"}
        stateId={device.state_entity_id}
        devId={device.device_id}
        user={user.username}
        setErrorFun={errorFun}
        refreshDevice={refreshDevice}
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
  const [deviceGroups, setDeviceGroups] = useState([])
  const user = useContext(UserContext)
  const { t } = useLaravelReactI18n()

  const [editMode, setEditMode] = useState(false)
  const [groupsList, setGroupsList] = useState([])

  const [showGroupAdd, setShowGroupAdd] = useState(false)

  const fetchGroupContext = async () => {
    const response = await apiFetch(`/device-group/device/${openDevice.device_id}`)
    if (response) {
      setDeviceGroups(response)
    }
  }

  useEffect(() => {
    const fetchAutomationContext = async () => {
      const response = await apiFetch("/automation?get_suggestions=false")
      if (response) {
        const devAutomations = response.filter(a => a.action.some(action => action.device_id == openDevice.device_id))
        setDeviceAutomations(devAutomations)
      }
    }

    if (Object.keys(openDevice).length > 0) {
      fetchAutomationContext()
      fetchGroupContext()
    }
  }, [openDevice])

  useEffect(() => {
    setDevice(openDevice)
    setOpen(Object.keys(openDevice).length > 0)
  }, [openDevice]);

  const refreshDevice = async () => {
    const id = openDevice.device_id;
    await new Promise(resolve => setTimeout(resolve, 1000));
    const updated_dev = await apiFetch(`/device/${id}`);
    if (updated_dev) {
      setDevice(updated_dev);
    }
  };

  const fetchGroups = async () => {
    const response = await apiFetch("/group");
    if (response) {
      setGroupsList(response);
    }
  };

  const handleRoomCreation = async () => {
    fetchGroups()
    setShowGroupAdd(false)
  }

  const handleDeviceGroupAddition = async (group_id) => {
    const response = await apiFetch("/device-group", "PUT", { data: [{ device_id: openDevice.device_id, group_id: group_id }] })
    if (response) {
      //TODO:ADD log
      fetchGroupContext()
    }
  }

  const deleteDeviceGroup = async (group_id) => {
    const response = await apiFetch(`/device-group/${openDevice.device_id}/${group_id}`, "DELETE")
    if (response) {
      //TODO:ADD log
      fetchGroupContext()
    }
  }


  useEffect(() => {
    if (editMode) {
      fetchGroups();
    }
  }, [editMode]);

  const handleConfigurationSubmit = async () => {
    const body = {
      data: [{
        device_id: device.device_id,
        name: device.name,
        category: device.category,
        show: device.show ? 1 : 0,
      }]
    }
    const response = await apiFetch("/device_configuration", "PUT", body)
    if (response) {
      setEditMode(false)
      if (user)
        apiLog(user.username, logsEvents.CONFIGURATION_DEVICE, "", JSON.stringify(body))
    } else {
      alert(t("Some error occurred"))
    }
  }



  const errorFun = () => {
    setOpen(false)
    setIsError(true)
  }
  return (
    <>
      <ToastNotification message={"Some error occurred while trying to change device state..."} isVisible={isError} onClose={() => setIsError(false)} type="error" />
      <CreateGroupModal show={showGroupAdd} setShow={setShowGroupAdd} handleRoomCreation={() => handleRoomCreation()} />

      <Modal show={open} onClose={() => { setOpen(false); setDevice({}); setEditMode(false) }} popup>
        <Modal.Header className="items-center justify-between ">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-col ml-2">
              <div className="font-thin text-sm">
                {device.manufacturer} - {device.model}
              </div>
              <div className="text-2xl font-semibold">{device.name}</div>
            </div>
            {!editMode &&
              <StyledButton
                variant="secondary"
                className="rounded-full p-0 size-fit ml-auto"
                onClick={() => setEditMode(!editMode)}
              >
                {getIcon("gear", "size-5")}
              </StyledButton>
            }
          </div>
        </Modal.Header>

        {editMode ?
          <>
            <Modal.Body>
              <div className="flex flex-col !w-full gap-10">

                <div className="block">
                  {t("Name")}
                  <TouchKeyboard2
                    inputValue={device.name}
                    onChange={(e) => setDevice({ ...device, name: e.target.value })}
                    id="device_name"
                    type="text"
                  />
                </div>
                <div className="block">
                  {t("Category")}
                  <div className="shadow-md w-fit rounded-md p-1 bg-gray-50 border">

                    <Dropdown
                      placement="bottom"
                      id="category" inline={true}

                      label={
                        <span className="flex items-center gap-2 w-64">
                          {getIcon(device.category, "size-8")}
                          <span>{t(device.category)}</span>
                        </span>
                      }
                    >
                      <div className="max-h-40 overflow-y-auto w-64">

                        {Object.keys(DevicesTypes).map((icon) => (
                          <DropdownItem
                            onClick={() => setDevice({ ...device, category: icon })}
                            key={icon}
                            className="flex items-center gap-2">
                            {getIcon(icon, "size-8")}
                            <span>{t(icon)}</span>
                          </DropdownItem>
                        ))}
                      </div>
                    </Dropdown>
                  </div>
                </div>
                <div className="flex flex-col gap-4">
                  {t("Groups")}
                  <div className="grid grid-cols-4 grid-flow-row gap-4">
                    {deviceGroups.map(group => (
                      <div className="bg-zinc-100 rounded-md items-center flex justify-between p-2">
                        {group.name}
                        <div className="cursor-pointer" onClick={() => deleteDeviceGroup(group.group_id)}>
                          {getIcon("close")}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="shadow-md w-fit rounded-md p-1 bg-gray-50 border">
                    <Dropdown
                      inline={true}
                      label={
                        <span className="flex items-center gap-2 w-64 ">
                          {t("Add device to a group")}
                        </span>
                      }
                    >
                      <div className="max-h-40 overflow-y-auto w-64">

                        {groupsList
                          .filter(g => g && !deviceGroups.some(dg => dg.group_id === g.id))
                          .map(group => (
                            <DropdownItem key={group.group_id} onClick={() => handleDeviceGroupAddition(group.id)}>
                              {group.name}
                            </DropdownItem>
                          ))}



                        <DropdownDivider />
                        <DropdownItem onClick={() => setShowGroupAdd(true)}>
                          {getIcon("plus", "size-5 mr-2")}
                          <span>{t("Add new group...")}</span>
                        </DropdownItem>
                      </div>
                    </Dropdown>
                  </div>
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div className="flex flex-row items-center justify-between w-full">

                <StyledButton variant="primary" onClick={() => setEditMode(false)}>
                  {t("Cancel")}
                </StyledButton>


                <StyledButton variant="secondary" onClick={() => handleConfigurationSubmit()}>
                  {t("Update")}
                </StyledButton>
              </div>
            </Modal.Footer>
          </>

          :
          <>
            <Modal.Body>
              <div className="flex flex-col gap-4">
                <div className="-ml-2 font-light font-[Inter]">
                  {t("Room")}: <span className="font-semibold">{t(device.map_data ? device.map_data.room ? device.map_data.room : t("No Room") : t("No Room"))}</span>
                </div>
                <div className="-ml-2 font-light font-[Inter]">
                  {t("Groups")}:
                  {device.groups && device.groups.length > 0 ?

                    <div className="grid grid-cols-4 grid-flow-row gap-4">
                      {device.groups.map(group => (
                        <div className="bg-zinc-100 rounded-md items-center flex justify-center p-2">
                          {group.name}
                        </div>
                      ))}
                    </div>
                    :
                    <span className="font-semibold">
                      {t("No groups")}
                    </span>
                  }
                </div>
                <div className="-ml-2 flex flex-col gap-4 items-start mb-2">
                  {device.state &&

                    <div className="font-light font-[Inter]">
                      {t("State")}: <span className="font-semibold">{t(device.state)}</span>
                    </div>
                  }


                  {device.list_of_entities && device.list_of_entities.length > 0 &&
                    <div className="flex flex-col w-full font-light font-[Inter]">
                      <div className="grid grid-cols-4 gap-2 w-full">
                        {device.list_of_entities
                          .filter(e => (!e.entity_id.startsWith(device.device_class) && e.entity_class != "energy") || e.entity_id.startsWith("sensor"))
                          .sort((a, b) => a.entity_class < b.entity_class ? -1 : 1)
                          .map((sensor, index) => (
                            <div className="flex flex-col gap-1 items-start bg-zinc-50 rounded-md shadow-md p-2" key={index}>
                              <div className="flex flex-row gap-1 items-center">
                                {getIcon(sensor.entity_class, "size-5")}
                                <span className="text-sm capitalize">
                                  {sensor.name.trim().split(" ").map(el => (t(el))).join(" ")}
                                </span>
                              </div>
                              <div className="text-base flex justify-end w-full ">
                                {t(sensor.state)} {sensor.unit_of_measurement != undefined && sensor.unit_of_measurement}
                              </div>
                            </div>
                          ))
                        }
                      </div>

                    </div>
                  }
                  {deviceAutomations.length > 0 &&

                    <div className="flex flex-col w-full">
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
                </div>
              </div>
            </Modal.Body>
            <Modal.Footer>

              <div className="flex flex-row items-center w-full justify-center">
                <ControlSelector device={device} user={user} errorFun={errorFun} refreshDevice={refreshDevice} />
              </div>

            </Modal.Footer>
          </>
        }
      </Modal>
    </>
  )
}