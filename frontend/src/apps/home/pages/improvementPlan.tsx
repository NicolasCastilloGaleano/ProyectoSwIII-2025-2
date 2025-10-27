import ImprovementCard from "../components/improvementCard";

export default function improvementPLan() {
    return (
        <div className="p-8 justify-center font-extrabold text-center text-4xl py-16 drop-shadow-lg">
            <h1>
                Conoce todos nuestros planes
            </h1>
            <div className="p-8 flex gap-8 justify-center">
                <ImprovementCard></ImprovementCard>
                <ImprovementCard></ImprovementCard>
                <ImprovementCard></ImprovementCard>
            </div>
        </div>
    );
}
