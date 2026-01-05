// Import React primitives used across the automation builder component
import { Fragment, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
// Import dayjs to handle date and time values consistently
import dayjs from "dayjs";
// Import Headless UI components for building an accessible custom select widget
import { Listbox, Transition } from "@headlessui/react";
// Import the MUI localization provider to wrap date and time pickers
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
// Import the dayjs adapter so MUI pickers work with the dayjs library
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
// Import the MUI DatePicker component for selecting dates
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
// Import the MUI TimePicker component for selecting times
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
// Import the Chevron icon used in dropdown buttons
import { ChevronDownIcon, Bars3Icon } from "@heroicons/react/20/solid";
// Import animation utilities from Framer Motion for smooth UI transitions
import { AnimatePresence, motion, Reorder, useDragControls } from "framer-motion";

// Import shared helpers for icons and API calls
import { getIcon, apiFetch } from "@/Components/Commons/Constants";
// Import a styled button component used throughout the page
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";
// Import the device context that lets the page refresh device data
import { DeviceContextRefresh } from "@/Components/ContextProviders/DeviceProviderRefresh";
// Import the toast notification component for feedback messages
import ToastNotification from "@/Components/Commons/ToastNotification";

// Utility helper to concatenate conditional class names
const classNames = (...classes) => classes.filter(Boolean).join(" ");

// FancySelect component renders a reusable select input with custom styling
const FancySelect = ({
  // Selected value for the select control
  value,
  // Callback triggered when the selection changes
  onChange,
  // Available options presented in the dropdown
  options,
  // Placeholder text shown when no option is selected
  placeholder = "Select an option",
  // Flag to disable the interaction
  disabled = false,
  // Additional class names for custom styling
  className = "",
  // Fallback message when there are no options
  noOptionsMessage = "No options available",
}) => {
  // Figure out if the component received a useful options list
  const hasRealOptions = Array.isArray(options) && options.length > 0;
  // Provide either the options, an empty array, or a synthetic message option
  const displayOptions = hasRealOptions
    ? options
    : disabled
    ? []
    : [{ value: "__no_option__", label: noOptionsMessage, disabled: true }];
  // Find the currently selected option object if it exists
  const selectedOption = hasRealOptions
    ? options.find((option) => option.value === value)
    : undefined;

  // Render the Listbox component as the custom select
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

// Map each trigger type to the icon used in the UI list
const iconByTriggerType = {
  date: "weekday",
  time: "time",
  device: "light",
};

// Human readable labels for the core service actions we support
const actionServiceLabels = {
  turn_on: "Turn on",
  turn_off: "Turn off",
};

// Helper used for generating stable ids for triggers/actions
const createId = () => Math.random().toString(36).slice(2, 9);

// Build an initial trigger for the chosen type, defaulting to the first device if needed
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

// Build an action skeleton pointing to the first available device
const createAction = (devices = []) => ({
  id: createId(),
  deviceId: devices[0]?.id ?? "",
  service: "turn_on",
});

// Utility to check if two ordered lists of items share the same id sequence
const haveSameOrder = (current, next) => {
  if (!Array.isArray(current) || !Array.isArray(next)) return false;
  if (current.length !== next.length) return false;
  for (let index = 0; index < current.length; index += 1) {
    if (!current[index] || !next[index] || current[index].id !== next[index].id) {
      return false;
    }
  }
  return true;
};

// Render a draggable trigger card with a dedicated handle and smooth animations
const TriggerItem = ({
  trigger,
  iconByTriggerType,
  getTriggerOptionsFor,
  onTriggerTypeChange,
  renderTriggerInput,
  onRemove,
  selectContainerClass,
  canDelete,
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={trigger}
      drag="y"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 26,
        layout: { type: "spring", stiffness: 300, damping: 28 },
      }}
      dragControls={dragControls}
      dragListener={false}
      whileDrag={{
        scale: 0.99,
        boxShadow: "0 24px 55px rgba(15, 23, 42, 0.18)",
      }}
      className="relative flex flex-col gap-4 rounded-xl border border-neutral-300 bg-white p-4 shadow dark:border-neutral-700 dark:bg-neutral-800 md:flex-row md:items-center"
    >
      <div className={`flex w-full items-center gap-3 ${selectContainerClass}`}>
        <button
          type="button"
          aria-label="Reorder condition"
          onPointerDown={(event) => {
            event.preventDefault();
            dragControls.start(event);
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-transparent bg-gray-100 text-gray-500 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:ring-sky-500/40 cursor-grab active:cursor-grabbing"
        >
          <Bars3Icon className="size-5" />
        </button>
        <div className="shrink-0 rounded-full bg-lime-100 p-3 text-lime-700 dark:bg-lime-500/20">
          {getIcon(iconByTriggerType[trigger.type], "size-6")}
        </div>
        <FancySelect
          className="w-full"
          value={trigger.type}
          onChange={(newType) => onTriggerTypeChange(trigger.id, newType)}
          options={getTriggerOptionsFor(trigger)}
          placeholder="Select type"
        />
      </div>

      <motion.div layout className="flex-1">
        {renderTriggerInput(trigger)}
      </motion.div>

      <StyledButton
        variant="delete"
        className="md:ml-auto"
        onClick={() => onRemove(trigger.id)}
        disabled={!canDelete}
      >
        {getIcon("delete", "size-5")}
      </StyledButton>
    </Reorder.Item>
  );
};

// Render a draggable action card with a reorder handle and existing controls
const ActionItem = ({
  action,
  deviceSelectOptions,
  ensureServicesForDevice,
  actionOptions,
  onActionUpdate,
  servicesByDevice,
  onActionRemove,
  selectContainerClass,
  actionsLength,
}) => {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={action}
      drag="y"
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{
        type: "spring",
        stiffness: 240,
        damping: 26,
        layout: { type: "spring", stiffness: 300, damping: 28 },
      }}
      dragControls={dragControls}
      dragListener={false}
      whileDrag={{
        scale: 0.99,
        boxShadow: "0 24px 55px rgba(15, 23, 42, 0.18)",
      }}
      className="relative flex flex-col gap-4 rounded-xl border border-neutral-300 bg-white p-4 shadow dark:border-neutral-700 dark:bg-neutral-900 md:flex-row md:items-center"
    >
      <div className={`flex w-full items-center gap-3 ${selectContainerClass}`}>
        <button
          type="button"
          aria-label="Reorder action"
          onPointerDown={(event) => {
            event.preventDefault();
            dragControls.start(event);
          }}
          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-transparent bg-gray-100 text-gray-500 transition hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-300 dark:bg-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200 dark:focus:ring-sky-500/40 cursor-grab active:cursor-grabbing"
        >
          <Bars3Icon className="size-5" />
        </button>
        <motion.div layout className="shrink-0 rounded-full bg-lime-100 p-3 text-lime-700 dark:bg-lime-500/20">
          {getIcon("puzzle", "size-6")}
        </motion.div>
        <FancySelect
          className="w-full"
          value={action.deviceId}
          onChange={async (newDeviceId) => {
            const opts = (await ensureServicesForDevice(newDeviceId)) || actionOptions;
            const nextService = opts[0]?.value || "turn_on";
            onActionUpdate(action.id, { deviceId: newDeviceId, service: nextService });
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
        onChange={(newService) => onActionUpdate(action.id, { service: newService })}
        options={servicesByDevice[action.deviceId] || actionOptions}
        placeholder="Select action"
        noOptionsMessage="No actions available"
      />
      <StyledButton
        variant="delete"
        className="md:ml-auto"
        onClick={() => onActionRemove(action.id)}
        disabled={actionsLength === 1}
      >
        {getIcon("delete", "size-5")}
      </StyledButton>
    </Reorder.Item>
  );
};

// Default triggers include a date and time control to give the user a starting point
const buildDefaultTriggers = (devices) => [
  createTrigger("date", devices),
  createTrigger("time", devices),
];

// Default action is just a "turn on" for the first available device
const buildDefaultActions = (devices) => [createAction(devices)];

const DEFAULT_AUTOMATION_NAME = "New automation";

export default function AddAutomation() {
  // Grab the list of devices from the refreshable context
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

  // Core builder state: automation name, trigger/action arrays and async flags
  const [automationName, setAutomationName] = useState(DEFAULT_AUTOMATION_NAME);
  const [triggers, setTriggers] = useState(() => buildDefaultTriggers(devices));
  const [actions, setActions] = useState(() => buildDefaultActions(devices));
  const [isSaving, setIsSaving] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [saveError, setSaveError] = useState("");
  // Toast and simulation feedback state containers
  const [toastState, setToastState] = useState({ visible: false, type: "success", message: "", duration: 3000 });
  const [simulationResult, setSimulationResult] = useState(null);

  // Memoize dropdown-ready device options to avoid recalculations on each render
  const deviceSelectOptions = useMemo(
    () => devices.map((device) => ({ value: device.id, label: device.name })),
    [devices]
  );

  // Ref keeps track of the current toast dismissal timeout
  const toastTimerRef = useRef(null);

  // Toast helpers keep a single timer alive so progress and fade stay in sync.
  const hideToast = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
    setToastState((prev) => (prev.visible ? { ...prev, visible: false, message: "" } : prev));
  }, []);

  const showToast = useCallback((type, message, duration = 3200) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastState({ visible: true, type, message, duration });
    toastTimerRef.current = window.setTimeout(() => {
      hideToast();
    }, duration);
  }, [hideToast]);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  // Reset simulation feedback whenever the configuration changes.
  const invalidateSimulation = () => {
    setSimulationResult((prev) => (prev ? null : prev));
  };

  const dateUsed = useMemo(() => triggers.some((trigger) => trigger.type === "date"), [triggers]);
  const timeUsed = useMemo(() => triggers.some((trigger) => trigger.type === "time"), [triggers]);

  // Allow only one "Date" and one "Hour" option to remain available across triggers.
  const getTriggerOptionsFor = (currentTrigger) =>
    triggerOptions.filter((option) => {
      if (option.value === "date" && dateUsed && currentTrigger.type !== "date") return false;
      if (option.value === "time" && timeUsed && currentTrigger.type !== "time") return false;
      return true;
    });

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

    setTriggers((prev) => {
      let mutated = false;
      const next = prev.map((t) => {
        if (t.type !== "device") return t;
        const exists = devices.some((d) => d.id === t.value.deviceId);
        if (exists) return t;
        mutated = true;
        const newId = devices[0]?.id ?? "";
        return {
          ...t,
          value: { deviceId: newId, state: "on" },
        };
      });
      return mutated ? next : prev;
    });

    setActions((prev) => {
      let mutated = false;
      const next = prev.map((a) => {
        const exists = devices.some((d) => d.id === a.deviceId);
        if (exists) return a;
        mutated = true;
        const newId = devices[0]?.id ?? "";
        return { ...a, deviceId: newId, service: "turn_on" };
      });
      return mutated ? next : prev;
    });
  }, [devices]);

  const triggerDeviceIds = useMemo(() => {
    const ids = triggers
      .filter((trigger) => trigger.type === "device")
      .map((trigger) => trigger.value?.deviceId)
      .filter(Boolean);
    return Array.from(new Set(ids)).sort();
  }, [triggers]);

  const triggerDeviceIdsKey = useMemo(() => triggerDeviceIds.join("|"), [triggerDeviceIds]);

  // Preload states for any currently selected device triggers
  useEffect(() => {
    if (!triggerDeviceIds.length) return;
    triggerDeviceIds.forEach((id) => {
      void ensureStatesForDevice(id);
    });
  }, [triggerDeviceIdsKey, devices]);

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

  // Quick lookup helper to translate device ids to readable names
  const deviceNameLookup = useMemo(() => {
    const map = new Map(devices.map((device) => [device.id, device.name]));
    return (id) => map.get(id);
  }, [devices]);

  // Trigger types visually shown in the condition builder
  const triggerOptions = [
    { value: "date", label: "Date" },
    { value: "time", label: "Hour" },
    { value: "device", label: "Device state" },
  ];

  // Fallback action options until we fetch device-specific services
  const actionOptions = [
    { value: "turn_on", label: "Turn on" },
    { value: "turn_off", label: "Turn off" },
  ];

  // Shared MUI styling tweaks for date/time pickers
  const pickerSx = {
    ".MuiInputBase-root": {
      height: "3rem",
      borderRadius: "0.75rem",
    },
    ".MuiOutlinedInput-notchedOutline": {
      borderRadius: "0.75rem",
    },
  };

  // CSS helper applied to several select wrappers for consistent widths
  const selectContainerClass = "w-full md:max-w-[18rem]";

  // Trigger update helper ensures we centralise error resets and simulation invalidations
  const updateTrigger = (id, partial) => {
    if (saveError) setSaveError("");
    invalidateSimulation();
    setTriggers((prev) => prev.map((trigger) => (trigger.id === id ? { ...trigger, ...partial } : trigger)));
  };

  // Handle changing trigger type while preserving limits and resetting default values
  const handleTriggerTypeChange = (id, type) => {
    if (saveError) setSaveError("");
    invalidateSimulation();
    // Block switching to Date/Hour when the quota has already been used elsewhere.
    if (
      (type === "date" && triggers.some((trigger) => trigger.id !== id && trigger.type === "date")) ||
      (type === "time" && triggers.some((trigger) => trigger.id !== id && trigger.type === "time"))
    ) {
      return;
    }
    const nextValue =
      type === "date"
        ? dayjs()
        : type === "time"
        ? dayjs()
        : { deviceId: devices[0]?.id ?? "", state: "on" };
    updateTrigger(id, { type, value: nextValue });
  };

  // Remove a trigger after user confirmation, keeping at least one
  const handleTriggerRemoval = (id) => {
    if (saveError) setSaveError("");
    invalidateSimulation();
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

  // Reorder triggers when dragged using the dedicated handle
  const handleTriggerReorder = useCallback(
    (nextOrder) => {
      if (haveSameOrder(triggers, nextOrder)) return;
      if (saveError) setSaveError("");
      invalidateSimulation();
      setTriggers([...nextOrder]);
    },
    [invalidateSimulation, saveError, triggers]
  );

  // Update an action with the provided partial data
  const handleActionUpdate = (id, partial) => {
    if (saveError) setSaveError("");
    invalidateSimulation();
    setActions((prev) => prev.map((action) => (action.id === id ? { ...action, ...partial } : action)));
  };

  // Remove an action after user confirmation, keeping at least one
  const handleActionRemoval = (id) => {
    if (saveError) setSaveError("");
    invalidateSimulation();
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

  // Reorder actions when dragged via their handle
  const handleActionReorder = useCallback(
    (nextOrder) => {
      if (haveSameOrder(actions, nextOrder)) return;
      if (saveError) setSaveError("");
      invalidateSimulation();
      setActions([...nextOrder]);
    },
    [actions, invalidateSimulation, saveError]
  );

  // Reset the entire builder back to defaults after confirmation
  const handleReset = () => {
    if (saveError) setSaveError("");
    invalidateSimulation();
    requestConfirmation(
      "All conditions and actions will be reset to defaults.",
      () => {
        setTriggers(buildDefaultTriggers(devices));
        setActions(buildDefaultActions(devices));
        setAutomationName(DEFAULT_AUTOMATION_NAME);
        setSimulationResult(null);
        setIsSimulating(false);
      },
      { title: "Reset builder", confirmLabel: "Yes, reset", variant: "danger", icon: "refresh" }
    );
  };

  // Render the right-side input block for a trigger based on its type
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

  // Produce a readable string describing the trigger for previews and confirmations
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

  // Produce a readable string describing an action in the preview list
  function formatActionPreview(action, deviceLookup) {
    const deviceName = deviceLookup(action.deviceId) || "Device";
    const verb = actionServiceLabels[action.service] ?? action.service.replaceAll("_", " ");
    return verb + " " + deviceName;
  }

  // Turn API suggestions into readable bullet points
  const describeSuggestion = (suggestion) => {
    if (!suggestion || typeof suggestion !== "object") return "Suggestion available.";
    switch (suggestion.suggestion_type) {
      case "better_activation": {
        const time = suggestion.new_activation_time?.slice(0, 5) ?? "";
        const saved = typeof suggestion.monthly_saved_money === "number"
          ? `${suggestion.monthly_saved_money.toFixed(2)} €`
          : null;
        return saved
          ? `Try moving the activation to ${time} to save about ${saved} per month.`
          : `Try moving the activation to ${time}.`;
      }
      case "conflict_time_change": {
        const times = Array.isArray(suggestion.new_activation_time)
          ? suggestion.new_activation_time.join(" or ")
          : suggestion.new_activation_time;
        return `Move the activation to ${times} to resolve the conflict.`;
      }
      case "conflict_deactivate_automations": {
        const list = Array.isArray(suggestion.automations_list)
          ? suggestion.automations_list.join(", ")
          : "other automations";
        return `Consider disabling the following automations: ${list}.`;
      }
      case "conflict_split_automation":
        return "Consider splitting the automation into multiple actions.";
      default:
        return suggestion.description || "Additional suggestion available.";
    }
  };

  // Convert conflict payloads from the simulator into a concise description
  const describeConflict = (conflict) => {
    if (!conflict || typeof conflict !== "object") return "Conflict detected.";
    if (conflict.type === "Excessive energy consumption") {
      const days = Array.isArray(conflict.days) ? conflict.days.join(", ") : "";
      return `Excessive energy consumption above ${conflict.threshold} W between ${conflict.start} and ${conflict.end}${
        days ? ` (${days})` : ""
      }.`;
    }
    if (conflict.type === "Not feasible automation") {
      return `Automation not feasible with the current limit (${conflict.threshold}).`;
    }
    return conflict.description || conflict.message || conflict.type || "Conflict detected.";
  };

  // Map the UI model to the payload expected by the automation API.
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

    // Prevent contradictory states for the same device within the triggers list.
    const deviceStateMap = new Map();
    triggers
      .filter((trigger) => trigger.type === "device")
      .forEach((trigger) => {
        const deviceId = trigger.value.deviceId;
        const desiredState = trigger.value.state;
        if (!deviceId) return;
        if (deviceStateMap.has(deviceId) && deviceStateMap.get(deviceId) !== desiredState) {
          // Same device appears with conflicting states; block creation.
          errors.push("Il medesimo dispositivo ha stati in conflitto nelle condizioni.");
        }
        deviceStateMap.set(deviceId, desiredState);
      });

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

  // Clear any persisted save error message
  const hideSaveError = () => setSaveError("");

  // Persist the automation by posting to the backend API
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

  // Run the automation through the simulation endpoint to get predictions/suggestions
  const handleSimulate = async () => {
    if (isSimulating) return;
    const { errors, automation } = buildAutomationDefinition();
    if (errors && errors.length) {
      setSaveError(errors[0]);
      showToast("error", errors[0]);
      return;
    }

    setSaveError("");
    setIsSimulating(true);
    invalidateSimulation();

    try {
      const response = await apiFetch("/automation/simulate", "POST", { automation });
      if (!response) {
        throw new Error("Simulation failed.");
      }

      const suggestions = Array.isArray(response.suggestions) ? response.suggestions : [];
      const conflicts = Array.isArray(response.conflicts) ? response.conflicts : [];
      const stats = response.automation || {};

      setSimulationResult({
        suggestions,
        conflicts,
        stats: {
          monthlyCost: stats.monthly_cost ?? null,
          minCost: stats.minimum_cost_per_run ?? null,
          maxCost: stats.maximum_cost_per_run ?? null,
          energyConsumption: stats.energy_consumption ?? null,
          averagePower: stats.average_power_drawn ?? null,
        },
      });

      const message = conflicts.length
        ? "Simulation complete: conflicts detected."
        : suggestions.length
        ? "Simulation complete with optimisation tips."
        : "Simulation complete with no reported issues.";
      showToast(conflicts.length ? "error" : "success", message);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Simulation failed.";
      setSimulationResult(null);
      showToast("error", message);
    } finally {
      setIsSimulating(false);
    }
  };

  // Derived booleans drive button enable/disable state for UX clarity
  const hasExecutableTrigger = triggers.some((trigger) => {
    if (trigger.type === "time") return true;
    if (trigger.type === "device") return Boolean(trigger.value.deviceId && trigger.value.state);
    return false;
  });

  // Ensure at least one action has a real device before enabling save/simulate
  const hasValidAction = actions.some((action) => Boolean(action.deviceId));

  // Final guard that drives primary CTA availability
  const canSave = automationName.trim().length > 0 && hasExecutableTrigger && hasValidAction;

  // Main layout renders the builder columns and preview cards
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      {/* Toast stays mounted at root level to handle cross-section feedback */}
      <ToastNotification
        message={toastState.message}
        isVisible={toastState.visible}
        onClose={hideToast}
        type={toastState.type}
        duration={toastState.duration}
      />
      {/* Main builder canvas provides animated layout transitions */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="min-h-screen w-full bg-gray-200 px-4 py-6 dark:bg-neutral-800"
      >
        <div className="mx-auto grid w-full max-w-[1200px] gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.55fr)]">
          {/* Left column groups the configuration flow (header, triggers, actions) */}
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
                  invalidateSimulation();
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

              <Reorder.Group
                axis="y"
                values={triggers}
                onReorder={handleTriggerReorder}
                className="flex flex-col gap-4"
              >
                {triggers.map((trigger) => (
                  <TriggerItem
                    key={trigger.id}
                    trigger={trigger}
                    iconByTriggerType={iconByTriggerType}
                    getTriggerOptionsFor={getTriggerOptionsFor}
                    onTriggerTypeChange={handleTriggerTypeChange}
                    renderTriggerInput={renderTriggerInput}
                    onRemove={handleTriggerRemoval}
                    selectContainerClass={selectContainerClass}
                    canDelete={triggers.length > 1}
                  />
                ))}
              </Reorder.Group>

              <div className="flex justify-end">
                <StyledButton
                  onClick={() => {
                    if (saveError) setSaveError("");
                    invalidateSimulation();
                    setTriggers((prev) => {
                      const hasDate = prev.some((trigger) => trigger.type === "date");
                      const hasTime = prev.some((trigger) => trigger.type === "time");
                      const nextType = !hasDate ? "date" : !hasTime ? "time" : "device";
                      return [...prev, createTrigger(nextType, devices)];
                    });
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

              <Reorder.Group
                axis="y"
                values={actions}
                onReorder={handleActionReorder}
                className="flex flex-col gap-4"
              >
                {actions.map((action) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    deviceSelectOptions={deviceSelectOptions}
                    ensureServicesForDevice={ensureServicesForDevice}
                    actionOptions={actionOptions}
                    onActionUpdate={handleActionUpdate}
                    servicesByDevice={servicesByDevice}
                    onActionRemove={handleActionRemoval}
                    selectContainerClass={selectContainerClass}
                    actionsLength={actions.length}
                  />
                ))}
              </Reorder.Group>

              <div className="flex justify-end">
                <StyledButton
                  onClick={() => {
                    if (saveError) setSaveError("");
                    invalidateSimulation();
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

          {/* Right column hosts the live preview, simulation feedback, and CTA buttons */}
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

              {/* Simulation summary area flips between loading, conflicts, suggestions, and metrics */}
              <motion.div
                layout
                className="rounded-xl border border-slate-200 bg-white/95 p-4 text-gray-900 shadow dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-100"
              >
                <div className="flex items-center gap-2">
                  <span className="text-sky-500">{getIcon("info", "size-5")}</span>
                  <p className="text-sm font-semibold uppercase tracking-wide">Simulation feedback</p>
                </div>
                {isSimulating ? (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">Running simulation...</p>
                ) : simulationResult ? (
                  <div className="mt-3 space-y-3">
                    {simulationResult.conflicts?.length ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                        <p className="flex items-center gap-2 font-semibold">
                          <span>{getIcon("warning", "size-5")}</span>
                          Detected conflicts
                        </p>
                        <ul className="mt-2 space-y-1">
                          {simulationResult.conflicts.map((conflict, index) => (
                            <li key={`conflict-${index}`} className="flex items-start gap-2">
                              <span className="mt-1 text-red-500">{getIcon("dot", "size-3")}</span>
                              <span>{describeConflict(conflict)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-lime-200 bg-lime-50 p-3 text-sm text-lime-700 dark:border-lime-500/40 dark:bg-lime-500/10 dark:text-lime-200">
                        <p className="flex items-center gap-2 font-semibold">
                          <span>{getIcon("check", "size-5")}</span>
                          No conflicts detected
                        </p>
                        <p className="mt-1 text-sm">The model did not report blocking issues.</p>
                      </div>
                    )}

                    {simulationResult.suggestions?.length > 0 && (
                      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200">
                        <p className="flex items-center gap-2 font-semibold">
                          <span>{getIcon("light", "size-5")}</span>
                          Model suggestions
                        </p>
                        <ul className="mt-2 space-y-1">
                          {simulationResult.suggestions.map((suggestion, index) => (
                            <li key={`suggestion-${index}`} className="flex items-start gap-2">
                              <span className="mt-1 text-sky-500">{getIcon("dot", "size-3")}</span>
                              <span>{describeSuggestion(suggestion)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {simulationResult.stats && (
                      <div className="grid gap-2 rounded-lg border border-slate-200 bg-white/80 p-3 text-xs text-gray-600 dark:border-neutral-700 dark:bg-neutral-900/80 dark:text-gray-300 sm:grid-cols-2">
                        {simulationResult.stats.energyConsumption != null && (
                          <span>
                            Estimated energy: {typeof simulationResult.stats.energyConsumption === "number"
                              ? simulationResult.stats.energyConsumption.toFixed(2)
                              : simulationResult.stats.energyConsumption} kWh
                          </span>
                        )}
                        {simulationResult.stats.averagePower != null && (
                          <span>
                            Average power: {typeof simulationResult.stats.averagePower === "number"
                              ? simulationResult.stats.averagePower.toFixed(2)
                              : simulationResult.stats.averagePower} W
                          </span>
                        )}
                        {simulationResult.stats.minCost != null && (
                          <span>
                            Minimum cost per run: {typeof simulationResult.stats.minCost === "number"
                              ? simulationResult.stats.minCost.toFixed(3)
                              : simulationResult.stats.minCost} €
                          </span>
                        )}
                        {simulationResult.stats.maxCost != null && (
                          <span>
                            Maximum cost per run: {typeof simulationResult.stats.maxCost === "number"
                              ? simulationResult.stats.maxCost.toFixed(3)
                              : simulationResult.stats.maxCost} €
                          </span>
                        )}
                        {simulationResult.stats.monthlyCost != null && (
                          <span>
                            Estimated monthly cost: {typeof simulationResult.stats.monthlyCost === "number"
                              ? simulationResult.stats.monthlyCost.toFixed(2)
                              : simulationResult.stats.monthlyCost} €
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    Run the simulation to preview potential issues and optimisation tips.
                  </p>
                )}
              </motion.div>

              <motion.div
                layout
                className="mt-4 flex flex-nowrap items-center justify-center gap-3"
              >
                <button
                  type="button"
                  onClick={handleReset}
                  className="flex items-center gap-2 rounded-lg bg-red-400 px-5 py-2 text-sm font-semibold text-black shadow transition hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-300"
                >
                  {getIcon("refresh", "size-5 text-red-700")}
                  Reset
                </button>
                <button
                  type="button"
                  onClick={handleSimulate}
                  disabled={isSimulating || !canSave}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-amber-200 ${
                    isSimulating || !canSave
                      ? "bg-amber-300 text-black shadow opacity-60 cursor-not-allowed"
                      : "bg-amber-400 text-black shadow hover:bg-amber-500"
                  }`}
                >
                  {getIcon("play", "size-5 text-amber-700")}
                  {isSimulating ? "Simulating..." : "Simulate"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isSaving || !canSave}
                  className={`flex items-center gap-2 rounded-lg px-5 py-2 text-sm font-semibold transition focus:outline-none focus:ring-2 focus:ring-lime-200 ${
                    isSaving || !canSave
                      ? "bg-lime-300 text-black shadow opacity-60 cursor-not-allowed"
                      : "bg-lime-400 text-black shadow hover:bg-lime-500"
                  }`}
                >
                  {getIcon("save", "size-5 text-lime-700")}
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
