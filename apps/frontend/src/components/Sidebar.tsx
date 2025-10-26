import { SidebarButton } from "ui-kit";
import { useState, type ReactNode } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import BlackoutFiltersPanel from "./BlackoutFiltersPanel";
import { Filter, BarChart2 } from "lucide-react";
import logo from "../assets/logo.svg";
import BlackoutsStats from "./BlackoutsStats";

interface Tab {
    id: string;
    title: string;
    icon: ReactNode;
    content: ReactNode;
}

const Sidebar = () => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [activeTab, setActiveTab] = useState("filters");

    const tabs: Tab[] = [
        {
            id: "filters",
            title: "Фильтры",
            icon: <Filter className="h-6 w-6" />,
            content: <BlackoutFiltersPanel />,
        },
        {
            id: "stats",
            title: "Статистика",
            icon: <BarChart2 className="h-6 w-6" />,
            content: <BlackoutsStats />,
        },
    ];

    if (!isDesktop) {
        return null;
    }

    const currentTab = tabs.find((tab) => tab.id === activeTab);

    return (
        <div className="fixed left-0 top-0 z-30 flex h-screen">
            <div className="flex h-full flex-col items-center gap-4 border-r border-slate-200 bg-white p-2">
                {tabs.map((tab) => (
                    <SidebarButton
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        isActive={activeTab === tab.id}
                        aria-label={tab.title}
                    >
                        {tab.icon}
                    </SidebarButton>
                ))}
            </div>
            <div className="w-80 bg-white shadow-lg">
                <div className="border-b border-slate-200 p-4">
                    <div className="flex items-center justify-between">
                        <img src={logo} alt="VL.ru" className="h-12 w-auto -mt-4" />
                        <div className="text-right">
                            <p className="font-medium text-orange-500">Отключение воды и света</p>
                            <p className="font-bold text-slate-800">Владивосток</p>
                        </div>
                    </div>
                </div>
                <div className="border-b border-slate-200 px-4 pt-3 pb-0">
                    <h2 className="text-xl font-bold text-slate-800">{currentTab?.title}</h2>
                </div>
                <div className="h-[calc(100vh-140px)] overflow-y-auto">
                    {currentTab?.content}
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
