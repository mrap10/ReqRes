interface SocialButtonProps {
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  label: string;
  onclick: () => void;
  disabled?: boolean;
}

export default function SocialButton({
  icon: Icon,
  label,
  onclick,
  disabled = false,
}: SocialButtonProps) {
  return (
    <button
      onClick={onclick}
      disabled={disabled}
      className="flex items-center justify-center gap-3 w-full py-3 cursor-pointer bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 rounded-xl transition-all group"
    >
      <Icon className="w-5 h-5 text-white group-hover:scale-110 transition-transform" />
      <span className="text-zinc-300 font-medium text-sm group-hover:text-white">{label}</span>
    </button>
  );
}
