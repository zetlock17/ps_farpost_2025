import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import type { BlackoutsQueryParams } from "../types/types";
import { useBlackoutsStore } from "../store/blackoutsStore";
import { useShallow } from "zustand/react/shallow";

const typeOptions: { value: BlackoutsQueryParams["type"] | "all"; label: string; accent: string }[] = [
  { value: "all", label: "Все ресурсы", accent: "from-emerald-500 to-teal-500" },
  { value: "electricity", label: "Электричество", accent: "from-yellow-400 to-amber-500" },
  { value: "hot_water", label: "Горячая вода", accent: "from-orange-500 to-red-500" },
  { value: "cold_water", label: "Холодная вода", accent: "from-sky-500 to-blue-500" },
  { value: "heat", label: "Отопление", accent: "from-rose-500 to-pink-500" }
];

const TaxiSearchHero = () => {
  const {
    selectedType,
    selectedDistrict,
    availableDistricts,
    searchQuery,
    filteredBlackouts,
    isLoading,
    error,
    setTypeFilter,
    setDistrictFilter,
    searchBlackouts,
    clearFilters
  } = useBlackoutsStore(
    useShallow((state) => ({
      selectedType: state.selectedType,
      selectedDistrict: state.selectedDistrict,
      availableDistricts: state.availableDistricts,
      searchQuery: state.searchQuery,
      filteredBlackouts: state.filteredBlackouts,
      isLoading: state.isLoading,
      error: state.error,
      setTypeFilter: state.setTypeFilter,
      setDistrictFilter: state.setDistrictFilter,
      searchBlackouts: state.searchBlackouts,
      clearFilters: state.clearFilters
    }))
  );

  const [localQuery, setLocalQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalQuery(searchQuery);
  }, [searchQuery]);

  const districts = useMemo(
    () => ["all", ...availableDistricts],
    [availableDistricts]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    searchBlackouts(localQuery);
  };

  const handleQueryChange = (value: string) => {
    setLocalQuery(value);
  };

  const handleReset = () => {
    setLocalQuery("");
    clearFilters();
  };

  return (
  <section className="relative isolate overflow-hidden bg-linear-to-br from-slate-950 via-slate-900 to-slate-950 text-white">
      <div className="pointer-events-none absolute inset-0 opacity-70" aria-hidden="true">
        <div className="absolute right-1/3 top-24 h-64 w-64 rounded-full bg-sky-500/30 blur-3xl" />
        <div className="absolute left-24 bottom-24 h-72 w-72 rounded-full bg-emerald-500/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-6 py-16 lg:flex-row lg:items-center lg:py-20">
        <div className="flex-1 space-y-6">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1 text-sm font-medium text-white/80 backdrop-blur">
            ⚡ Агрегатор отключений
          </span>
          <h1 className="text-4xl font-semibold leading-tight lg:text-5xl lg:leading-[1.1]">
            Управляйте отключениями так же быстро, как заказом такси
          </h1>
          <p className="max-w-xl text-base text-white/70 lg:text-lg">
            Подберите нужный ресурс, район и адрес. Мы покажем активные отключения и поможем найти альтернативы в несколько кликов.
          </p>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/60">Отключений найдено</p>
              <p className="mt-2 text-3xl font-semibold">{filteredBlackouts.length}</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/60">Текущий фильтр</p>
              <p className="mt-2 text-sm font-medium text-white/80">
                {typeOptions.find((option) => option.value === selectedType)?.label ?? "Все ресурсы"}
              </p>
            </div>
            <div className="rounded-2xl bg-white/10 p-4 backdrop-blur">
              <p className="text-xs uppercase tracking-wide text-white/60">Район</p>
              <p className="mt-2 text-sm font-medium text-white/80">
                {selectedDistrict === "all" ? "Любой" : selectedDistrict}
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex-1">
          <div className="absolute -inset-1 rounded-3xl bg-linear-to-br from-white/20 via-white/10 to-transparent blur" aria-hidden="true" />
          <form
            onSubmit={handleSubmit}
            className="relative rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl shadow-slate-950/40 backdrop-blur-lg"
          >
            <h2 className="text-xl font-semibold">Найдите нужное отключение</h2>
            <p className="mt-2 text-sm text-white/70">
              Введите адрес или описание и уточните тип ресурса. Поиск выполняется по моковому API.
            </p>

            {error && (
              <div className="mt-4 rounded-2xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                {error}
              </div>
            )}

            <label className="mt-6 block text-sm font-medium text-white/70" htmlFor="searchQuery">
              Поиск по адресу или объекту
            </label>
              <div className="mt-2 flex gap-3 rounded-2xl border border-white/10 bg-white/5 p-2 shadow-inner">
              <input
                id="searchQuery"
                type="text"
                value={localQuery}
                onChange={(event) => handleQueryChange(event.target.value)}
                placeholder="Например, Русская 33 или подстанция"
                className="w-full rounded-xl border-0 bg-transparent px-4 py-3 text-base text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-xl bg-linear-to-r from-sky-500 to-cyan-500 px-6 text-sm font-semibold text-white shadow-lg shadow-sky-500/20 transition hover:from-sky-400 hover:to-cyan-400"
                disabled={isLoading}
              >
                {isLoading ? "Поиск..." : "Найти"}
              </button>
            </div>

            <div className="mt-6 space-y-6">
              <div>
                <span className="text-sm font-medium text-white/70">Тип ресурса</span>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {typeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setTypeFilter(option.value)}
                      className={`group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${
                        selectedType === option.value ? "ring-2 ring-sky-400" : "hover:border-white/20"
                      }`}
                    >
                      <span className={`absolute -left-10 top-1/2 h-20 w-20 -translate-y-1/2 rounded-full opacity-0 blur-2xl transition group-hover:opacity-40 bg-linear-to-br ${option.accent}`} />
                      <span className="relative block text-sm font-medium text-white">
                        {option.label}
                      </span>
                      <span className="relative mt-1 block text-xs text-white/60">
                        {option.value === "all" ? "Показать все отключения" : "Только выбранный ресурс"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium text-white/70" htmlFor="district">
                  Район отключения
                </label>
                <div className="mt-3 grid gap-3 sm:grid-cols-[1fr_auto]">
                  <select
                    id="district"
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white focus:border-sky-500 focus:outline-none"
                    value={selectedDistrict}
                    onChange={(event) => setDistrictFilter(event.target.value)}
                  >
                    {districts.map((district) => (
                      <option key={district} value={district} className="text-slate-900">
                        {district === "all" ? "Любой район" : district}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="inline-flex items-center justify-center rounded-2xl border border-white/15 px-4 py-3 text-sm font-semibold text-white transition hover:border-white/40"
                  >
                    Сбросить
                  </button>
                </div>
              </div>
            </div>

            <p className="mt-6 text-xs text-white/50">
              * Поиск выполняется в моковых данных и имитирует запрос к серверу. Добавьте настоящий API, когда он будет готов.
            </p>
          </form>
        </div>
      </div>
    </section>
  );
};

export default TaxiSearchHero;
