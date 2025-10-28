import { Link, useLocation } from "react-router-dom";

const PlaceholderPage = () => {
    const location = useLocation();
    const title = location.state?.title || "Page";

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-gray-100">
            <h1 className="mb-4 text-4xl font-bold text-gray-800">А все, тута больше ниче нету</h1>
            <p className="mb-8 text-lg text-gray-600">Раздел "{title}" не завезли, иди отсюда.</p>
            <Link to="/" className="text-blue-500 hover:underline">
                Вернуться на главную
            </Link>
        </div>
    );
};

export default PlaceholderPage;
