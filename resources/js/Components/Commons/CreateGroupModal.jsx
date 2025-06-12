import { useState, useEffect } from "react";
import { Modal } from "flowbite-react";
import { useLaravelReactI18n } from "laravel-react-i18n";
import { StyledButton } from "./StyledBasedComponents";
import { TouchKeyboard2 } from "./TouchKeyboard2";
import { apiFetch } from "./Constants";

export function CreateGroupModal({ show, setShow, handleRoomCreation, group = null }) {
  const [groupName, setGroupName] = useState('');
  const { t } = useLaravelReactI18n();

  // Initialize the name field when editing an existing group
  useEffect(() => {
    if (group && show) {
      setGroupName(group.name);
    } else if (!show) {
      setGroupName('');
    }
  }, [group, show]);

  const handleCancel = () => {
    setGroupName('');
    setShow(false);
  };

  const handleSubmit = async () => {
    if (group) {
      // Update mode
      const response = await apiFetch(`/group/${group.id}`, "PATCH", { new_name: groupName });
      if (response) {
        setGroupName('');
        handleRoomCreation();
      }
    } else {
      // Create mode
      const response = await apiFetch("/group", "PUT", { data: [{ name: groupName }] });
      if (response) {
        setGroupName('');
        handleRoomCreation();
      }
    }
  };

  return (
    <Modal size={"xl"} show={show} onClose={handleCancel} popup>
      <Modal.Header>
        {group ? t("Edit group") : t("Add a new group")}
      </Modal.Header>
      <Modal.Body>
        <div className="block">
          <label htmlFor="group_name" className="block text-sm font-medium text-gray-700 mb-2">
            {t("Name")}
          </label>
          <TouchKeyboard2
            forceOpen={true}
            id="group_name"
            type="text"
            inputValue={groupName}
            onChange={(e) => setGroupName(e.target.value)}
          />
          <div className="h-52" />
        </div>
      </Modal.Body>
      <Modal.Footer>
        <div className="flex justify-between gap-2 p-4 w-full">
          <StyledButton variant="secondary" onClick={handleCancel}>
            {t("Cancel")}
          </StyledButton>
          <StyledButton variant="primary" onClick={handleSubmit}>
            {group ? t("Update") : t("Add")}
          </StyledButton>
        </div>
      </Modal.Footer>
    </Modal>
  );
}
