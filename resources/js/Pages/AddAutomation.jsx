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
import { useLaravelReactI18n } from "laravel-react-i18n";

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
            <Listbox.Options className="automation-select-options absolute left-0 z-30 min-w-full origin-top">
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
                    <div className="flex w-full items-start justify-between gap-2">
                      <span className="min-w-0 flex-1 whitespace-normal break-words text-left">{option.label}</span>
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
  toggle: "Toggle",
  start: "Start",
  pause: "Pause",
  stop: "Stop",
  return_to_base: "Return to base",
  clean_spot: "Clean spot",
  locate: "Locate",
  set_fan_speed: "Set fan speed",
  send_command: "Send command",
};

// Helper used for generating stable ids for triggers/actions
const createId = () => Math.random().toString(36).slice(2, 9);

const COMMANDABLE_ENTITY_DOMAINS = new Set([
  "button",
  "climate",
  "cover",
  "fan",
  "humidifier",
  "input_boolean",
  "light",
  "lock",
  "media_player",
  "number",
  "scene",
  "script",
  "select",
  "siren",
  "switch",
  "vacuum",
]);

const ROBOT_SCRIPT_ENTITY_PATTERN = /^script\.qrevo_(.+)_(aspira|lava|entrambi)$/;
const ROBOT_ACTION_MODES = ["aspira", "lava", "entrambi"];

const parseRobotScriptEntity = (entityId = "") => {
  const match = entityId.match(ROBOT_SCRIPT_ENTITY_PATTERN);
  if (!match) return null;
  return {
    room: match[1],
    mode: match[2],
    entityId,
  };
};

const isRobotScriptEntity = (entityId = "") => Boolean(parseRobotScriptEntity(entityId));

const isRobotTarget = (target) => {
  if (!target) return false;
  const targetText = [
    target.name,
    target.stateEntityId,
    ...(target.entities || []).map((entity) => entity?.entity_id || entity?.id),
  ].filter(Boolean).join(" ").toLowerCase();
  return targetText.includes("qrevo") || targetText.includes("robot");
};

const formatRobotRoomName = (room = "") =>
  room
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");

const normalizeActionData = (data) => {
  if (!data || typeof data !== "object") return {};
  return Object.keys(data)
    .sort()
    .reduce((acc, key) => {
      if (data[key] !== undefined && data[key] !== null && data[key] !== "") {
        acc[key] = data[key];
      }
      return acc;
    }, {});
};

const makeActionDataKey = (data) => {
  const normalized = normalizeActionData(data);
  return Object.keys(normalized).length ? encodeURIComponent(JSON.stringify(normalized)) : "";
};

const parseActionDataKey = (dataKey) => {
  if (!dataKey) return {};
  try {
    return JSON.parse(decodeURIComponent(dataKey));
  } catch {
    return {};
  }
};

const makeActionValue = (entityId, service, data = {}) => {
  const dataKey = makeActionDataKey(data);
  const base = `${entityId || ""}::${service || ""}`;
  return dataKey ? `${base}::${dataKey}` : base;
};

const parseActionValue = (value) => {
  const [entityId, service, dataKey] = `${value || ""}`.split("::");
  return {
    entityId,
    service,
    data: parseActionDataKey(dataKey),
  };
};

const getEntityName = (entity) =>
  entity?.attributes?.friendly_name ||
  entity?.name ||
  entity?.entity_id?.split(".").slice(1).join(".").replaceAll("_", " ") ||
  entity?.entity_id ||
  "Entity";

