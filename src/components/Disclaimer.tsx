import { AlertTriangle } from "lucide-react";

export default function Disclaimer() {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
      <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
      <p className="text-sm text-muted-foreground">
        <strong className="text-foreground">Disclaimer:</strong> This is an AI-based suggestion and not a medical diagnosis.
        Always consult a qualified healthcare professional for medical advice.
      </p>
    </div>
  );
}
