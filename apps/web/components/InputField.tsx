interface InputFieldProps {
  label: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  type: string;
  placeholder: string;
  inputValue: string;
  onchange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  disabled?: boolean;
}

export default function InputField({
  label,
  icon: Icon,
  type,
  placeholder,
  inputValue,
  onchange,
  disabled,
}: InputFieldProps) {
  return (
    <div className="space-y-2 group">
      <label
        htmlFor={type}
        className="text-xs text-zinc-500 tracking-wider group-focus-within:text-white transition-colors"
      >
        {label}
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Icon className="h-5 w-5 text-zinc-600 group-focus-within:text-white transition-colors" />
        </div>
        <input
          id={type}
          type={type}
          value={inputValue}
          onChange={onchange}
          disabled={disabled}
          className="block w-full pl-10 pr-3 py-3 text-sm bg-zinc-900/50 border border-zinc-800 rounded-xl text-zinc-200 placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 focus:border-indigo-300/50 transition-all"
          placeholder={placeholder}
        />
      </div>
    </div>
  );
}
