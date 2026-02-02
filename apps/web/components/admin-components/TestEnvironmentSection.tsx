import { InputGroup, TextInput } from "./InputsAdmin";

interface TestEnvironmentSectionProps {
  testConfig: { timeoutMs: number; memoryMb: number };
  onTestConfigChange: (field: "timeoutMs" | "memoryMb", value: number) => void;
}

export default function TestEnvironmentSection({
  testConfig,
  onTestConfigChange,
}: TestEnvironmentSectionProps) {
  return (
    <div className="bg-zinc-900/40 border border-white/5 rounded-xl p-6">
      <h2 className="text-lg font-bold text-white mb-6">Test Environment</h2>
      <div className="space-y-4">
        <InputGroup label="Timeout (ms)">
          <TextInput
            value={testConfig.timeoutMs.toString()}
            onchange={(val) => onTestConfigChange("timeoutMs", parseInt(val) || 0)}
          />
        </InputGroup>
        <InputGroup label="Memory Limit (MB)">
          <TextInput
            value={testConfig.memoryMb.toString()}
            onchange={(val) => onTestConfigChange("memoryMb", parseInt(val) || 0)}
          />
        </InputGroup>
      </div>
    </div>
  );
}
