// AddAutomation.jsx — layout aggiornato:
// - Delete a destra (allineati al bordo destro della card)
// - "+ Add condition" e "+ Add action" a destra e verdi

import { getIcon } from "@/Components/Commons/Constants";

export default function AddAutomation() {
  const cardCls =
    "bg-white rounded-lg shadow-[1px_1px_4px_rgba(0,0,0,0.25)] border border-black/20";

  return (
    <div className="w-full min-h-screen bg-surface-surface-secondary flex items-start justify-center">
      <div className="w-full max-w-[1600px] mx-auto px-6 py-8 grid grid-cols-12 gap-6">

        {/* ======= COLONNA SINISTRA (Builder) ======= */}
        <section className="col-span-12 lg:col-span-8">
          <div className={`${cardCls} relative`}>
            {/* Titolo centrato */}
            <header className="flex items-center justify-center gap-4 px-12 pt-10 pb-4 text-center">
              <div className="rounded-full">{getIcon("puzzle", "size-14 text-gray-700")}</div>
              <div>
                <h1 className="text-gray-800 text-4xl font-semibold leading-tight">
                  Create a new automation
                </h1>
                <p className="text-neutral-700 text-base">
                  Define when and how your automation needs to start
                </p>
              </div>
            </header>

            <div className="px-12 pb-12 grid gap-8">
              {/* === Card WHEN === */}
              <div className={`${cardCls} p-8`}>
                {/* Testo introduttivo mantenuto a max 680 per tipografia */}
                <div className="max-w-[680px]">
                  <h2 className="text-4xl font-semibold text-black leading-[60px]">When</h2>
                  <p className="text-neutral-700 text-sm">
                    Specify the conditions under which your automation should start
                  </p>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Riga: Date  */}
                  <div className="relative w-full">
                    {/* contenuto limitato a 680px, con padding destro per non finire sotto il cestino */}
                    <div className="max-w-[680px] pr-16 flex items-center gap-3">
                      <div className="w-40 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getIcon("weekday", "size-4 text-gray-700")}
                          <span className="text-stone-900 text-base">Date</span>
                        </div>
                      </div>

                      <div className="w-72 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <span className="text-stone-900 text-xs">Mon,  23 Jun 2025</span>
                        {getIcon("weekday", "size-4 text-gray-700")}
                      </div>
                    </div>

                    {/* Cestino perfettamente a destra della card */}
                    <button
                      type="button"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-400 rounded-lg shadow flex items-center justify-center"
                      aria-label="Delete condition"
                    >
                      {getIcon("delete", "size-4 text-zinc-700")}
                    </button>
                  </div>

                  {/* and */}
                  <div className="max-w-[680px] text-4xl font-semibold text-black leading-[60px]">and</div>

                  {/* Riga: Hour */}
                  <div className="relative w-full">
                    <div className="max-w-[680px] pr-16 flex items-center gap-3">
                      <div className="w-40 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          {getIcon("time", "size-4 text-gray-700")}
                          <span className="text-stone-900 text-base">Hour</span>
                        </div>
                      </div>

                      <div className="w-72 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <span className="text-stone-900 text-xs">08 : 30 AM</span>
                        {getIcon("time", "size-4 text-gray-700")}
                      </div>
                    </div>

                    <button
                      type="button"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-400 rounded-lg shadow flex items-center justify-center"
                      aria-label="Delete condition"
                    >
                      {getIcon("delete", "size-4 text-zinc-700")}
                    </button>
                  </div>

                  {/* and */}
                  <div className="max-w-[680px] text-4xl font-semibold text-black leading-[60px]">and</div>

                  {/* Riga: Device (Light Bulb OFF) */}
                  <div className="relative w-full">
                    <div className="max-w-[680px] pr-16 flex items-center gap-3">
                      <div className="w-40 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <span className="text-stone-900 text-base">Device</span>
                      </div>

                      <div className="w-72 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getIcon("light", "size-4 text-gray-700")}
                          <span className="text-stone-900 text-xs">Light Bulb</span>
                        </div>
                        {getIcon("dot", "size-4 text-gray-700")}
                      </div>

                      <div className="w-40 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <span className="text-stone-900 text-base">Off</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-400 rounded-lg shadow flex items-center justify-center"
                      aria-label="Delete condition"
                    >
                      {getIcon("delete", "size-4 text-zinc-700")}
                    </button>
                  </div>
                </div>

                {/* "+ Add condition" A DESTRA della card */}
                <div className="pt-6 flex justify-end">
                  <button
                    type="button"
                    className="w-44 h-14 bg-green-500 rounded-lg shadow text-white font-medium"
                  >
                    + Add condition
                  </button>
                </div>
              </div>

              {/* === Card THEN === */}
              <div className={`${cardCls} p-8`}>
                <div className="max-w-[680px]">
                  <h2 className="text-4xl font-semibold text-black leading-[60px]">Then</h2>
                  <p className="text-neutral-700 text-sm">
                    Specify which actions your automation will perform once all trigger conditions are met
                  </p>
                </div>

                <div className="mt-6 space-y-6">
                  {/* Riga: Light Bulb -> On */}
                  <div className="relative w-full">
                    <div className="max-w-[680px] pr-16 flex items-center gap-3">
                      <div className="w-40 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <span className="text-stone-900 text-base">Device</span>
                      </div>

                      <div className="w-72 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getIcon("light", "size-4 text-gray-700")}
                          <span className="text-stone-900 text-xs">Light Bulb</span>
                        </div>
                        {getIcon("dot", "size-4 text-gray-700")}
                      </div>

                      <div className="w-40 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <span className="text-stone-900 text-base">On</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-400 rounded-lg shadow flex items-center justify-center"
                      aria-label="Delete action"
                    >
                      {getIcon("delete", "size-4 text-zinc-700")}
                    </button>
                  </div>

                  {/* and */}
                  <div className="max-w-[680px] text-4xl font-semibold text-black leading-[60px]">and</div>

                  {/* Riga: Speaker -> Ringtone/Play */}
                  <div className="relative w-full">
                    <div className="max-w-[680px] pr-16 flex items-center gap-3">
                      <div className="w-40 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <span className="text-stone-900 text-base">Device</span>
                      </div>

                      <div className="w-72 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getIcon("speaker", "size-4 text-gray-700")}
                          <span className="text-stone-900 text-xs">Speaker</span>
                        </div>
                        {getIcon("dot", "size-4 text-gray-700")}
                      </div>

                      <div className="w-40 h-14 px-6 py-2 bg-white rounded border border-neutral-400 flex items-center justify-between">
                        <span className="text-stone-900 text-base">Ringtone</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 bg-red-400 rounded-lg shadow flex items-center justify-center"
                      aria-label="Delete action"
                    >
                      {getIcon("delete", "size-4 text-zinc-700")}
                    </button>
                  </div>
                </div>

                {/* "+ Add action" A DESTRA della card */}
                <div className="pt-6 flex justify-end">
                  <button
                    type="button"
                    className="w-44 h-14 bg-green-500 rounded-lg shadow text-white font-medium"
                  >
                    + Add action
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ======= COLONNA DESTRA (Preview) ======= */}
        <aside className="col-span-12 lg:col-span-4">
          <div className={`${cardCls} p-8 flex flex-col gap-8`}>

            {/* NEW AUTOMATION centrato, "AUTOMATION" verde */}
            <h2 className="text-4xl font-bold uppercase text-center">
              <span className="text-Text">NEW</span>{" "}
              <span className="text-green-500 underline">AUTOMATION</span>
            </h2>

            {/* WHEN/THEN a sinistra, come chiesto in precedenza */}
            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-green-500 shadow flex items-center justify-center">
                <span className="text-white text-3xl leading-none">?</span>
              </div>
              <div className="text-Text text-3xl font-bold uppercase">WHEN</div>
            </div>

            <div className="rounded-3xl border border-gray-300 px-6 py-9 grid gap-3 w-60 mx-auto">
              <div className="flex items-center gap-3">
                {getIcon("weekday", "size-6 text-zinc-700")}
                <div className="text-Text text-xl uppercase">23 JUNE 2025,</div>
              </div>
              <div className="flex items-center justify-between">
                {getIcon("time", "size-5 text-zinc-700")}
                <div className="text-xl">
                  <span>08:30 A.M. </span>
                  <span className="font-bold">and</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getIcon("light", "size-5 text-zinc-700")}
                <div className="text-xl">
                  <span>Light bulb is </span>
                  <span className="font-bold">OFF</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-14 h-14 rounded-full bg-green-500 shadow flex items-center justify-center">
                <span className="text-white text-3xl leading-none">!</span>
              </div>
              <div className="text-Text text-3xl font-bold uppercase">then</div>
            </div>

            <div className="rounded-3xl border border-gray-300 px-6 py-9 grid gap-4 w-60 mx-auto">
              <div className="flex items-center gap-2">
                {getIcon("light", "size-5 text-zinc-700")}
                <div className="text-xl">
                  <span>Light bulb is </span>
                  <span className="font-bold">ON</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {getIcon("speaker", "size-6 text-zinc-700")}
                <div className="text-xl">
                  <span>Speaker </span>
                  <span className="font-bold">PLAY</span>
                </div>
              </div>
            </div>

            {/* Bottoni centrati */}
            <div className="mt-auto flex items-center justify-center gap-6">
              <button type="button" className="w-32 h-12 bg-red-400 rounded-lg shadow text-white font-medium">
                Reset
              </button>
              <button type="button" className="w-32 h-12 bg-amber-400 rounded-lg shadow text-white font-medium">
                Simulate
              </button>
              <button type="button" className="w-32 h-12 bg-green-500 rounded-lg shadow text-white font-medium">
                Save
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
