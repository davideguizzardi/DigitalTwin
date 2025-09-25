import { useContext, useMemo, useState } from "react";
import dayjs from "dayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import { Select } from "flowbite-react";
import { AnimatePresence, motion } from "framer-motion";

import { getIcon } from "@/Components/Commons/Constants";
import { StyledButton } from "@/Components/Commons/StyledBasedComponents";
import { DeviceContextRefresh } from "@/Components/ContextProviders/DeviceProviderRefresh";

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

  const devices = useMemo(
    () =>
      deviceList
        .map((device) => ({
          id: device.device_id,
          name: device.name || device.device_id,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [deviceList]
  );

  const [triggers, setTriggers] = useState(() => buildDefaultTriggers(devices));
  const [actions, setActions] = useState(() => buildDefaultActions(devices));

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

  const updateTrigger = (id, partial) => {
    setTriggers((prev) => prev.map((trigger) => (trigger.id === id ? { ...trigger, ...partial } : trigger)));
  };

  const handleTriggerTypeChange = (id, type) => {
    const nextValue =
      type === "date"
        ? dayjs()
        : type === "time"
        ? dayjs()
        : { deviceId: devices[0]?.id ?? "", state: "on" };
    updateTrigger(id, { type, value: nextValue });
  };

  const handleTriggerRemoval = (id) => {
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
    setActions((prev) => prev.map((action) => (action.id === id ? { ...action, ...partial } : action)));
  };

  const handleActionRemoval = (id) => {
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
            <div className="w-full md:w-64">
              <Select
                value={trigger.value.deviceId}
                onChange={(event) =>
                  updateTrigger(trigger.id, {
                    value: { ...trigger.value, deviceId: event.target.value },
                  })
                }
              >
                <option value="">Select a device</option>
                {devices.map((device) => (
                  <option key={device.id} value={device.id}>
                    {device.name}
                  </option>
                ))}
              </Select>
            </div>
            <div className="w-full md:w-48">
              <Select
                value={trigger.value.state}
                onChange={(event) =>
                  updateTrigger(trigger.id, {
                    value: { ...trigger.value, state: event.target.value },
                  })
                }
              >
                <option value="on">is on</option>
                <option value="off">is off</option>
              </Select>
            </div>
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
      <div className="flex items-center gap-3 md:w-64">
        <motion.div layout className="rounded-full bg-lime-100 p-3 text-lime-700 dark:bg-lime-500/20">
          {getIcon("puzzle", "size-6")}
        </motion.div>
        <Select
          value={action.deviceId}
          onChange={(event) => handleActionUpdate(action.id, { deviceId: event.target.value })}
        >
          <option value="">Choose device</option>
          {devices.map((device) => (
            <option key={device.id} value={device.id}>
              {device.name}
            </option>
          ))}
        </Select>
      </div>
      <div className="md:w-52">
        <Select
          value={action.service}
          onChange={(event) => handleActionUpdate(action.id, { service: event.target.value })}
        >
          {actionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
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
    const stateLabel = trigger.value.state === "on" ? "turns on" : "turns off";
    return deviceName + " " + stateLabel;
  }

  function formatActionPreview(action, deviceLookup) {
    const deviceName = deviceLookup(action.deviceId) || "Device";
    const verb = actionServiceLabels[action.service] ?? "Toggle";
    return verb + " " + deviceName;
  }

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
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
                    <div className="flex items-center gap-3 md:w-64">
                      <div className="rounded-full bg-lime-100 p-3 text-lime-700 dark:bg-lime-500/20">
                        {getIcon(iconByTriggerType[trigger.type], "size-6")}
                      </div>
                      <Select
                        value={trigger.type}
                        onChange={(event) => handleTriggerTypeChange(trigger.id, event.target.value)}
                      >
                        {triggerOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </Select>
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
                  onClick={() => setTriggers((prev) => [...prev, createTrigger("date", devices)])}
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
                  onClick={() => setActions((prev) => [...prev, createAction(devices)])}
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
                  disabled
                  className="rounded-lg bg-lime-400 px-5 py-2 text-sm font-semibold text-gray-900 opacity-60 shadow transition focus:outline-none focus:ring-2 focus:ring-lime-200 disabled:cursor-not-allowed"
                >
                  Save
                </button>
              </motion.div>
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
