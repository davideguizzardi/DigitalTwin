import { Fragment, useContext, useEffect, useMemo, useState } from "react";
import dayjs from "dayjs";
import { Listbox, Transition } from "@headlessui/react";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { AnimatePresence, motion } from "framer-motion";

import { getIcon, apiFetch } from "@/Components/Commons/Constants";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";
import { DeviceContextRefresh } from "@/Components/ContextProviders/DeviceProviderRefresh";
import ToastNotification from "@/Components/Commons/ToastNotification";

const classNames = (...classes) => classes.filter(Boolean).join(" ");

const FancySelect = ({
  value,
  onChange,
  options,
  placeholder = "Select an option",
  disabled = false,
  className = "",
  noOptionsMessage = "No options available",
}) => {
  const hasRealOptions = Array.isArray(options) && options.length > 0;
  const displayOptions = hasRealOptions
    ? options
    : disabled
    ? []
    : [{ value: "__no_option__", label: noOptionsMessage, disabled: true }];
  const selectedOption = hasRealOptions
    ? options.find((option) => option.value === value)
    : undefined;

  return (
    <Listbox value={value} onChange={onChange} disabled={disabled}>
      {({ open }) => (
        <div className={classNames("relative", className)}>
          <Listbox.Button
            className={classNames(
              "automation-select",
              open && !disabled &&
                "border-sky-400 ring-4 ring-sky-200 dark:border-sky-400 dark:ring-sky-500/30",
              disabled && "automation-select-disabled",
              !selectedOption && "text-slate-400 dark:text-neutral-400"
            )}
          >
            <span className="truncate text-left">
              {selectedOption?.label ?? placeholder}
            </span>
            <ChevronDownIcon
              className={classNames(
                "size-5 shrink-0 transition-transform duration-200",
                open && !disabled
                  ? "rotate-180 text-sky-500 dark:text-sky-300"
                  : "text-slate-400 dark:text-neutral-500"
              )}
            />
          </Listbox.Button>

          <Transition
            as={Fragment}
            show={open && displayOptions.length > 0}
            enter="transition ease-out duration-150"
            enterFrom="opacity-0 -translate-y-1"
            enterTo="opacity-100 translate-y-0"
            leave="transition ease-in duration-100"
            leaveFrom="opacity-100 translate-y-0"
            leaveTo="opacity-0 -translate-y-1"
          >
            <Listbox.Options className="automation-select-options absolute left-0 z-30 w-full origin-top">
              {displayOptions.map((option) => (
                <Listbox.Option
                  key={`${option.value}`}
                  value={option.value}
                  disabled={option.disabled}
                  className={({ active, selected, disabled: optionDisabled }) =>
                    classNames(
                      "automation-select-option",
                      optionDisabled && "automation-select-option-disabled",
                      active && !optionDisabled && "automation-select-option-active",
                      selected && !optionDisabled && "automation-select-option-selected"
                    )
                  }
                >
                  {({ selected, disabled: optionDisabled }) => (
                    <div className="flex w-full items-center justify-between gap-2">
                      <span className="truncate">{option.label}</span>
                      {selected && !optionDisabled && (
                        <span className="text-sky-500 dark:text-sky-300">
                          {getIcon("check", "size-4")}
                        </span>
                      )}
                    </div>
                  )}
                </Listbox.Option>
              ))}
            </Listbox.Options>
          </Transition>
        </div>
      )}
    </Listbox>
  );
};

const iconByTriggerType = {
  date: "weekday",
  time: "time",
  device: "light",
};

const actionServiceLabels = {
  turn_on: "Turn on",
  turn_off: "Turn off",
};

const createId = () => Math.random().toString(36).slice(2, 9);

const createTrigger = (type = "date", devices = []) => ({
  id: createId(),
  type,
  value:
    type === "date"
      ? dayjs()
      : type === "time"
      ? dayjs()
      : { deviceId: devices[0]?.id ?? "", state: "on" },
});

const createAction = (devices = []) => ({
  id: createId(),
  deviceId: devices[0]?.id ?? "",
  service: "turn_on",
});

const buildDefaultTriggers = (devices) => [
  createTrigger("date", devices),
  createTrigger("time", devices),
];

