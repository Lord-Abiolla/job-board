export default function Select({
    label,
    value,
    onChange,
    options,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    options: [string, string][];
}) {
    return (
        <label className="flex flex-col gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <span className="text-xs font-medium text-slate-600">{label}</span>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-transparent text-sm text-slate-900 outline-none"
            >
                {options.map(([val, text]) => (
                    <option key={val} value={val}>
                        {text}
                    </option>
                ))}
            </select>
        </label>
    );
}