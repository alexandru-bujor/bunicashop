const features = [
    {
        icon: "✅",
        title: "Plată sigură",
        desc: "Achitați când primiți produsul."
    },
    {
        icon: "🚚",
        title: "Livrare în orice regiune",
        desc: "Vă garantăm livrarea la timp a tuturor comenzilor."
    },
    {
        icon: "🔁",
        title: "Garanție",
        desc: "90 zile garanție la toate produsele electronice."
    },
    {
        icon: "🕒",
        title: "Preluarea comenzii 24/7",
        desc: "Plasați o comanda în magazinul online chiar acum!"
    }
];

export default function FeatureHighlights() {
    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            {features.map((f, idx) => (
                <div key={idx} className="bg-white shadow rounded-xl p-4 text-center">
                    <div className="text-2xl mb-2">{f.icon}</div>
                    <h4 className="font-semibold">{f.title}</h4>
                    <p className="text-sm text-gray-600">{f.desc}</p>
                </div>
            ))}
        </div>
    );
}
