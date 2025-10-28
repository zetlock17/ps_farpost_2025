import {
    useEffect,
    useMemo,
    useRef,
    useState,
    type PointerEvent as ReactPointerEvent,
} from "react";
import { ConfigProvider } from "antd";
import ruRU from "antd/locale/ru_RU";
import dayjs from "dayjs";
import "dayjs/locale/ru";
import MapOfBlackouts from "./MapOfBlackouts";
import { useBlackoutsStore } from "../store/blackoutsStore";
import { useMediaQuery } from "../hooks/useMediaQuery";
import Sidebar from "./Sidebar";
import Header from "./Header";

import MobileMenu from "./MobileMenu";

dayjs.locale("ru");

const PANEL_MIN_HEIGHT = 25;
const PANEL_MAX_HEIGHT = 500;
const MOBILE_PANEL_HEIGHT = 380;

const TaxiAggregatorLayout = () => {
    const fetchBlackouts = useBlackoutsStore((state) => state.fetchBlackouts);
    const filteredBlackouts = useBlackoutsStore((state) => state.filteredBlackouts);
    const isLoading = useBlackoutsStore((state) => state.isLoading);
    const error = useBlackoutsStore((state) => state.error);

    const [panelHeight, setPanelHeight] = useState<number>(360);
    const [isResizing, setIsResizing] = useState(false);
    const resizeStateRef = useRef<{ startY: number; startHeight: number }>({
        startY: 0,
        startHeight: 360,
    });
    
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const isMobile = !isDesktop;

    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    };

    useEffect(() => {
        return () => {
            document.body.classList.remove("select-none");
        };
    }, []);

    useEffect(() => {
        if (isMobile) {
            setPanelHeight(MOBILE_PANEL_HEIGHT);
            setIsResizing(false);
            document.body.classList.remove("select-none");
        }
    }, [isMobile]);

    useEffect(() => {
        fetchBlackouts();
    }, [fetchBlackouts]);

    const resultLabel = useMemo(() => {
        if (isLoading) {
            return "Поиск подходящих отключений...";
        }

        if (filteredBlackouts.length === 0) {
            return "Ничего не найдено";
        }

        if (filteredBlackouts.length === 1) {
            return "Найдено 1 отключение";
        }

        if (filteredBlackouts.length < 5) {
            return `Найдено ${filteredBlackouts.length} отключения`;
        }

        return `Найдено ${filteredBlackouts.length} отключений`;
    }, [filteredBlackouts.length, isLoading]);

    const clampPanelHeight = (value: number) => {
        return Math.min(PANEL_MAX_HEIGHT, Math.max(PANEL_MIN_HEIGHT, value));
    };

    const handleResizeStart = (event: ReactPointerEvent<HTMLDivElement>) => {
        if (isMobile) {
            return;
        }
        event.preventDefault();
        resizeStateRef.current = {
            startY: event.clientY,
            startHeight: panelHeight,
        };
        setIsResizing(true);
        document.body.classList.add("select-none");
    };

    useEffect(() => {
        if (!isResizing || isMobile) {
            return;
        }

        const handlePointerMove = (event: PointerEvent) => {
            const { startY, startHeight } = resizeStateRef.current;
            const delta = startY - event.clientY;
            const nextHeight = clampPanelHeight(startHeight + delta);
            setPanelHeight(nextHeight);
        };

        const handlePointerUp = () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            setIsResizing(false);
            document.body.classList.remove("select-none");
        };

        window.addEventListener("pointermove", handlePointerMove);
        window.addEventListener("pointerup", handlePointerUp);

        return () => {
            window.removeEventListener("pointermove", handlePointerMove);
            window.removeEventListener("pointerup", handlePointerUp);
            document.body.classList.remove("select-none");
        };
    }, [isResizing, isMobile]);

    return (
        <ConfigProvider
            locale={ruRU}
            theme={{
                token: {
                    colorPrimary: "#F97D41",
                    borderRadius: 12,
                },
                components: {
                    DatePicker: {
                        activeBorderColor: "#F97D41",
                        hoverBorderColor: "#F97D41",
                    },
                },
            }}
        >
            <div className="relative h-screen w-full bg-slate-900">
                <Header toggleMenu={toggleMenu} />
                <MobileMenu isOpen={isMenuOpen} onClose={toggleMenu} />
                <MapOfBlackouts variant="fullscreen" showViewToggle={false} className="h-full" />
                
                {isDesktop && <Sidebar />}

                {isMobile && (
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 flex justify-center">
                        <div className="pointer-events-auto w-full max-w-3xl px-4 sm:px-6">
                            <div
                                className="flex h-full flex-col overflow-hidden rounded-t-3xl border border-white/30 bg-white/80 backdrop-blur-sm"
                                style={{ height: `${isMobile ? MOBILE_PANEL_HEIGHT : panelHeight}px` }}
                            >
                                <div className="flex items-center justify-center pb-2 pt-3">
                                    <div
                                        role="separator"
                                        aria-orientation="horizontal"
                                        aria-disabled={isMobile}
                                        className={`h-1 w-12 rounded-full ${
                                            isResizing ? "bg-[#F97D41]" : "bg-slate-300"
                                        } ${isMobile ? "cursor-default" : "cursor-ns-resize"}`}
                                        onPointerDown={handleResizeStart}
                                    />
                                </div>

                                <div className="flex-1 overflow-y-auto px-5 pb-4 pt-2">
                                    <div className="flex flex-col gap-0.5 sm:flex-row sm:items-center sm:justify-between">
                                        <h2 className="text-xl font-semibold text-slate-900">Фильтр отключений</h2>
                                        <span className="text-sm font-medium text-slate-500">{resultLabel}</span>
                                    </div>
                                    
                                    {error && (
                                        <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-600">
                                            {error}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ConfigProvider>
    );
};

export default TaxiAggregatorLayout;
