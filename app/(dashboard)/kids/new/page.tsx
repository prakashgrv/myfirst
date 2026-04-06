import KidForm from "@/components/kids/KidForm";

export default function NewKidPage() {
  return (
    <div className="max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Add a Kid</h1>
        <p className="text-gray-500 mt-1">Register a child to start managing their schedule.</p>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <KidForm />
      </div>
    </div>
  );
}
