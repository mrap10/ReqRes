import { ChevronRight } from "lucide-react";

interface InputGroupProps {
  label: string;
  children: React.ReactNode;
  description?: string;
  required?: boolean;
  for?: string;
}

interface TextInputProps {
  placeholder?: string;
  value: string;
  onchange: (value: string) => void;
  className?: string;
}

interface SelectInputProps {
  options: { label: string; value: string }[];
  value: string;
  name?: string;
  onchange: (value: string) => void;
}

interface TextAreaProps {
  placeholder?: string;
  value: string;
  onchange: (value: string) => void;
  rows?: number;
  fontMono?: boolean;
}

export function InputGroup({
  label,
  children,
  description,
  required,
  for: htmlFor,
}: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label
        htmlFor={htmlFor}
        className="text-sm font-semibold text-zinc-400 tracking-wider flex items-center gap-1"
      >
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {description && <p className="text-[10px] text-zinc-500">{description}</p>}
    </div>
  );
}

export function TextInput({ placeholder, value, onchange, className }: TextInputProps) {
  return (
    <input
      type="text"
      placeholder={placeholder}
      value={value}
      onChange={(e) => onchange(e.target.value)}
      className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-600 transition-colors ${className}`}
    />
  );
}

export function SelectInput({ options, value, onchange, name }: SelectInputProps) {
  return (
    <div className="relative">
      <select
        name={name}
        value={value}
        onChange={(e) => onchange(e.target.value)}
        className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-2.5 text-sm text-white appearance-none focus:outline-none focus:border-indigo-500 cursor-pointer"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
        <ChevronRight className="w-4 h-4 rotate-90" />
      </div>
    </div>
  );
}

export function TextArea({
  placeholder,
  value,
  onchange,
  rows = 4,
  fontMono = false,
}: TextAreaProps) {
  return (
    <textarea
      value={value}
      placeholder={placeholder}
      onChange={(e) => onchange(e.target.value)}
      rows={rows}
      className={`w-full bg-zinc-950 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-zinc-300  focus:outline-none focus:border-indigo-500 transition-colors resize-y ${fontMono ? "font-mono" : "font-sans"}`}
    />
  );
}

// yep, i know i have violated React components best practice rule, but i didnt want to create a new file for each of these small components
