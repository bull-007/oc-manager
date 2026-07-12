import OcForm from "@/components/oc/OcForm";

export default function NewOCPage() {
  return (
    <div className="max-w-4xl mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="text-2xl font-serif font-bold text-warm-brown">
          创建新 OC
        </h1>
        <p className="text-warm-muted text-sm mt-1">
          填写角色信息，打造你的原创角色
        </p>
      </div>
      <OcForm />
    </div>
  );
}
