interface TooltipProps {
  text: string;
  width?: "sm" | "md" | "lg";
}

const WIDTH_MAP = {
  sm: "w-44",
  md: "w-56",
  lg: "w-64",
};

export default function Tooltip({ text, width = "md" }: TooltipProps) {
  return (
    <span className="relative inline-flex items-center group flex-shrink-0">
      <span className="w-3.5 h-3.5 rounded-full bg-gray-100 text-gray-400 text-[9px] font-bold flex items-center justify-center hover:bg-indigo-100 hover:text-indigo-600 transition-colors cursor-default select-none leading-none">
        ?
      </span>
      <span
        className={`absolute bottom-full left-1/2 -translate-x-1/2 mb-2 ${WIDTH_MAP[width]} bg-gray-900 text-white text-xs rounded-xl px-3 py-2.5 leading-relaxed opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 z-50 shadow-xl`}
      >
        {text}
        {/* Arrow */}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900" />
      </span>
    </span>
  );
}
