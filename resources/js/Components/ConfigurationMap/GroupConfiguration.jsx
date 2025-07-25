import { useState, useEffect, useContext } from "react";
import { Table } from "flowbite-react";
import { apiFetch, getIcon } from "../Commons/Constants";
import { StyledButton } from "../Commons/StyledBasedComponents";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { CreateGroupModal } from "../Commons/CreateGroupModal";

export function GroupConfiguration({ }) {
    const [groups, setGroups] = useState([])
    const [show, setShow] = useState(false)
    const [groupToEdit, setGroupToEdit] = useState(null)
    const { t } = useLaravelReactI18n()

    const fetchGroup = async () => {
        const data = await apiFetch("/group");
        if (data && data.length > 0) {
            setGroups(data);
        }
    };

    const handleGroupDeletion = async (group_id) => {
        const response = await apiFetch(`/group/${group_id}`, "DELETE")
        if (response) {
            fetchGroup()
        }
    }

    const handleGroupCreation = async () => {
        fetchGroup()
        setShow(false)
        setGroupToEdit(null)
    }

    useEffect(() => {
        fetchGroup()
    }, [])

    return (
        <div className="xl:w-full 2xl:w-3/4 px-2 flex flex-col gap-4 mb-4 overflow-auto h-[80vh]">
            <CreateGroupModal show={show} setShow={setShow} group={groupToEdit} handleRoomCreation={() => handleGroupCreation()} />
            <div className="flex flex-col gap-1 bg-zinc-50 rounded-md mt-6 mx-6">
                <div className="flex flex-col gap-1 divide-y">
                    {(groups || [])
                        .map((group) => (
                            <>
                                <div className="flex flex-row items-center justify-between py-2">
                                    <span className="text-lg text-gray-600">
                                        {group.name}
                                    </span>
                                    <div className="flex flex-row gap-4">
                                        <StyledButton onClick={() => { setGroupToEdit(group); setShow(true) }}>
                                            {getIcon("edit")}
                                        </StyledButton>
                                        <StyledButton variant="delete" onClick={() => handleGroupDeletion(group.id)}>
                                            {getIcon("delete")}
                                        </StyledButton>
                                    </div>
                                </div>
                            </>
                        ))}
                </div>
                <div className="flex flex-col items-center">

                    <StyledButton className="w-fit" onClick={() => setShow(true)}>
                        {getIcon("plus")}{t("Add a new group")}
                    </StyledButton>
                </div>
            </div>

        </div>
    )
}