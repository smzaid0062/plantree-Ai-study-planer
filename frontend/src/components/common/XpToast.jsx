import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";

let pushToast = null;

export const showXp = (message) => pushToast?.(message);

export default function XpToast() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    pushToast = (message) => {
      const id = Date.now() + Math.random();
      setItems((prev) => [...prev, { id, message }]);
      setTimeout(() => setItems((prev) => prev.filter((i) => i.id !== id)), 3000);
    };
    return () => { pushToast = null; };
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {items.map((i) => (
        <div
          key={i.id}
          className="flex items-center gap-2 bg-white border border-primary-200 shadow-lg rounded-xl px-4 py-3 animate-fade-in"
        >
          <Sparkles size={16} className="text-primary-600" />
          <span className="text-sm font-semibold text-gray-800">{i.message}</span>
        </div>
      ))}
    </div>
  );
}