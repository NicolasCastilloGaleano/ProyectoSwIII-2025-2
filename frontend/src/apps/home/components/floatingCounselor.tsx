import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usefloatingCounseling } from "../hooks/useFloatingCouseling";

export const FloatingCounselor = () => {
    const { visible, setVisible, counseling } = usefloatingCounseling();

    if (!counseling) return null;

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 20 }}
                    transition={{ duration: 0.25 }}
                    className="
                        fixed bottom-6 right-6 
                        w-80 p-4 
                        rounded-xl shadow-xl 
                        bg-white
                        border border-neutral-200 dark:border-neutral-700
                        z-50
                    "
                >
                    <div className="flex justify-between items-start mb-2">
                        <h2 className="text-lg font-semibold">
                            {counseling.titulo}
                        </h2>

                        <button
                            onClick={() => setVisible(false)}
                            className="text-neutral-400 hover:text-neutral-600"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <ul className="text-sm text-neutral-900 dark:text-neutral-500 space-y-1">
                        {counseling.consejos.slice(0, 3).map((c, i) => (
                            <li key={i}>• {c}</li>
                        ))}
                    </ul>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
