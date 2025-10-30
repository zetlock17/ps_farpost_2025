import { SidebarButton } from "ui-kit";
import { useState, type ReactNode } from "react";
import { useMediaQuery } from "../hooks/useMediaQuery";
import BlackoutFiltersPanel from "./BlackoutFiltersPanel";
import {
    Filter,
    BarChart2,
    Gauge,
    Bell,
    Users,
} from "lucide-react";
import logo from "../assets/logo.svg";
import BlackoutsStats from "./BlackoutsStats";
import { useNavigate } from "react-router-dom";

interface Tab {
    id: string;
    title: string;
    icon: ReactNode;
    content?: ReactNode;
    path?: string;
    state?: object;
}

const Sidebar = () => {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [activeTab, setActiveTab] = useState("filters");
    const navigate = useNavigate();

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
        {
            id: "meter-readings",
            title: "Показания счетчиков",
            icon: <Gauge className="h-6 w-6" />,
            path: "/placeholder",
            state: { title: "Показания счетчиков" },
        },
        {
            id: "notifications",
            title: "Уведомления",
            icon: <Bell className="h-6 w-6" />,
            path: "/placeholder",
            state: { title: "Уведомления" },
        },
        {
            id: "management-companies",
            title: "Управляющие компании",
            icon: <Users className="h-6 w-6" />,
            path: "/placeholder",
            state: { title: "Управляющие компании" },
        },
    ];

    if (!isDesktop) {
        return null;
    }

    const currentTab = tabs.find((tab) => tab.id === activeTab);

    const handleTabClick = (tab: Tab) => {
        if (tab.path) {
            navigate(tab.path, { state: tab.state });
        } else {
            setActiveTab(tab.id);
        }
    };

    return (
        <div className="fixed left-0 top-0 z-30 flex h-screen">
            <div className="flex h-full flex-col items-center gap-4 border-r border-gray-200 bg-white p-2">
                {tabs.map((tab) => (
                    <SidebarButton
                        key={tab.id}
                        onClick={() => handleTabClick(tab)}
                        isActive={activeTab === tab.id}
                        aria-label={tab.title}
                    >
                        {tab.icon}
                    </SidebarButton>
                ))}
            </div>
            {currentTab?.content && (
                <div className="w-80 bg-white shadow-lg">
                    <div className="border-b border-gray-200 p-4">
                        <div className="flex items-center justify-between">
                            <img
                                src={logo}
                                alt="VL.ru"
                                className="h-12 w-auto -mt-4"
                            />
                            <div className="text-right">
                                <p className="font-medium text-[#F97D41]">
                                    Отключение воды и света
                                </p>
                                <p className="font-bold text-primary-black">
                                    Владивосток
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="border-b border-gray-200 px-4 pt-3 pb-0">
                        <h2 className="text-xl font-bold text-primary-black">
                            {currentTab?.title}
                        </h2>
                    </div>
                    <div className="h-[calc(100vh-140px)] overflow-y-auto">
                        {currentTab?.content}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Sidebar;