const buildDefaultActions = (devices) => [createAction(devices)];

export default function AddAutomation() {
  const { deviceList = [] } = useContext(DeviceContextRefresh);

  // Build a connected devices list with extra metadata useful for state/commands
  const devices = useMemo(
    () =>
      deviceList
        .filter((d) => d?.show) // only visible/configured devices
        .filter((d) => (d?.state || "")?.toLowerCase() !== "unavailable") // only connected/available devices
        .map((device) => ({
          id: device.device_id,
          name: device.name || device.device_id,
          deviceClass: device.device_class,
          stateEntityId: device.state_entity_id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [deviceList]
  );

  const [automationName, setAutomationName] = useState("New automation");
  const [triggers, setTriggers] = useState(() => buildDefaultTriggers(devices));
  const [actions, setActions] = useState(() => buildDefaultActions(devices));
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [toastState, setToastState] = useState({ visible: false, type: "success", message: "" });

  const deviceSelectOptions = useMemo(
    () => devices.map((device) => ({ value: device.id, label: device.name })),
    [devices]
  );

  const showToast = (type, message) => {
    setToastState({ visible: true, type, message });
  };

  const hideToast = () => setToastState((prev) => ({ ...prev, visible: false }));

  // Map of deviceId -> array of service options [{value,label}]
  const [servicesByDevice, setServicesByDevice] = useState({});
  // Map of deviceId -> array of state options for triggers (fetched via API)
  const [statesByDevice, setStatesByDevice] = useState({});

  // Helper: possible states by device class
  const getStatesForClass = (deviceClass) => {
    switch (deviceClass) {
      case "light":
      case "switch":
      case "siren":
        return [
          { value: "on", label: "is on" },
          { value: "off", label: "is off" },
        ];
      case "media_player":
        return [
          { value: "playing", label: "is playing" },
          { value: "paused", label: "is paused" },
          { value: "idle", label: "is idle" },
          { value: "on", label: "is on" },
          { value: "off", label: "is off" },
        ];
      default:
        return [
          { value: "on", label: "is on" },
          { value: "off", label: "is off" },
        ];
    }
  };

  // Keep selections valid if device list changes (e.g., availability updates)
  useEffect(() => {
    if (!devices.length) return;
    setTriggers((prev) =>
      prev.map((t) => {
        if (t.type !== "device") return t;
        const exists = devices.some((d) => d.id === t.value.deviceId);
        if (exists) return t;
        const newId = devices[0]?.id ?? "";
        return {
          ...t,
          value: { deviceId: newId, state: "on" },
        };
      })
    );
    setActions((prev) =>
      prev.map((a) => {
        const exists = devices.some((d) => d.id === a.deviceId);
        if (exists) return a;
        const newId = devices[0]?.id ?? "";
        return { ...a, deviceId: newId, service: "turn_on" };
      })
    );
  }, [devices]);

  // Preload states for any currently selected device triggers
  useEffect(() => {
    const deviceIds = Array.from(new Set(triggers.filter(t => t.type === "device").map(t => t.value?.deviceId).filter(Boolean)));
    deviceIds.forEach((id) => { void ensureStatesForDevice(id); });
  }, [triggers, devices]);

  // Fetch available services/commands for a device's state entity
  const ensureServicesForDevice = async (deviceId) => {
    if (!deviceId) return null;
    if (servicesByDevice[deviceId]) return servicesByDevice[deviceId]; // already loaded
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev?.stateEntityId) return;
    const entity = await apiFetch(`/entity/${dev.stateEntityId}`);
    let options = [
      { value: "turn_on", label: "Turn on" },
      { value: "turn_off", label: "Turn off" },
    ];
    if (entity && entity.services && typeof entity.services === "object") {
      const keys = Object.keys(entity.services);
      if (keys.length) {
        options = keys
          .sort()
          .map((key) => ({ value: key, label: entity.services[key]?.name || key.replaceAll("_", " ") }));
      }
    }
    setServicesByDevice((prev) => ({ ...prev, [deviceId]: options }));
    return options;
  };

  // Build trigger state options from an entity's services/attributes
  const deriveStatesFromEntity = (entity) => {
    const options = [];
    const add = (value, label) => {
      if (!options.some((o) => o.value === value)) options.push({ value, label });
    };
    if (!entity) return [
      { value: "on", label: "is on" },
      { value: "off", label: "is off" },
    ];
    const services = entity.services || {};
    const entityId = entity.entity_id || "";
    const domain = entityId.split(".")[0];
    if ("turn_on" in services) add("on", "is on");
    if ("turn_off" in services) add("off", "is off");
    if (domain === "media_player") {
      if ("media_play" in services) add("playing", "is playing");
      if ("media_pause" in services) add("paused", "is paused");
      if ("media_stop" in services) add("idle", "is idle");
    }
    if (!options.length) {
      add("on", "is on");
      add("off", "is off");
    }
    return options;
  };

  // Ensure states for a given device (used in trigger UI)
  const ensureStatesForDevice = async (deviceId) => {
    if (!deviceId) return null;
    if (statesByDevice[deviceId]) return statesByDevice[deviceId];
    const dev = devices.find((d) => d.id === deviceId);
    if (!dev?.stateEntityId) {
      const fallback = [
        { value: "on", label: "is on" },
        { value: "off", label: "is off" },
      ];
      setStatesByDevice((prev) => ({ ...prev, [deviceId]: fallback }));
      return fallback;
    }
    const entity = await apiFetch(`/entity/${dev.stateEntityId}`);
    const options = deriveStatesFromEntity(entity);
    setStatesByDevice((prev) => ({ ...prev, [deviceId]: options }));
    return options;
  };

  // ──────────────────────────────────────────────────────────
  // Fancy confirmation state & helpers
  // ──────────────────────────────────────────────────────────
  const [confirmState, setConfirmState] = useState({
    open: false,
    title: "",
    message: "",
    confirmLabel: "Confirm",
    variant: /** @type {"danger" | "warning"} */ ("danger"),
    icon: "alert", // key for getIcon
    onConfirm: /** @type {null | (() => void)} */ (null),
  });

  const requestConfirmation = (
    message,
    action,
    options
  ) => {
    setConfirmState({
      open: true,
      title: options?.title ?? "Are you sure?",
      message,
      confirmLabel: options?.confirmLabel ?? "Confirm",
      variant: options?.variant ?? "danger",
      icon: options?.icon ?? "alert",
      onConfirm: action,
    });
  };

  const resolveConfirmation = (confirmed) => {
    setConfirmState((prev) => {
      if (confirmed && typeof prev.onConfirm === "function") prev.onConfirm();
      return { ...prev, open: false, onConfirm: null };
    });
  };

  const deviceNameLookup = useMemo(() => {
    const map = new Map(devices.map((device) => [device.id, device.name]));
    return (id) => map.get(id);
  }, [devices]);

  const triggerOptions = [
    { value: "date", label: "Date" },
    { value: "time", label: "Hour" },
    { value: "device", label: "Device state" },
  ];

  const actionOptions = [
    { value: "turn_on", label: "Turn on" },
    { value: "turn_off", label: "Turn off" },
  ];

  const pickerSx = {
    ".MuiInputBase-root": {
      height: "3rem",
      borderRadius: "0.75rem",
    },
    ".MuiOutlinedInput-notchedOutline": {
      borderRadius: "0.75rem",
    },
  };

  const selectContainerClass = "w-full md:max-w-[18rem]";

  const updateTrigger = (id, partial) => {
    if (saveError) setSaveError("");
    setTriggers((prev) => prev.map((trigger) => (trigger.id === id ? { ...trigger, ...partial } : trigger)));
  };

  const handleTriggerTypeChange = (id, type) => {
    if (saveError) setSaveError("");
    const nextValue =
      type === "date"
        ? dayjs()
        : type === "time"
        ? dayjs()
        : { deviceId: devices[0]?.id ?? "", state: "on" };
    updateTrigger(id, { type, value: nextValue });
  };

  const handleTriggerRemoval = (id) => {
    if (saveError) setSaveError("");
    setTriggers((prev) => {
      if (prev.length === 1) return prev;

      const target = prev.find((t) => t.id === id);
      const label = target ? formatTriggerPreview(target, deviceNameLookup) : "this condition";

      requestConfirmation(
        `You are about to remove “${label}”. This cannot be undone.`,
        () => setTriggers((p) => p.filter((t) => t.id !== id)),
        { title: "Remove condition", confirmLabel: "Yes, remove", variant: "danger", icon: "delete" }
      );

      return prev;
    });
  };

  const handleActionUpdate = (id, partial) => {
    if (saveError) setSaveError("");
    setActions((prev) => prev.map((action) => (action.id === id ? { ...action, ...partial } : action)));
  };

  const handleActionRemoval = (id) => {
    if (saveError) setSaveError("");
    setActions((prev) => {
      if (prev.length === 1) return prev;

      const target = prev.find((a) => a.id === id);
      const label = target ? formatActionPreview(target, deviceNameLookup) : "this action";

      requestConfirmation(
        `You are about to remove “${label}”. This cannot be undone.`,
        () => setActions((p) => p.filter((a) => a.id !== id)),
        { title: "Remove action", confirmLabel: "Yes, remove", variant: "danger", icon: "delete" }
      );

      return prev;
    });
  };

  const handleReset = () => {
    if (saveError) setSaveError("");
    requestConfirmation(
      "All conditions and actions will be reset to defaults.",
      () => {
        setTriggers(buildDefaultTriggers(devices));
        setActions(buildDefaultActions(devices));
      },
      { title: "Reset builder", confirmLabel: "Yes, reset", variant: "warning", icon: "refresh" }
    );
  };

  const renderTriggerInput = (trigger) => {
    return (
      <AnimatePresence mode="wait">
        {trigger.type === "date" && (
          <motion.div
            key="trigger-date"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <DatePicker
              value={trigger.value}
              onChange={(value) => updateTrigger(trigger.id, { value: value ?? trigger.value })}
              format="DD-MM-YYYY"
              sx={pickerSx}
            />
          </motion.div>
        )}

        {trigger.type === "time" && (
          <motion.div
            key="trigger-time"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
          >
            <TimePicker
              value={trigger.value}
              onChange={(value) => updateTrigger(trigger.id, { value: value ?? trigger.value })}
              format="HH:mm"
              sx={pickerSx}
            />
          </motion.div>
        )}

        {trigger.type === "device" && (
          <motion.div
            key="trigger-device"
            initial={{ opacity: 0, scale: 0.95, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="flex flex-col gap-3 md:flex-row md:items-center"
          >
            <FancySelect
              className={selectContainerClass}
              value={trigger.value.deviceId}
              onChange={async (newDeviceId) => {
                const opts = (await ensureStatesForDevice(newDeviceId)) || [
                  { value: "on", label: "is on" },
                  { value: "off", label: "is off" },
                ];
                const defaultState = opts[0]?.value || "on";
                updateTrigger(trigger.id, {
                  value: { ...trigger.value, deviceId: newDeviceId, state: defaultState },
                });
              }}
              options={deviceSelectOptions}
              placeholder={deviceSelectOptions.length ? "Select a device" : "No devices available"}
              disabled={!deviceSelectOptions.length}
              noOptionsMessage="No devices available"
            />
            <FancySelect
              className={selectContainerClass}
              value={trigger.value.state}
              onChange={(newState) =>
                updateTrigger(trigger.id, {
                  value: { ...trigger.value, state: newState },
                })
              }
              options={statesByDevice[trigger.value.deviceId] || []}
              placeholder={statesByDevice[trigger.value.deviceId] ? "Select a state" : "Loading states..."}
              disabled={!statesByDevice[trigger.value.deviceId]}
              noOptionsMessage="No states available"
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  const renderActionRow = (action) => (
    <motion.div
      key={action.id}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ type: "spring", stiffness: 220, damping: 20 }}
      className="relative flex flex-col gap-4 rounded-xl border border-neutral-300 bg-white p-4 shadow dark:border-neutral-700 dark:bg-neutral-900 md:flex-row md:items-center"
    >
      <div className={`flex w-full items-center gap-3 ${selectContainerClass}`}>
        <motion.div layout className="rounded-full bg-lime-100 p-3 text-lime-700 dark:bg-lime-500/20">
          {getIcon("puzzle", "size-6")}
        </motion.div>
        <FancySelect
          className="w-full"
          value={action.deviceId}
          onChange={async (newDeviceId) => {
            const opts = (await ensureServicesForDevice(newDeviceId)) || actionOptions;
            const nextService = opts[0]?.value || "turn_on";
            handleActionUpdate(action.id, { deviceId: newDeviceId, service: nextService });
          }}
          options={deviceSelectOptions}
          placeholder={deviceSelectOptions.length ? "Choose device" : "No devices available"}
          disabled={!deviceSelectOptions.length}
          noOptionsMessage="No devices available"
        />
      </div>
      <FancySelect
        className={selectContainerClass}
        value={action.service}
        onChange={(newService) => handleActionUpdate(action.id, { service: newService })}
        options={servicesByDevice[action.deviceId] || actionOptions}
        placeholder="Select action"
        noOptionsMessage="No actions available"
      />
      <StyledButton
        variant="delete"
        className="md:ml-auto"
        onClick={() => handleActionRemoval(action.id)}
        disabled={actions.length === 1}
      >
        {getIcon("delete", "size-5")}
      </StyledButton>
    </motion.div>
  );

  function formatTriggerPreview(trigger, deviceLookup) {
    if (trigger.type === "date") {
      return "On " + trigger.value.format("DD MMM YYYY");
    }
    if (trigger.type === "time") {
      return "At " + trigger.value.format("HH:mm");
    }
    const deviceName = deviceLookup(trigger.value.deviceId) || "Device";
    const opts = statesByDevice[trigger.value.deviceId] || [];
    const labelMap = new Map(opts.map((o) => [o.value, o.label.replace(/^is\s+/i, "")]));
    const stateLabel = labelMap.get(trigger.value.state) || trigger.value.state;
    return deviceName + " " + stateLabel;
  }

  function formatActionPreview(action, deviceLookup) {
    const deviceName = deviceLookup(action.deviceId) || "Device";
    const verb = actionServiceLabels[action.service] ?? action.service.replaceAll("_", " ");
    return verb + " " + deviceName;
  }

  const buildAutomationDefinition = () => {
    const errors = [];
    const alias = automationName.trim();
    if (!alias) {
      errors.push("Inserisci un nome per l'automazione.");
    }

    const triggerPayload = [];
    const dateFilters = [];

    triggers.forEach((trigger) => {
      if (trigger.type === "time") {
        const timeValue = dayjs(trigger.value);
        if (!timeValue.isValid()) {
          errors.push("Orario del trigger non valido.");
          return;
        }
        triggerPayload.push({ platform: "time", at: timeValue.format("HH:mm:ss") });
      } else if (trigger.type === "device") {
        const deviceId = trigger.value.deviceId;
        const targetState = trigger.value.state;
        if (!deviceId) {
          errors.push("Seleziona un dispositivo per tutte le condizioni dispositivo.");
          return;
        }
        const device = devices.find((d) => d.id === deviceId);
        if (!device?.stateEntityId) {
          errors.push("Il dispositivo selezionato non ha un'entità controllabile.");
          return;
        }
        triggerPayload.push({
          platform: "state",
          entity_id: device.stateEntityId,
          to: targetState,
        });
      } else if (trigger.type === "date") {
        const dateValue = dayjs(trigger.value);
        if (!dateValue.isValid()) {
          errors.push("Data del trigger non valida.");
          return;
        }
        dateFilters.push(dateValue.format("YYYY-MM-DD"));
      }
    });

    if (!triggerPayload.length) {
      errors.push("Aggiungi almeno un trigger temporale o di stato.");
    }

    const actionPayload = actions.reduce((acc, action) => {
      if (!action.deviceId) {
        errors.push("Seleziona un dispositivo per ogni azione.");
        return acc;
      }
      const device = devices.find((d) => d.id === action.deviceId);
      const entityId = device?.stateEntityId;
      const domain = entityId ? entityId.split(".")[0] : null;
      if (!entityId || !domain) {
        errors.push("Impossibile determinare l'entità per una delle azioni.");
        return acc;
      }
      const target = { entity_id: entityId };
      acc.push({
        service: `${domain}.${action.service}`,
        target,
        data: {},
      });
      return acc;
    }, []);

    if (!actionPayload.length) {
      errors.push("Aggiungi almeno un'azione valida.");
    }

    const conditions = [];
    if (dateFilters.length === 1) {
      conditions.push({
        condition: "template",
        value_template: `{{ now().date().isoformat() == '${dateFilters[0]}' }}`,
      });
    } else if (dateFilters.length > 1) {
      const allowedDates = dateFilters.map((date) => `'${date}'`).join(", ");
      conditions.push({
        condition: "template",
        value_template: `{{ now().date().isoformat() in [${allowedDates}] }}`,
      });
    }

    if (errors.length) {
      return { errors };
    }

    const automation = {
      id: `dt_${Date.now()}`,
      alias,
      trigger: triggerPayload,
      condition: conditions,
      action: actionPayload,
      mode: "single",
    };

    return { errors, automation };
  };

  const hideSaveError = () => setSaveError("");

  const handleSave = async () => {
    if (isSaving) return;
    const { errors, automation } = buildAutomationDefinition();
    if (errors && errors.length) {
      setSaveError(errors[0]);
      showToast("error", errors[0]);
      return;
    }

    hideSaveError();
    setIsSaving(true);

    try {
      const response = await apiFetch("/automation", "POST", { automation });
      if (!response) {
        throw new Error("Impossibile salvare l'automazione.");
      }

      let success = false;
      let message = "";

      if (Array.isArray(response) && response.length >= 2) {
        const raw = response[1];
        let payload;
        if (typeof raw === "string") {
          try {
            payload = JSON.parse(raw);
          } catch (err) {
            payload = { message: raw };
          }
        } else {
          payload = raw;
        }

        if (payload?.result === "ok") {
          success = true;
          message = "Automazione salvata con successo.";
        } else {
          message = payload?.message || "Salvataggio non riuscito.";
        }
      }

      if (!success) {
        throw new Error(message || "Salvataggio non riuscito.");
      }

      showToast("success", "Automazione salvata con successo.");
      setTimeout(() => {
        if (typeof route === "function") {
          window.location.href = route("automation");
        }
      }, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Salvataggio non riuscito.";
      setSaveError(message);
      showToast("error", message);
    } finally {
      setIsSaving(false);
    }
  };

  const hasExecutableTrigger = triggers.some((trigger) => {
    if (trigger.type === "time") return true;
    if (trigger.type === "device") return Boolean(trigger.value.deviceId && trigger.value.state);
    return false;
  });

  const hasValidAction = actions.some((action) => Boolean(action.deviceId));

  const canSave = automationName.trim().length > 0 && hasExecutableTrigger && hasValidAction;

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ToastNotification
        message={toastState.message}
        isVisible={toastState.visible}
        onClose={hideToast}
        type={toastState.type}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-screen w-full bg-gray-200 px-4 py-6 dark:bg-neutral-800"
      >
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
          <motion.section
            layout
            className="flex flex-col gap-6"
            transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
          >
            <motion.header
              layout
              initial={{ y: -12, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="flex flex-col items-start gap-3 rounded-xl bg-white p-6 shadow dark:bg-neutral-900"
            >
              <div className="flex items-center gap-3 text-lime-500">
                <motion.div layout className="rounded-full bg-lime-100 p-3 text-lime-600 dark:bg-lime-500/20">
                  {getIcon("puzzle", "size-7")}
                </motion.div>
                <div>
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">Create a new automation</h1>
                  <p className="text-base text-gray-600 dark:text-gray-300">
                    Choose when the automation should run and what it should do.
                  </p>
                </div>
              </div>
              <div className="mt-4 w-full max-w-md">
                <label
                  className="block text-sm font-medium text-gray-600 dark:text-gray-300"
                  htmlFor="automation-name"
                >
                  Automation name
                </label>
                <input
                  id="automation-name"
                  type="text"
                  maxLength={80}
                  value={automationName}
                  onChange={(event) => {
                    if (saveError) setSaveError("");
                    setAutomationName(event.target.value);
                  }}
                  placeholder="Name your automation"
                  className="mt-1 w-full rounded-xl border border-slate-200 bg-white/95 px-3 py-2 text-base font-medium text-slate-900 shadow-sm transition duration-150 ease-out focus:border-sky-400 focus:outline-none focus:ring-4 focus:ring-sky-200 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100 dark:focus:border-sky-400 dark:focus:ring-sky-500/30"
                />
              </div>
            </motion.header>

            <motion.section
              layout
              transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
              className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow dark:bg-neutral-900"
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">When</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Select the conditions that trigger your automation.
                </p>
              </div>

              <AnimatePresence initial={false}>
                {triggers.map((trigger) => (
                  <motion.div
                    key={trigger.id}
                    layout
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ type: "spring", stiffness: 220, damping: 20 }}
                    className="relative flex flex-col gap-4 rounded-xl border border-neutral-300 bg-white p-4 shadow dark:border-neutral-700 dark:bg-neutral-800 md:flex-row md:items-center"
                  >
                    <div className={`flex w-full items-center gap-3 ${selectContainerClass}`}>
                      <div className="rounded-full bg-lime-100 p-3 text-lime-700 dark:bg-lime-500/20">
                        {getIcon(iconByTriggerType[trigger.type], "size-6")}
                      </div>
                      <FancySelect
                        className="w-full"
                        value={trigger.type}
                        onChange={(newType) => handleTriggerTypeChange(trigger.id, newType)}
                        options={triggerOptions}
                        placeholder="Select type"
                      />
                    </div>

                    <motion.div layout className="flex-1">
                      {renderTriggerInput(trigger)}
                    </motion.div>

                    <StyledButton
                      variant="delete"
                      className="md:ml-auto"
                      onClick={() => handleTriggerRemoval(trigger.id)}
                      disabled={triggers.length === 1}
                    >
                      {getIcon("delete", "size-5")}
                    </StyledButton>
                  </motion.div>
                ))}
              </AnimatePresence>

              <div className="flex justify-end">
                <StyledButton
                  onClick={() => {
                    if (saveError) setSaveError("");
                    setTriggers((prev) => [...prev, createTrigger("date", devices)]);
                  }}
                  className="flex items-center gap-2"
                >
                  {getIcon("plus", "size-5")}
                  Add condition
                </StyledButton>
              </div>
            </motion.section>

            <motion.section
              layout
              transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
              className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow dark:bg-neutral-900"
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Then</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Pick the actions that will run when all conditions are met.
                </p>
              </div>

              <AnimatePresence initial={false}>{actions.map((action) => renderActionRow(action))}</AnimatePresence>

              <div className="flex justify-end">
                <StyledButton
                  onClick={() => {
                    if (saveError) setSaveError("");
                    setActions((prev) => [...prev, createAction(devices)]);
                  }}
                  className="flex items-center gap-2"
                >
                  {getIcon("plus", "size-5")}
                  Add action
                </StyledButton>
              </div>
            </motion.section>
          </motion.section>

          <motion.aside
            layout
            initial={{ x: 24, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.45, ease: "easeOut" }}
            className="flex h-fit flex-col gap-4 rounded-2xl bg-white p-6 shadow-xl dark:bg-neutral-900"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-indigo-100 p-3 text-indigo-600 dark:bg-indigo-500/20">
                {getIcon("info", "size-6")}
              </div>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Automation preview</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  This card updates live as you tweak conditions and actions.
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  When
                </h3>
                <motion.ul layout className="mt-2 space-y-2">
                  <AnimatePresence initial={false}>
                    {triggers.map((trigger) => (
                      <motion.li
                        key={"preview-trigger-" + trigger.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 200, damping: 18 }}
                        className="flex items-center gap-3 rounded-xl bg-gray-100/80 px-4 py-3 text-gray-800 dark:bg-neutral-800 dark:text-gray-200"
                      >
                        <span className="text-lime-500">{getIcon(iconByTriggerType[trigger.type], "size-5")}</span>
                        <span className="text-sm font-medium">{formatTriggerPreview(trigger, deviceNameLookup)}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </div>

              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  Then
                </h3>
                <motion.ul layout className="mt-2 space-y-2">
                  <AnimatePresence initial={false}>
                    {actions.map((action) => (
                      <motion.li
                        key={"preview-action-" + action.id}
                        layout
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ type: "spring", stiffness: 200, damping: 18 }}
                        className="flex items-center gap-3 rounded-xl bg-gray-100/80 px-4 py-3 text-gray-800 dark:bg-neutral-800 dark:text-gray-200"
                      >
                        <span className="text-sky-500">{getIcon("power", "size-5")}</span>
                        <span className="text-sm font-medium">{formatActionPreview(action, deviceNameLookup)}</span>
                      </motion.li>
                    ))}
                  </AnimatePresence>
                </motion.ul>
              </div>

              <motion.div
                layout
                className="rounded-xl bg-gradient-to-r from-lime-200 via-emerald-200 to-sky-200 p-4 text-gray-900 dark:from-lime-500/20 dark:via-emerald-500/20 dark:to-sky-500/20 dark:text-gray-100"
              >
                <p className="text-sm font-semibold uppercase tracking-wide">Live preview</p>
                <p className="mt-2 text-sm leading-relaxed">
                  Once you complete this wizard the automation will trigger based on the timeline above and execute the selected actions.
                </p>
              </motion.div>

              <motion.div
                layout
                className="mt-4 flex flex-wrap items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={handleReset}
                  className="rounded-lg bg-red-400 px-5 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  Reset
                </button>
                <button
                  type="button"
                  disabled
                  className="rounded-lg bg-amber-300 px-5 py-2 text-sm font-semibold text-gray-800 opacity-60 shadow transition focus:outline-none focus:ring-2 focus:ring-amber-200 disabled:cursor-not-allowed"
                >
                  Simulate
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !canSave}
                  className={`rounded-lg px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-lime-200 ${
                    isSaving || !canSave
                      ? "bg-lime-400 text-gray-900 opacity-60 shadow disabled:cursor-not-allowed"
                      : "bg-lime-400 text-gray-900 shadow hover:bg-lime-500"
                  }`}
                >
                  {isSaving ? "Saving..." : "Save"}
                </button>
              </motion.div>
              {saveError && (
                <p className="text-center text-sm font-medium text-red-500">{saveError}</p>
              )}
            </div>
          </motion.aside>
        </div>
      </motion.div>

      {/* ───────── Confirmation Dialog ───────── */}
      <AnimatePresence>
        {confirmState.open && (
          <motion.div
            key="confirm-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm"
            onClick={() => resolveConfirmation(false)}
            aria-hidden="true"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {confirmState.open && (
          <motion.div
            key="confirm-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="confirm-title"
            initial={{ opacity: 0, scale: 0.96, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -6 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="fixed inset-0 z-[61] flex items-center justify-center p-4"
            onKeyDown={(e) => {
              if (e.key === "Escape") resolveConfirmation(false);
              if (e.key === "Enter") resolveConfirmation(true);
            }}
          >
            <div className="w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xl dark:border-neutral-700 dark:bg-neutral-900">
              <div className="flex items-start gap-4">
                <div
                  className={
                    confirmState.variant === "danger"
                      ? "rounded-xl bg-red-100 p-3 text-red-600 dark:bg-red-500/20"
                      : "rounded-xl bg-amber-100 p-3 text-amber-700 dark:bg-amber-500/20"
                  }
                >
                  {getIcon(confirmState.icon, "size-6")}
                </div>
                <div className="flex-1">
                  <h3 id="confirm-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {confirmState.title}
                  </h3>
                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{confirmState.message}</p>

                  <div className="mt-5 flex flex-wrap justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => resolveConfirmation(false)}
                      className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium text-gray-800 shadow-sm transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-neutral-300 dark:border-neutral-600 dark:text-gray-100 dark:hover:bg-neutral-800"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveConfirmation(true)}
                      className={
                        confirmState.variant === "danger"
                          ? "rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-300"
                          : "rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-gray-900 shadow transition hover:bg-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
                      }
                    >
                      {confirmState.confirmLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </LocalizationProvider>
  );
}
