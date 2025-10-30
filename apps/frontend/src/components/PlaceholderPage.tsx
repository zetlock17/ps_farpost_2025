import { Link, useLocation } from "react-router-dom";

const PlaceholderPage = () => {
    const location = useLocation();
    const title = location.state?.title || "Page";

    return (
        <div className="flex h-screen flex-col items-center justify-center bg-primary-gray">
            <h1 className="mb-4 text-4xl font-bold text-primary-black">А все, тута больше ниче нету</h1>
            <p className="mb-8 text-lg text-primary-gray">Раздел "{title}" не завезли, иди отсюда.</p>
            <Link to="/" className="text-primary-blue hover:underline">
                Вернуться на главную
            </Link>
        </div>
    );
};

export default PlaceholderPage;