const getEntityIdsForTarget = (target) => {
  const ids = [
    target?.stateEntityId,
    ...(target?.entities || []).map((entity) => entity?.entity_id || entity?.id),
  ].filter(Boolean);
  return Array.from(new Set(ids));
};

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
  entityId: devices[0]?.stateEntityId ?? "",
  service: "turn_on",
  data: {},
  robotMode: "aspira",
  robotRooms: [],
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
  t,
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
      className="relative grid gap-4 rounded-xl border border-neutral-300 bg-white p-4 shadow dark:border-neutral-700 dark:bg-neutral-800 xl:grid-cols-[auto_minmax(0,1fr)_auto] xl:items-center"
    >
      <div className="flex min-w-0 items-center gap-3">
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
          className="min-w-0 flex-1 xl:w-56 xl:flex-none"
          value={trigger.type}
          onChange={(newType) => onTriggerTypeChange(trigger.id, newType)}
          options={getTriggerOptionsFor(trigger)}
          placeholder={t("Select type")}
        />
      </div>

      <motion.div layout className="min-w-0">
        {renderTriggerInput(trigger)}
      </motion.div>

      <StyledButton
        variant="delete"
        className="justify-self-end"
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
  robotTargetIds,
  robotRoomActions,
  ensureServicesForDevice,
  actionOptions,
  onActionUpdate,
  servicesByDevice,
  onActionRemove,
  selectContainerClass,
  actionsLength,
  t,
}) => {
  const dragControls = useDragControls();
  const isRobotAction = robotTargetIds.has(action.deviceId);
  const robotModeOptions = ROBOT_ACTION_MODES.map((mode) => ({
    value: mode,
    label: t(mode),
  }));
  const selectedActionValue = makeActionValue(action.entityId, action.service, action.data);
  const currentActionOptions =
    servicesByDevice[action.deviceId] ||
    actionOptions.map((option) => ({
      ...option,
      value: makeActionValue(action.entityId, option.value, option.data),
      entityId: action.entityId,
      service: option.value,
      data: option.data || {},
    }));

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
      className="relative grid gap-4 rounded-xl border border-neutral-300 bg-white p-4 shadow dark:border-neutral-700 dark:bg-neutral-900 xl:grid-cols-[minmax(14rem,20rem)_minmax(0,1fr)_auto] xl:items-start"
    >
      <div className="flex min-w-0 items-center gap-3">
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
          className="min-w-0 flex-1"
          value={action.deviceId}
          onChange={async (newDeviceId) => {
            if (robotTargetIds.has(newDeviceId)) {
              onActionUpdate(action.id, {
                deviceId: newDeviceId,
                entityId: "",
                service: "",
                data: {},
                robotMode: action.robotMode || "aspira",
                robotRooms: [],
              });
              return;
            }
            const opts = (await ensureServicesForDevice(newDeviceId)) || currentActionOptions;
            const nextOption = opts.find((option) => !option.disabled) || opts[0];
            const parsed = parseActionValue(nextOption?.value);
            onActionUpdate(action.id, {
              deviceId: newDeviceId,
              entityId: nextOption?.entityId || parsed.entityId,
              service: nextOption?.service || parsed.service || "turn_on",
              data: nextOption?.data || parsed.data || {},
              robotRooms: [],
            });
          }}
          options={deviceSelectOptions}
          placeholder={deviceSelectOptions.length ? t("Choose device") : t("No devices available")}
          disabled={!deviceSelectOptions.length}
          noOptionsMessage={t("No devices available")}
        />
      </div>
      {isRobotAction ? (
        <div className="flex min-w-0 flex-col gap-3">
          <FancySelect
            className="w-full xl:max-w-72"
            value={action.robotMode || "aspira"}
            onChange={(mode) => onActionUpdate(action.id, { robotMode: mode })}
            options={robotModeOptions}
            placeholder={t("Select robot action")}
          />
          <div className="flex min-w-0 flex-wrap gap-2">
            {robotRoomActions.map((roomAction) => {
              const selected = (action.robotRooms || []).includes(roomAction.room);
              return (
                <button
                  key={roomAction.room}
                  type="button"
                  onClick={() => {
                    const currentRooms = action.robotRooms || [];
                    const nextRooms = selected
                      ? currentRooms.filter((room) => room !== roomAction.room)
                      : [...currentRooms, roomAction.room];
                    onActionUpdate(action.id, { robotRooms: nextRooms });
                  }}
                  className={classNames(
                    "rounded-lg border px-3 py-2 text-sm font-medium leading-tight transition focus:outline-none focus:ring-2 focus:ring-sky-300",
                    selected
                      ? "border-lime-400 bg-lime-100 text-lime-800 dark:border-lime-500 dark:bg-lime-500/20 dark:text-lime-100"
                      : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 dark:border-neutral-700 dark:bg-neutral-900 dark:text-gray-200"
                  )}
                >
                  {roomAction.label}
                </button>
              );
            })}
          </div>
          {!robotRoomActions.length && (
            <p className="text-sm text-red-500">{t("No robot rooms available")}</p>
          )}
        </div>
      ) : (
        <FancySelect
          className="min-w-0"
          value={selectedActionValue}
          onChange={(newService) => {
            const option = currentActionOptions.find((opt) => opt.value === newService);
            const parsed = parseActionValue(newService);
            onActionUpdate(action.id, {
              entityId: option?.entityId || parsed.entityId,
              service: option?.service || parsed.service,
              data: option?.data || parsed.data || {},
            });
          }}
          options={currentActionOptions}
          placeholder={t("Select action")}
          noOptionsMessage={t("No actions available")}
        />
      )}
      <StyledButton
        variant="delete"
        className="justify-self-end"
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
  const { t } = useLaravelReactI18n();
  // Grab the list of devices from the refreshable context
  const { deviceList = [] } = useContext(DeviceContextRefresh);
  const [entityList, setEntityList] = useState([]);

  // Build a configured device list with extra metadata useful for state/commands.
  const devices = useMemo(
    () =>
      deviceList
        .filter((d) => d?.show) // only visible/configured devices
        .map((device) => ({
          id: device.device_id,
          name: device.name || device.device_id,
          deviceClass: device.device_class,
          stateEntityId: device.state_entity_id,
          entities: device.list_of_entities || [],
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [deviceList]
  );

  useEffect(() => {
    let cancelled = false;

    const fetchEntities = async () => {
      const response = await apiFetch("/entity?skip_services=true");
      if (!cancelled && Array.isArray(response)) {
        setEntityList(response);
      }
    };

    fetchEntities();

    return () => {
      cancelled = true;
    };
  }, []);

  const robotRoomActions = useMemo(() => {
    const byRoom = new Map();
    entityList.forEach((entity) => {
      const parsed = parseRobotScriptEntity(entity?.entity_id || "");
      if (!parsed) return;
      if (!byRoom.has(parsed.room)) {
        byRoom.set(parsed.room, { room: parsed.room, label: formatRobotRoomName(parsed.room), scripts: {} });
      }
      byRoom.get(parsed.room).scripts[parsed.mode] = parsed.entityId;
    });
    return Array.from(byRoom.values())
      .filter((roomAction) => ROBOT_ACTION_MODES.every((mode) => roomAction.scripts[mode]))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [entityList]);

  const actionTargets = useMemo(() => {
    const deviceEntityIds = new Set(
      devices.flatMap((device) => getEntityIdsForTarget(device))
    );

    const deviceTargets = devices.map((device) => ({
      ...device,
      kind: "device",
    }));

    const entityTargets = entityList
      .filter((entity) => {
        const entityId = entity?.entity_id || "";
        const domain = entityId.split(".")[0];
        if (!COMMANDABLE_ENTITY_DOMAINS.has(domain)) return false;
        if (isRobotScriptEntity(entityId)) return false;
        return !deviceEntityIds.has(entityId) || domain === "script" || domain === "scene";
      })
      .map((entity) => ({
        id: `entity:${entity.entity_id}`,
        name: getEntityName(entity),
        deviceClass: entity.entity_id.split(".")[0],
        stateEntityId: entity.entity_id,
        entities: [entity],
        kind: "entity",
      }));

    const byId = new Map();
    [...deviceTargets, ...entityTargets].forEach((target) => {
      if (target.id && !byId.has(target.id)) byId.set(target.id, target);
    });

    return Array.from(byId.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [devices, entityList]);

  // Core builder state: automation name, trigger/action arrays and async flags
  const [automationName, setAutomationName] = useState(() => t(DEFAULT_AUTOMATION_NAME));
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

  const actionTargetSelectOptions = useMemo(
    () => actionTargets.map((target) => ({ value: target.id, label: target.name })),
    [actionTargets]
  );

  const robotTargetIds = useMemo(
    () => new Set(actionTargets.filter(isRobotTarget).map((target) => target.id)),
    [actionTargets]
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
          { value: "on", label: t("is on") },
          { value: "off", label: t("is off") },
        ];
      case "media_player":
        return [
          { value: "playing", label: t("is playing") },
          { value: "paused", label: t("is paused") },
          { value: "idle", label: t("is idle") },
          { value: "on", label: t("is on") },
          { value: "off", label: t("is off") },
        ];
      default:
        return [
          { value: "on", label: t("is on") },
          { value: "off", label: t("is off") },
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
      if (!actionTargets.length) return prev;
      let mutated = false;
      const next = prev.map((a) => {
        const exists = actionTargets.some((target) => target.id === a.deviceId);
        if (exists) return a;
        mutated = true;
        const nextTarget = actionTargets[0];
        return {
          ...a,
          deviceId: nextTarget?.id ?? "",
          entityId: nextTarget?.stateEntityId ?? "",
          service: robotTargetIds.has(nextTarget?.id) ? "" : "turn_on",
          data: {},
          robotMode: "aspira",
          robotRooms: [],
        };
      });
      return mutated ? next : prev;
    });
  }, [devices, actionTargets, robotTargetIds]);

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

  // Fetch available services/commands for every entity linked to the selected action target.
  const ensureServicesForDevice = async (deviceId) => {
    if (!deviceId) return null;
    if (servicesByDevice[deviceId]) return servicesByDevice[deviceId]; // already loaded
    const target = actionTargets.find((d) => d.id === deviceId);
    const entityIds = getEntityIdsForTarget(target);
    if (!entityIds.length) return;

    const options = [];

    for (const entityId of entityIds) {
      const entity = await apiFetch(`/entity/${entityId}`);
      const entityName = getEntityName(entity) || target?.name || entityId;
      const services = entity?.services || {};
      const domain = entityId.split(".")[0];
      const keys = Object.keys(services).sort();

      keys.forEach((key) => {
        const fields = services[key]?.fields || {};
        const requiresData = Object.values(fields).some((field) => field?.required);
        const label = t(services[key]?.name || actionServiceLabels[key] || key.replaceAll("_", " "));
        if (domain === "vacuum" && key === "set_fan_speed") {
          const speeds = Array.isArray(entity?.attributes?.fan_speed_list)
            ? entity.attributes.fan_speed_list
            : [];
          speeds.forEach((speed) => {
            const data = { fan_speed: speed };
            options.push({
              value: makeActionValue(entityId, key, data),
              label: `${entityName} - ${label}: ${speed}`,
              entityId,
              service: key,
              domain,
              data,
            });
          });
          if (speeds.length) return;
        }

        if (requiresData) {
          options.push({
            value: makeActionValue(entityId, key),
            label: `${entityName} - ${label} (${t("requires additional data")})`,
            entityId,
            service: key,
            domain,
            data: {},
            disabled: true,
          });
          return;
        }

        options.push({
          value: makeActionValue(entityId, key),
          label: `${entityName} - ${label}`,
          entityId,
          service: key,
          domain,
          data: {},
        });
      });

      if (!keys.length && ["light", "switch", "script", "automation"].includes(domain)) {
        options.push(
          {
            value: makeActionValue(entityId, "turn_on"),
            label: `${entityName} - ${t("Turn on")}`,
            entityId,
            service: "turn_on",
            domain,
            data: {},
          },
          {
            value: makeActionValue(entityId, "turn_off"),
            label: `${entityName} - ${t("Turn off")}`,
            entityId,
            service: "turn_off",
            domain,
            data: {},
          }
        );
      }
    }

    const deduped = Array.from(
      new Map(options.map((option) => [option.value, option])).values()
    );

    setServicesByDevice((prev) => ({ ...prev, [deviceId]: deduped }));
    return deduped;
  };

  // Build trigger state options from an entity's services/attributes
  const deriveStatesFromEntity = (entity) => {
    const options = [];
    const add = (value, label) => {
      if (!options.some((o) => o.value === value)) options.push({ value, label });
    };
    if (!entity) return [
      { value: "on", label: t("is on") },
      { value: "off", label: t("is off") },
    ];
    const services = entity.services || {};
    const entityId = entity.entity_id || "";
    const domain = entityId.split(".")[0];
    if ("turn_on" in services) add("on", t("is on"));
    if ("turn_off" in services) add("off", t("is off"));
    if (domain === "media_player") {
      if ("media_play" in services) add("playing", t("is playing"));
      if ("media_pause" in services) add("paused", t("is paused"));
      if ("media_stop" in services) add("idle", t("is idle"));
    }
    if (!options.length) {
      add("on", t("is on"));
      add("off", t("is off"));
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
        { value: "on", label: t("is on") },
        { value: "off", label: t("is off") },
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
      title: options?.title ?? t("Are you sure?"),
      message,
      confirmLabel: options?.confirmLabel ?? t("Confirm"),
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
    const map = new Map([
      ...devices.map((device) => [device.id, device.name]),
      ...actionTargets.map((target) => [target.id, target.name]),
    ]);
    return (id) => map.get(id);
  }, [devices, actionTargets]);

  // Trigger types visually shown in the condition builder
  const triggerOptions = [
    { value: "date", label: t("Date") },
    { value: "time", label: t("Hour") },
    { value: "device", label: t("Device state") },
  ];

  // Fallback action options until we fetch device-specific services
  const actionOptions = [
    { value: "turn_on", label: t("Turn on") },
    { value: "turn_off", label: t("Turn off") },
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
  const selectContainerClass = "min-w-0";

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
      const label = target ? formatTriggerPreview(target, deviceNameLookup) : t("this condition");

      requestConfirmation(
        `You are about to remove “${label}”. This cannot be undone.`,
        () => setTriggers((p) => p.filter((t) => t.id !== id)),
        { title: t("Remove condition"), confirmLabel: t("Yes, remove"), variant: "danger", icon: "delete" }
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
      const label = target ? formatActionPreview(target, deviceNameLookup) : t("this action");

      requestConfirmation(
        `You are about to remove “${label}”. This cannot be undone.`,
        () => setActions((p) => p.filter((a) => a.id !== id)),
        { title: t("Remove action"), confirmLabel: t("Yes, remove"), variant: "danger", icon: "delete" }
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
      t("All conditions and actions will be reset to defaults."),
      () => {
        setTriggers(buildDefaultTriggers(devices));
        setActions(buildDefaultActions(actionTargets));
        setAutomationName(t(DEFAULT_AUTOMATION_NAME));
        setSimulationResult(null);
        setIsSimulating(false);
      },
      { title: t("Reset builder"), confirmLabel: t("Yes, reset"), variant: "danger", icon: "refresh" }
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
            className="grid min-w-0 gap-3 md:grid-cols-2 2xl:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)]"
          >
            <FancySelect
              className="min-w-0"
              value={trigger.value.deviceId}
              onChange={async (newDeviceId) => {
                const opts = (await ensureStatesForDevice(newDeviceId)) || [
                  { value: "on", label: t("is on") },
                  { value: "off", label: t("is off") },
                ];
                const defaultState = opts[0]?.value || "on";
                updateTrigger(trigger.id, {
                  value: { ...trigger.value, deviceId: newDeviceId, state: defaultState },
                });
              }}
              options={deviceSelectOptions}
              placeholder={deviceSelectOptions.length ? t("Select a device") : t("No devices available")}
              disabled={!deviceSelectOptions.length}
              noOptionsMessage={t("No devices available")}
            />
            <FancySelect
              className="min-w-0"
              value={trigger.value.state}
              onChange={(newState) =>
                updateTrigger(trigger.id, {
                  value: { ...trigger.value, state: newState },
                })
              }
              options={statesByDevice[trigger.value.deviceId] || []}
              placeholder={statesByDevice[trigger.value.deviceId] ? t("Select a state") : t("Loading states...")}
              disabled={!statesByDevice[trigger.value.deviceId]}
              noOptionsMessage={t("No states available")}
            />
          </motion.div>
        )}
      </AnimatePresence>
    );
  };

  // Produce a readable string describing the trigger for previews and confirmations
  function formatTriggerPreview(trigger, deviceLookup) {
    if (trigger.type === "date") {
      return t("On :date", { date: trigger.value.format("DD MMM YYYY") });
    }
    if (trigger.type === "time") {
      return t("At :time", { time: trigger.value.format("HH:mm") });
    }
    const deviceName = deviceLookup(trigger.value.deviceId) || t("Device");
    const opts = statesByDevice[trigger.value.deviceId] || [];
    const labelMap = new Map(opts.map((o) => [o.value, o.label.replace(/^is\s+/i, "")]));
    const stateLabel = labelMap.get(trigger.value.state) || trigger.value.state;
    return deviceName + " " + stateLabel;
  }

  // Produce a readable string describing an action in the preview list
  function formatActionPreview(action, deviceLookup) {
    const deviceName = deviceLookup(action.deviceId) || t("Device");
    if (robotTargetIds.has(action.deviceId)) {
      const modeLabel = t(action.robotMode || "aspira");
      const roomLabels = (action.robotRooms || []).map(formatRobotRoomName).join(", ");
      return roomLabels
        ? `${deviceName} - ${modeLabel}: ${roomLabels}`
        : `${deviceName} - ${modeLabel}: ${t("Select at least one room")}`;
    }
    const selectedOption = (servicesByDevice[action.deviceId] || []).find(
      (option) => option.value === makeActionValue(action.entityId, action.service, action.data)
    );
    const verb = selectedOption?.label || t(actionServiceLabels[action.service] ?? action.service.replaceAll("_", " "));
    return verb + " " + deviceName;
  }

  // Turn API suggestions into readable bullet points
  const describeSuggestion = (suggestion) => {
    if (!suggestion || typeof suggestion !== "object") return t("Suggestion available.");
    switch (suggestion.suggestion_type) {
      case "better_activation": {
        const time = suggestion.new_activation_time?.slice(0, 5) ?? "";
        const saved = typeof suggestion.monthly_saved_money === "number"
          ? `${suggestion.monthly_saved_money.toFixed(2)} €`
          : null;
        return saved
          ? t("Try moving the activation to :time to save about :saved per month.", { time, saved })
          : t("Try moving the activation to :time.", { time });
      }
      case "conflict_time_change": {
        const times = Array.isArray(suggestion.new_activation_time)
          ? suggestion.new_activation_time.join(" or ")
          : suggestion.new_activation_time;
        return t("Move the activation to :times to resolve the conflict.", { times });
      }
      case "conflict_deactivate_automations": {
        const list = Array.isArray(suggestion.automations_list)
          ? suggestion.automations_list.join(", ")
          : t("other automations");
        return t("Consider disabling the following automations: :list.", { list });
      }
      case "conflict_split_automation":
        return t("Consider splitting the automation into multiple actions.");
      default:
        return suggestion.description || t("Additional suggestion available.");
    }
  };

  // Convert conflict payloads from the simulator into a concise description
  const describeConflict = (conflict) => {
    if (!conflict || typeof conflict !== "object") return t("Conflict detected.");
    if (conflict.type === "Excessive energy consumption") {
      const days = Array.isArray(conflict.days) ? conflict.days.join(", ") : "";
      return t("Excessive energy consumption above :threshold W between :start and :end:days.", {
        threshold: conflict.threshold,
        start: conflict.start,
        end: conflict.end,
        days: days ? ` (${days})` : "",
      });
    }
    if (conflict.type === "Not feasible automation") {
      return t("Automation not feasible with the current limit (:threshold).", { threshold: conflict.threshold });
    }
    return conflict.description || conflict.message || conflict.type || t("Conflict detected.");
  };

  // Map the UI model to the payload expected by the automation API.
  const buildAutomationDefinition = () => {
    const errors = [];
    const alias = automationName.trim();
    if (!alias) {
      errors.push(t("Enter an automation name."));
    }

    const triggerPayload = [];
    const dateFilters = [];

    triggers.forEach((trigger) => {
      if (trigger.type === "time") {
        const timeValue = dayjs(trigger.value);
        if (!timeValue.isValid()) {
          errors.push(t("Invalid trigger time."));
          return;
        }
        triggerPayload.push({ platform: "time", at: timeValue.format("HH:mm:ss") });
      } else if (trigger.type === "device") {
        const deviceId = trigger.value.deviceId;
        const targetState = trigger.value.state;
        if (!deviceId) {
          errors.push(t("Select a device for every device condition."));
          return;
        }
        const device = devices.find((d) => d.id === deviceId);
        if (!device?.stateEntityId) {
          errors.push(t("The selected device has no controllable entity."));
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
          errors.push(t("Invalid trigger date."));
          return;
        }
        dateFilters.push(dateValue.format("YYYY-MM-DD"));
      }
    });

    if (!triggerPayload.length) {
      errors.push(t("Add at least one time or state trigger."));
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
          errors.push(t("The same device has conflicting states in the conditions."));
        }
        deviceStateMap.set(deviceId, desiredState);
      });

    const actionPayload = actions.reduce((acc, action) => {
      if (!action.deviceId) {
        errors.push(t("Select a device for every action."));
        return acc;
      }
      const actionTarget = actionTargets.find((d) => d.id === action.deviceId);
      if (robotTargetIds.has(action.deviceId)) {
        const mode = action.robotMode || "aspira";
        const rooms = action.robotRooms || [];
        if (!ROBOT_ACTION_MODES.includes(mode)) {
          errors.push(t("Select a robot action."));
          return acc;
        }
        if (!rooms.length) {
          errors.push(t("Select at least one room for the robot."));
          return acc;
        }
        rooms.forEach((room) => {
          const roomAction = robotRoomActions.find((item) => item.room === room);
          const scriptEntityId = roomAction?.scripts?.[mode];
          if (!scriptEntityId) {
            errors.push(t("Unable to find the robot script for :room.", { room: formatRobotRoomName(room) }));
            return;
          }
          acc.push({
            service: "script.turn_on",
            target: { entity_id: scriptEntityId },
            data: {},
          });
        });
        return acc;
      }
      const entityId = action.entityId || actionTarget?.stateEntityId;
      const domain = entityId ? entityId.split(".")[0] : null;
      if (!entityId || !domain) {
        errors.push(t("Unable to determine the entity for one of the actions."));
        return acc;
      }
      if (!action.service) {
        errors.push(t("Select an action for every action row."));
        return acc;
      }
      const target = { entity_id: entityId };
      acc.push({
        service: `${domain}.${action.service}`,
        target,
        data: normalizeActionData(action.data),
      });
      return acc;
    }, []);

    if (!actionPayload.length) {
      errors.push(t("Add at least one valid action."));
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
        throw new Error(t("Unable to save the automation."));
      }

      let success = true;
      let message = t("Automation saved successfully.");
      const raw = Array.isArray(response) ? response[1] : response;
      let payload = raw;

      if (typeof raw === "string") {
        try {
          payload = JSON.parse(raw);
        } catch (err) {
          payload = { message: raw };
        }
      }

      if (payload?.result && payload.result !== "ok") {
        success = false;
        message = payload?.message || t("Save failed.");
      }

      if (payload?.status && !["ok", "success"].includes(payload.status)) {
        success = false;
        message = payload?.message || t("Save failed.");
      }

      if (!success) {
        throw new Error(message || t("Save failed."));
      }

      showToast("success", t("Automation saved successfully."));
      setTimeout(() => {
        if (typeof route === "function") {
          window.location.href = route("automation");
        }
      }, 900);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("Save failed.");
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
        throw new Error(t("Simulation failed."));
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
        ? t("Simulation complete: conflicts detected.")
        : suggestions.length
        ? t("Simulation complete with optimisation tips.")
        : t("Simulation complete with no reported issues.");
      showToast(conflicts.length ? "error" : "success", message);
    } catch (error) {
      const message = error instanceof Error ? error.message : t("Simulation failed.");
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

  // Ensure at least one action is executable before enabling save/simulate
  const hasValidAction = actions.some((action) => {
    if (!action.deviceId) return false;
    if (robotTargetIds.has(action.deviceId)) {
      return Boolean(action.robotMode && (action.robotRooms || []).length);
    }
    return Boolean(action.entityId && action.service);
  });

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
        <div className="mx-auto grid w-full max-w-[1280px] gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(340px,0.52fr)]">
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
                  <h1 className="text-3xl font-semibold text-gray-900 dark:text-white">{t("Create a new automation")}</h1>
                  <p className="text-base text-gray-600 dark:text-gray-300">
                    {t("Choose when the automation should run and what it should do.")}
                  </p>
                </div>
              </div>
              <div className="mt-4 w-full max-w-md">
                <label
                  className="block text-sm font-medium text-gray-600 dark:text-gray-300"
                  htmlFor="automation-name"
                >
                  {t("Automation name")}
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
                  placeholder={t("Name your automation")}
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t("When")}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {t("Select the conditions that trigger your automation.")}
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
                    t={t}
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
                  {t("Add condition")}
                </StyledButton>
              </div>
            </motion.section>

            <motion.section
              layout
              transition={{ layout: { duration: 0.3, ease: "easeInOut" } }}
              className="flex flex-col gap-4 rounded-xl bg-white p-6 shadow dark:bg-neutral-900"
            >
              <div>
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t("Then")}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {t("Pick the actions that will run when all conditions are met.")}
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
                    deviceSelectOptions={actionTargetSelectOptions}
                    robotTargetIds={robotTargetIds}
                    robotRoomActions={robotRoomActions}
                    ensureServicesForDevice={ensureServicesForDevice}
                    actionOptions={actionOptions}
                    onActionUpdate={handleActionUpdate}
                    servicesByDevice={servicesByDevice}
                    onActionRemove={handleActionRemoval}
                    selectContainerClass={selectContainerClass}
                    actionsLength={actions.length}
                    t={t}
                  />
                ))}
              </Reorder.Group>

              <div className="flex justify-end">
                <StyledButton
                  onClick={() => {
                    if (saveError) setSaveError("");
                    invalidateSimulation();
                    setActions((prev) => [...prev, createAction(actionTargets)]);
                  }}
                  className="flex items-center gap-2"
                >
                  {getIcon("plus", "size-5")}
                  {t("Add action")}
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
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{t("Automation preview")}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  {t("This card updates live as you tweak conditions and actions.")}
                </p>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
                  {t("When")}
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
                  {t("Then")}
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
                  <p className="text-sm font-semibold uppercase tracking-wide">{t("Simulation feedback")}</p>
                </div>
                {isSimulating ? (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">{t("Running simulation...")}</p>
                ) : simulationResult ? (
                  <div className="mt-3 space-y-3">
                    {simulationResult.conflicts?.length ? (
                      <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700 dark:border-red-500/40 dark:bg-red-500/10 dark:text-red-200">
                        <p className="flex items-center gap-2 font-semibold">
                          <span>{getIcon("warning", "size-5")}</span>
                          {t("Detected conflicts")}
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
                          {t("No conflicts detected")}
                        </p>
                        <p className="mt-1 text-sm">{t("The model did not report blocking issues.")}</p>
                      </div>
                    )}

                    {simulationResult.suggestions?.length > 0 && (
                      <div className="rounded-lg border border-sky-200 bg-sky-50 p-3 text-sm text-sky-700 dark:border-sky-500/40 dark:bg-sky-500/10 dark:text-sky-200">
                        <p className="flex items-center gap-2 font-semibold">
                          <span>{getIcon("light", "size-5")}</span>
                          {t("Model suggestions")}
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
                            {t("Estimated energy")}: {typeof simulationResult.stats.energyConsumption === "number"
                              ? simulationResult.stats.energyConsumption.toFixed(2)
                              : simulationResult.stats.energyConsumption} kWh
                          </span>
                        )}
                        {simulationResult.stats.averagePower != null && (
                          <span>
                            {t("Average power")}: {typeof simulationResult.stats.averagePower === "number"
                              ? simulationResult.stats.averagePower.toFixed(2)
                              : simulationResult.stats.averagePower} W
                          </span>
                        )}
                        {simulationResult.stats.minCost != null && (
                          <span>
                            {t("Minimum cost per run")}: {typeof simulationResult.stats.minCost === "number"
                              ? simulationResult.stats.minCost.toFixed(3)
                              : simulationResult.stats.minCost} €
                          </span>
                        )}
                        {simulationResult.stats.maxCost != null && (
                          <span>
                            {t("Maximum cost per run")}: {typeof simulationResult.stats.maxCost === "number"
                              ? simulationResult.stats.maxCost.toFixed(3)
                              : simulationResult.stats.maxCost} €
                          </span>
                        )}
                        {simulationResult.stats.monthlyCost != null && (
                          <span>
                            {t("Estimated monthly cost")}: {typeof simulationResult.stats.monthlyCost === "number"
                              ? simulationResult.stats.monthlyCost.toFixed(2)
                              : simulationResult.stats.monthlyCost} €
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {t("Run the simulation to preview potential issues and optimisation tips.")}
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
                  {t("Reset")}
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
                  {isSimulating ? t("Simulating...") : t("Simulate")}
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
                  {isSaving ? t("Saving...") : t("Save")}
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
                      {t("Cancel")}
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
                    {t(confirmState.confirmLabel)}
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
